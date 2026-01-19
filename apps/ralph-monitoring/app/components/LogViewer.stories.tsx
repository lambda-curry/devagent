import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import type { ReactNode } from 'react';
import { useLayoutEffect } from 'react';
import { LogViewer } from '~/components/LogViewer';
import { Toaster } from '~/components/ui/sonner';

class MockEventSource {
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    // Simulate a successful connection without streaming real data.
    window.setTimeout(() => this.onopen?.(new Event('open')), 0);
  }

  addEventListener(_type: string, _listener: EventListenerOrEventListenerObject) {}
  close() {}
}

function MockLogApis({ children }: { children: ReactNode }) {
  // `LogViewer` fetches in `useEffect()`. Use `useLayoutEffect()` here so the mock
  // is installed before child effects run (deterministic in interaction tests).
  useLayoutEffect(() => {
    const originalFetch = window.fetch.bind(window);
    const OriginalEventSource = window.EventSource;

    // Keep the mock narrow: only intercept log endpoints; let everything else pass through.
    const mockedFetch: typeof window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
      if (url.startsWith('/api/logs/')) {
        return new Response(
          JSON.stringify({
            logs: [
              '[12:00:00] starting task…',
              '[12:00:01] running quality gates…',
              '[12:00:02] done.'
            ].join('\n')
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }
      return originalFetch(input, init);
    };

    Object.defineProperty(window, 'fetch', {
      value: mockedFetch,
      configurable: true,
      writable: true
    });

    window.EventSource = MockEventSource as unknown as typeof EventSource;

    return () => {
      Object.defineProperty(window, 'fetch', {
        value: originalFetch,
        configurable: true,
        writable: true
      });
      window.EventSource = OriginalEventSource;
    };
  }, []);

  return children;
}

const meta = {
  title: 'components/LogViewer',
  component: LogViewer,
  args: {
    taskId: 'devagent-20e9.4'
  },
  parameters: {
    docs: {
      description: {
        component:
          'This component uses EventSource + fetch + clipboard. The story mocks `EventSource` and `/api/logs/*` fetches (via a per-story decorator) so it renders deterministically in Storybook.'
      }
    }
  },
  decorators: [
    (Story) => (
      <MockLogApis>
        <Story />
      </MockLogApis>
    )
  ]
} satisfies Meta<typeof LogViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mocked: Story = {
  render: (args) => (
    <div className="space-y-4">
      <LogViewer {...args} />
      <Toaster />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(/^logs$/i)).toBeInTheDocument();
    await expect(await canvas.findByText(/\[12:00:01\] running quality gates/i)).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /pause streaming/i })).toBeInTheDocument();
  }
};
