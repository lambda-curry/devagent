/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LogViewer } from '../LogViewer';
import { createRoutesStub } from '~/lib/test-utils/router';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

class MockEventSource {
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readyState = 0;
  close = vi.fn();
  private listeners: Record<string, Array<(event: MessageEvent) => void>> = {};

  constructor(url: string) {
    this.url = url;
  }

  addEventListener(type: string, handler: (event: MessageEvent) => void) {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(handler);
  }

  simulateOpen() {
    this.readyState = 1;
    this.onopen?.(new Event('open'));
  }

  simulateMessage(data: string) {
    this.onmessage?.(new MessageEvent('message', { data }));
  }

  simulateError() {
    this.readyState = 2;
    this.onerror?.(new Event('error'));
  }

  simulateStreamError(data: string) {
    const handlers = this.listeners.error || [];
    const event = new MessageEvent('error', { data });
    for (const handler of handlers) {
      handler(event);
    }
  }
}

let mockEventSourceInstance: MockEventSource | null = null;

global.EventSource = vi.fn((url: string) => {
  mockEventSourceInstance = new MockEventSource(url);
  return mockEventSourceInstance as unknown as EventSource;
}) as unknown as typeof EventSource;

global.fetch = vi.fn();



describe('LogViewer', () => {
  const taskId = 'test-task-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockEventSourceInstance = null;
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ logs: '' })
    } as Response);
  });

  afterEach(() => {
    vi.useRealTimers();
    mockEventSourceInstance = null;
    cleanup();
  });

  const renderLogViewer = (props: { isTaskActive: boolean; hasLogs: boolean; hasExecutionHistory?: boolean }) => {
    const RouteComponent = () => (
      <LogViewer
        taskId={taskId}
        isTaskActive={props.isTaskActive}
        hasLogs={props.hasLogs}
        hasExecutionHistory={props.hasExecutionHistory ?? true}
      />
    );
    const Stub = createRoutesStub([{ path: '/', Component: RouteComponent }]);
    return render(<Stub initialEntries={['/']} />);
  };

  const flushEffects = async () => {
    // Allow React effects + queued microtasks to run.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  it('inactive: does not attempt streaming and shows a non-error state', async () => {
    renderLogViewer({ isTaskActive: false, hasLogs: false });

    expect(global.EventSource).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();

    expect(await screen.findByText(/No live logs for inactive tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/^Inactive$/i)).toBeInTheDocument();
  });

  it('inactive-with-logs: loads static logs without attempting streaming', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ logs: 'Static log content' })
    } as Response);

    renderLogViewer({ isTaskActive: false, hasLogs: true });

    expect(global.EventSource).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText(/Static log content/i)).toBeInTheDocument();
    expect(screen.getByText(/^Inactive$/i)).toBeInTheDocument();
    expect(global.EventSource).not.toHaveBeenCalled();
  });

  it('active-waiting: shows waiting-for-logs and retries with backoff (bounded)', async () => {
    vi.useFakeTimers();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        error: 'Log file not found for task ID',
        code: 'NOT_FOUND',
        expectedLogPath: '<RALPH_LOG_DIR>/test-task-123.log',
        envVarsConsulted: ['RALPH_LOG_DIR', 'REPO_ROOT']
      })
    } as unknown as Response);

    renderLogViewer({ isTaskActive: true, hasLogs: false });

    // "waiting" renders both a header status and a body message; assert via the attempt counter (unique).
    expect(global.EventSource).not.toHaveBeenCalled();

    await flushEffects();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Attempt 1\/6/i)).toBeInTheDocument();

    // First backoff delay is 0.5s; advancing should trigger another probe.
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/Attempt 2\/6/i)).toBeInTheDocument();
    expect(global.EventSource).not.toHaveBeenCalled();
  });

  it('active-streaming: transitions from waiting to streaming once logs exist', async () => {
    vi.useFakeTimers();
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Log file not found for task ID',
          code: 'NOT_FOUND'
        })
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ logs: 'Static log content' })
      } as unknown as Response);

    renderLogViewer({ isTaskActive: true, hasLogs: false });
    expect(global.EventSource).not.toHaveBeenCalled();

    // Attempt 1 (404) runs immediately after mount.
    await flushEffects();
    expect(screen.getByText(/Attempt 1\/6/i)).toBeInTheDocument();
    expect(global.EventSource).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(global.EventSource).toHaveBeenCalledWith(`/api/logs/${taskId}/stream`);
    expect(mockEventSourceInstance).not.toBeNull();

    await act(async () => {
      mockEventSourceInstance?.simulateOpen();
      mockEventSourceInstance?.simulateMessage('Log line 1');
    });

    expect(screen.getByText(/Streaming/i)).toBeInTheDocument();
    expect(screen.getByText(/Log line 1/i)).toBeInTheDocument();
  });

  it('active-missing-after-retries: shows final missing-logs UI with diagnostics', async () => {
    vi.useFakeTimers();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        error: `Log file not found for task ID: ${taskId}`,
        code: 'NOT_FOUND',
        expectedLogPath: '<REPO_ROOT|cwd>/logs/ralph/test-task-123.log',
        expectedLogDirectory: '<REPO_ROOT|cwd>/logs/ralph',
        envVarsConsulted: ['RALPH_LOG_DIR', 'REPO_ROOT'],
        diagnostics: {
          expectedLogDirectoryTemplate: '<REPO_ROOT|cwd>/logs/ralph',
          expectedLogPathTemplate: '<REPO_ROOT|cwd>/logs/ralph/test-task-123.log',
          defaultRelativeLogDir: 'logs/ralph',
          expectedLogFileName: 'test-task-123.log',
          envVarsConsulted: ['RALPH_LOG_DIR', 'REPO_ROOT'],
          envVarIsSet: { RALPH_LOG_DIR: false, REPO_ROOT: false },
          resolvedStrategy: 'cwd'
        }
      })
    } as unknown as Response);

    renderLogViewer({ isTaskActive: true, hasLogs: false });

    // Attempt 1 happens on mount; then we advance through the bounded retry schedule.
    await flushEffects();
    const retryDelaysMs = [500, 1000, 2000, 4000, 8000];
    for (const delayMs of retryDelaysMs) {
      await act(async () => {
        vi.advanceTimersByTime(delayMs);
        await Promise.resolve();
        await Promise.resolve();
      });
    }

    expect(screen.getByText(/Unable to load logs/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Expected path:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Env vars consulted:/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Diagnostics/i)).toBeInTheDocument();

    // No streaming should be attempted since the file never appeared.
    expect(global.EventSource).not.toHaveBeenCalled();

    // Bounded retry window: initial probe + (maxAttempts - 1) scheduled probes.
    expect(global.fetch).toHaveBeenCalledTimes(6);
  });

  it('pauses and resumes log updates', async () => {
    const user = userEvent.setup();
    renderLogViewer({ isTaskActive: true, hasLogs: true });

    await waitFor(() => {
      expect(mockEventSourceInstance).not.toBeNull();
    });

    await act(async () => {
      mockEventSourceInstance?.simulateOpen();
      mockEventSourceInstance?.simulateMessage('Log line 1');
    });

    await waitFor(() => {
      expect(screen.getByText(/Log line 1/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Pause streaming/i }));
    await act(async () => {
      mockEventSourceInstance?.simulateMessage('Log line 2');
    });

    await waitFor(() => {
      expect(screen.queryByText(/Log line 2/i)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Resume streaming/i }));
    await act(async () => {
      mockEventSourceInstance?.simulateMessage('Log line 3');
    });

    await waitFor(() => {
      expect(screen.getByText(/Log line 3/i)).toBeInTheDocument();
    });
  });

  it('can recover from a non-recoverable stream error via manual retry', async () => {
    const user = userEvent.setup();
    renderLogViewer({ isTaskActive: true, hasLogs: true });

    await waitFor(() => {
      expect(mockEventSourceInstance).not.toBeNull();
    });

    await act(async () => {
      mockEventSourceInstance?.simulateStreamError(
        JSON.stringify({ error: 'Log file not found', code: 'NOT_FOUND' })
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText(/Log file not found/i).length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: /Retry loading logs/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Retry loading logs/i }));

    await waitFor(() => {
      expect(global.EventSource).toHaveBeenCalledTimes(2);
      expect(mockEventSourceInstance).not.toBeNull();
    });

    await act(async () => {
      mockEventSourceInstance?.simulateOpen();
    });

    await waitFor(() => {
      expect(screen.getByText(/Streaming/i)).toBeInTheDocument();
    });
  });

  // Copy-to-clipboard behavior is covered by browser integration tests.
});
