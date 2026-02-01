import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Comments } from '~/components/Comments';

const meta = {
  title: 'components/Comments',
  component: Comments,
  argTypes: {
    taskId: { control: 'text' }
  }
} satisfies Meta<typeof Comments>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    taskId: 'task-1',
    comments: []
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/no comments yet/i)).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /add comment/i })).toBeInTheDocument();
  }
};

export const WithMarkdown: Story = {
  args: {
    taskId: 'task-1',
    comments: [
      {
        id: 1,
        author: 'Claude',
        created_at: new Date('2026-01-18T12:00:00.000Z').toISOString(),
        body: [
          'Commit: `abc123` - feat(ui): add stories (devagent-20e9.4)',
          '',
          'Revision Learning:',
          '**Category**: Process',
          '',
          '- Bullet',
          '- `inline code`'
        ].join('\n')
      }
    ]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/comments \(1\)/i)).toBeInTheDocument();
    await expect(canvas.getByText('Claude')).toBeInTheDocument();
    await expect(canvas.getByText(/revision learning/i)).toBeInTheDocument();
    await expect(canvas.getByText(/category/i)).toBeInTheDocument();
    await expect(canvas.getByText(/inline code/i)).toBeInTheDocument();
  }
};

export const MultipleComments: Story = {
  args: {
    taskId: 'task-1',
    comments: [
      {
        id: 1,
        author: 'User',
        created_at: new Date('2026-01-18T14:00:00.000Z').toISOString(),
        body: 'This is the latest comment (newest first).'
      },
      {
        id: 2,
        author: 'Claude',
        created_at: new Date('2026-01-18T12:00:00.000Z').toISOString(),
        body: '**Progress update**: Task is on track.'
      },
      {
        id: 3,
        author: 'Ralph',
        created_at: new Date('2026-01-18T10:00:00.000Z').toISOString(),
        body: 'Task started. Initial analysis complete.'
      }
    ]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/comments \(3\)/i)).toBeInTheDocument();
    await expect(canvas.getByText('User')).toBeInTheDocument();
    await expect(canvas.getByText('Claude')).toBeInTheDocument();
    await expect(canvas.getByText('Ralph')).toBeInTheDocument();
  }
};
