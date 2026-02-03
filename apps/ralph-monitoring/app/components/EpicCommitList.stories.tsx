import type { Meta, StoryObj } from '@storybook/react';
import type { EpicActivityItem } from '~/db/beads.types';
import { EpicCommitList } from '~/components/EpicCommitList';

const baseTime = new Date('2026-02-03T10:00:00Z').toISOString();

const mockActivityWithCommits: EpicActivityItem[] = [
  {
    type: 'comment',
    timestamp: baseTime,
    task_id: 'task-1',
    comment_id: 1,
    author: 'Ralph',
    body: 'Commit: abc1234567890 - feat(epic): add activity UI',
    commit: { sha: 'abc1234567890', message: 'feat(epic): add activity UI' },
  },
  {
    type: 'comment',
    timestamp: new Date(Date.parse(baseTime) + 60_000).toISOString(),
    task_id: 'task-1',
    comment_id: 2,
    author: 'Ralph',
    body: 'Commit: def5678 - fix(epic): spacing tokens',
    commit: { sha: 'def5678901234', message: 'fix(epic): spacing tokens' },
  },
];

const meta = {
  title: 'components/EpicCommitList',
  component: EpicCommitList,
  argTypes: {
    activityItems: { control: false },
  },
} satisfies Meta<typeof EpicCommitList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCommits: Story = {
  args: {
    activityItems: mockActivityWithCommits,
    repoUrl: 'https://github.com/org/repo',
  },
};

export const WithCommitsNoRepo: Story = {
  args: {
    activityItems: mockActivityWithCommits,
    repoUrl: null,
  },
};

export const Empty: Story = {
  args: {
    activityItems: [],
    repoUrl: 'https://github.com/org/repo',
  },
};

export const WithCommitsDark: Story = {
  ...WithCommits,
  parameters: { theme: 'dark' },
};

export const EmptyDark: Story = {
  ...Empty,
  parameters: { theme: 'dark' },
};
