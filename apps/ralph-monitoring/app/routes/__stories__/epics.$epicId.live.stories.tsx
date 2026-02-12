import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import type { ComponentType, ReactNode } from 'react';
import { useLayoutEffect } from 'react';
import { EpicLiveView, type EpicLiveViewTask } from '~/components/EpicLiveView';

const MOCK_EPIC_ID = 'devagent-mobile-loop-ux-polish-2026-02-12';
const MOCK_TASK: EpicLiveViewTask = {
  id: 'devagent-mobile-loop-ux-polish-2026-02-12.2',
  title: 'Storybook Story: Fullscreen Live Log Viewer',
};

/** Mock EventSource that opens immediately (no streaming). */
class MockEventSourceIdle {
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    window.setTimeout(() => this.onopen?.(new Event('open')), 0);
  }

  addEventListener(_type: string, _listener: EventListenerOrEventListenerObject) {}
  close() {}
}

/**
 * Mock EventSource that opens after a delay (connecting state), then sends
 * log lines on a timer to simulate streaming.
 */
function createStreamingMockEventSource(options?: {
  openDelayMs?: number;
  messageIntervalMs?: number;
  lines?: string[];
}) {
  const openDelayMs = options?.openDelayMs ?? 200;
  const messageIntervalMs = options?.messageIntervalMs ?? 600;
  const lines =
    options?.lines ??
    [
      '[12:00:00] Starting task…',
      '[12:00:01] Running quality gates…',
      '[12:00:02] Lint passed.',
      '[12:00:03] Typecheck passed.',
      '[12:00:04] Tests passed.',
      '[12:00:05] Build complete.',
    ];

  return class MockEventSourceStreaming {
    url: string;
    onopen: ((event: Event) => void) | null = null;
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    private timerId: number | null = null;
    private openTimerId: number | null = null;
    private closed = false;

    constructor(url: string) {
      this.url = url;
      this.openTimerId = window.setTimeout(() => {
        this.openTimerId = null;
        if (!this.closed) this.onopen?.(new Event('open'));
        this.timerId = window.setInterval(() => {
          if (this.closed || !this.onmessage) return;
          const line = lines[Math.floor(Math.random() * lines.length)];
          this.onmessage(new MessageEvent('message', { data: line }));
        }, messageIntervalMs);
      }, openDelayMs);
    }

    addEventListener(_type: string, _listener: EventListenerOrEventListenerObject) {}
    close() {
      this.closed = true;
      if (this.openTimerId != null) clearTimeout(this.openTimerId);
      if (this.timerId != null) clearInterval(this.timerId);
    }
  };
}

function MockEventSourceDecorator({
  children,
  useStreaming,
  openDelayMs,
}: {
  children: ReactNode;
  useStreaming?: boolean;
  openDelayMs?: number;
}) {
  useLayoutEffect(() => {
    const OriginalEventSource = window.EventSource;
    const MockClass = useStreaming
      ? createStreamingMockEventSource({ openDelayMs: openDelayMs ?? 300, messageIntervalMs: 500 })
      : MockEventSourceIdle;
    window.EventSource = MockClass as unknown as typeof EventSource;
    return () => {
      window.EventSource = OriginalEventSource;
    };
  }, [useStreaming, openDelayMs]);

  return <>{children}</>;
}

const meta = {
  title: 'routes/Epic Live (fullscreen log)',
  component: EpicLiveView,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile375',
    },
    docs: {
      description: {
        component:
          'Fullscreen live log view for an epic. Uses EventSource for streaming; stories mock EventSource and loader data (epicId, currentTask, runStatus). Tap log area to pause auto-scroll; use "Resume auto-scroll" to resume. Mobile viewport (375px) by default.',
      },
    },
  },
  decorators: [
    (Story: ComponentType, context: { parameters?: { mockEventSource?: 'idle' | 'streaming'; openDelayMs?: number } }) => {
      const params = context.parameters?.mockEventSource ?? 'idle';
      const openDelayMs = context.parameters?.openDelayMs;
      const useStreaming = params === 'streaming';
      return (
        <MockEventSourceDecorator useStreaming={useStreaming} openDelayMs={openDelayMs}>
          <Story />
        </MockEventSourceDecorator>
      );
    },
  ],
  argTypes: {
    epicId: { control: 'text' },
    runStatus: { control: 'select', options: ['idle', 'running', 'paused'] },
  },
} satisfies Meta<typeof EpicLiveView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** No active task — idle state. */
export const Idle: Story = {
  args: {
    epicId: MOCK_EPIC_ID,
    epicTitle: 'Mobile Loop UX Polish',
    currentTask: null,
    runStatus: 'idle',
  },
  parameters: {
    mockEventSource: 'idle',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/no active task/i)).toBeInTheDocument();
    await expect(canvas.getByText(/idle/i)).toBeInTheDocument();
  },
};

/** Connecting to stream (mock delays open). */
export const Connecting: Story = {
  args: {
    epicId: MOCK_EPIC_ID,
    epicTitle: 'Mobile Loop UX Polish',
    currentTask: MOCK_TASK,
    runStatus: 'running',
  },
  parameters: {
    mockEventSource: 'streaming',
    openDelayMs: 2000,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(MOCK_TASK.title)).toBeInTheDocument();
    await expect(canvas.getByText(/connecting to log stream/i)).toBeInTheDocument();
  },
};

/** Streaming logs (mock opens and sends lines on a timer). */
export const Streaming: Story = {
  args: {
    epicId: MOCK_EPIC_ID,
    epicTitle: 'Mobile Loop UX Polish',
    currentTask: MOCK_TASK,
    runStatus: 'running',
  },
  parameters: {
    mockEventSource: 'streaming',
    openDelayMs: 200,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(MOCK_TASK.title)).toBeInTheDocument();
    await expect(canvas.getByText(/running/i)).toBeInTheDocument();
    await expect(await canvas.findByText(/\[12:00:/i, {}, { timeout: 3000 })).toBeInTheDocument();
  },
};

/** Tap-to-pause and resume: streaming then user taps log area to pause, then Resume. */
export const Paused: Story = {
  args: {
    epicId: MOCK_EPIC_ID,
    epicTitle: 'Mobile Loop UX Polish',
    currentTask: MOCK_TASK,
    runStatus: 'running',
  },
  parameters: {
    mockEventSource: 'streaming',
    openDelayMs: 200,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(/\[12:00:/i, {}, { timeout: 3000 })).toBeInTheDocument();
    const logArea = canvas.getByRole('log');
    await logArea.click();
    await expect(canvas.getByRole('button', { name: /resume auto-scroll/i })).toBeInTheDocument();
    await canvas.getByRole('button', { name: /resume auto-scroll/i }).click();
    await expect(canvas.queryByRole('button', { name: /resume auto-scroll/i })).not.toBeInTheDocument();
  },
};

/** Loop run is paused (runStatus from server). */
export const RunPaused: Story = {
  args: {
    epicId: MOCK_EPIC_ID,
    epicTitle: 'Mobile Loop UX Polish',
    currentTask: MOCK_TASK,
    runStatus: 'paused',
  },
  parameters: {
    mockEventSource: 'streaming',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/paused/i)).toBeInTheDocument();
  },
};
