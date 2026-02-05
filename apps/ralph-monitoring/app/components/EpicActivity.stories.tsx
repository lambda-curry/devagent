import type { Meta, StoryObj } from '@storybook/react';
import type { EpicActivityItem } from '~/db/beads.types';
import { EpicActivity } from '~/components/EpicActivity';

const baseTime = new Date('2026-02-03T10:00:00Z').toISOString();

const mockItems: EpicActivityItem[] = [
  {
    type: 'execution',
    timestamp: baseTime,
    task_id: 'devagent-mobile-epic-activity-2026-02-03.3',
    agent_type: 'engineering',
    started_at: baseTime,
    ended_at: new Date(Date.parse(baseTime) + 60_000).toISOString(),
    status: 'success',
    iteration: 1,
  },
  {
    type: 'comment',
    timestamp: new Date(Date.parse(baseTime) + 30_000).toISOString(),
    task_id: 'devagent-mobile-epic-activity-2026-02-03.3',
    comment_id: 1,
    author: 'Ralph',
    body: 'Commit: abc1234 - feat(epic): add activity UI\n\n- EpicActivity, EpicCommitList, EpicMetaCard',
    commit: { sha: 'abc1234567890', message: 'feat(epic): add activity UI' },
  },
  {
    type: 'status',
    timestamp: new Date(Date.parse(baseTime) + 90_000).toISOString(),
    task_id: 'devagent-mobile-epic-activity-2026-02-03.3',
    status: 'closed',
    title: 'Design Review: Epic Activity UI',
  },
];

const taskIdToTitle: Record<string, string> = {
  'devagent-mobile-epic-activity-2026-02-03.3': 'Design Review: Epic Activity UI',
};

const meta = {
  title: 'components/EpicActivity',
  component: EpicActivity,
  argTypes: {
    items: { control: false },
    taskIdToTitle: { control: false },
  },
} satisfies Meta<typeof EpicActivity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithActivity: Story = {
  args: {
    items: mockItems,
    taskIdToTitle,
  },
};

export const Empty: Story = {
  args: {
    items: [],
    taskIdToTitle: {},
  },
};

export const WithActivityDark: Story = {
  ...WithActivity,
  parameters: { theme: 'dark' },
};

export const EmptyDark: Story = {
  ...Empty,
  parameters: { theme: 'dark' },
};
