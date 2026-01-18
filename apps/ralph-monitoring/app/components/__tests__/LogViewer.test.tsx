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

  const renderLogViewer = () => {
    const RouteComponent = () => <LogViewer taskId={taskId} />;
    const Stub = createRoutesStub([{ path: '/', Component: RouteComponent }]);
    return render(<Stub initialEntries={['/']} />);
  };

  it('creates an SSE connection and shows streaming when open', async () => {
    renderLogViewer();

    expect(global.EventSource).toHaveBeenCalledWith(`/api/logs/${taskId}/stream`);
    expect(screen.getByText(/Disconnected/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockEventSourceInstance).not.toBeNull();
    });

    await act(async () => {
      mockEventSourceInstance?.simulateOpen();
    });

    await waitFor(() => {
      expect(screen.getByText(/Streaming/i)).toBeInTheDocument();
    });
  });

  it('appends log lines from SSE messages', async () => {
    renderLogViewer();

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
  });

  it('falls back to static logs on connection error', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ logs: 'Static log content' })
    } as Response);

    renderLogViewer();

    await waitFor(() => {
      expect(mockEventSourceInstance).not.toBeNull();
    });

    await act(async () => {
      mockEventSourceInstance?.simulateError();
    });

    await waitFor(() => {
      expect(screen.getByText(/Static log content/i)).toBeInTheDocument();
    });
  });

  it('pauses and resumes log updates', async () => {
    const user = userEvent.setup();
    renderLogViewer();

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

  // Copy-to-clipboard behavior is covered by browser integration tests.
});
