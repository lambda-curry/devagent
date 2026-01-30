import type { Meta, StoryObj } from '@storybook/react';
import { data } from 'react-router';
import { LoopControlPanel } from '~/components/LoopControlPanel';
import type { EpicTask } from '~/db/beads.server';

const loopApiRoutes = [
  {
    path: 'api/loop/start',
    action: async () => data({ success: true, message: 'Started' }),
  },
  {
    path: 'api/loop/pause',
    action: async () => data({ success: true, message: 'Paused' }),
  },
  {
    path: 'api/loop/resume',
    action: async () => data({ success: true, message: 'Resumed' }),
  },
  {
    path: 'api/loop/skip/:taskId',
    action: async () => data({ success: true, message: 'Skip signal created' }),
  },
];

const meta = {
  title: 'components/LoopControlPanel',
  component: LoopControlPanel,
  parameters: {
    rrRouter: { extraRoutes: loopApiRoutes },
    docs: {
      description: {
        component:
          'Control panel for Ralph loop: start, pause/resume, and skip current task. Uses useFetcher and useRevalidator; stories provide API route stubs. **Design note:** Pause/Resume/Skip use native `window.confirm` in the app; for design-system consistency and accessibility, these should be replaced with a shared AlertDialog (see design review on task devagent-ralph-dashboard-2026-01-30.control-panel-design).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoopControlPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseTask = {
  id: 'epic-1.a',
  title: 'Sample task',
  description: null,
  design: null,
  acceptance_criteria: null,
  notes: null,
  priority: null,
  parent_id: 'epic-1',
  created_at: '2026-01-30T10:00:00Z',
  updated_at: '2026-01-30T11:00:00Z',
  duration_ms: null,
  agent_type: null,
} as const;

const idleTasks: EpicTask[] = [];
const runningTasks: EpicTask[] = [];
const inProgressTask: EpicTask[] = [
  {
    ...baseTask,
    id: 'epic-1.b',
    title: 'Current task in progress',
    status: 'in_progress',
  } as EpicTask,
];

export const Idle: Story = {
  args: {
    epicId: 'epic-1',
    runStatus: 'idle',
    tasks: idleTasks,
  },
  parameters: {
    docs: { description: { story: 'Loop stopped. Start button is enabled.' } },
  },
};

export const Running: Story = {
  args: {
    epicId: 'epic-1',
    runStatus: 'running',
    tasks: runningTasks,
  },
  parameters: {
    docs: { description: { story: 'Loop running. Pause button is shown.' } },
  },
};

export const Paused: Story = {
  args: {
    epicId: 'epic-1',
    runStatus: 'paused',
    tasks: runningTasks,
  },
  parameters: {
    docs: { description: { story: 'Loop paused. Resume button is shown.' } },
  },
};

export const RunningWithInProgressTask: Story = {
  args: {
    epicId: 'epic-1',
    runStatus: 'running',
    tasks: inProgressTask,
  },
  parameters: {
    docs: {
      description: {
        story: 'Loop running with one task in progress. Skip button for that task is shown.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    epicId: 'epic-1',
    runStatus: 'idle',
    tasks: idleTasks,
    disabled: true,
  },
  parameters: {
    docs: { description: { story: 'All controls disabled.' } },
  },
};

/** Narrow viewport: panel wraps buttons; no horizontal overflow. Use viewport addon to verify at 320px. */
export const NarrowViewport: Story = {
  args: {
    epicId: 'epic-1',
    runStatus: 'running',
    tasks: inProgressTask,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story:
          'Layout at narrow viewport (320px). Buttons wrap via flex-wrap; gap and padding use design tokens. Verifies "layout works at different viewport sizes".',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', minWidth: 0 }}>
        <Story />
      </div>
    ),
  ],
};
