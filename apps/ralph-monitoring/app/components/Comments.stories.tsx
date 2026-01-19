import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Comments } from '~/components/Comments';

const meta = {
  title: 'components/Comments',
  component: Comments,
} satisfies Meta<typeof Comments>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    comments: []
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/no comments yet/i)).toBeInTheDocument();
  }
};

export const WithMarkdown: Story = {
  args: {
    comments: [
      {
        created_at: new Date('2026-01-18T12:00:00.000Z').toISOString(),
        body: [
          'Commit: `abc123` - feat(ui): add stories (devagent-20e9.4)',
          '',
          'Revision Learning:',
          '**Category**: Process',
          '',
          '- Bullet',
          '- `inline code`',
        ].join('\n')
      }
    ]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/comments \(1\)/i)).toBeInTheDocument();
    await expect(canvas.getByText(/revision learning/i)).toBeInTheDocument();
    await expect(canvas.getByText(/category/i)).toBeInTheDocument();
    await expect(canvas.getByText(/inline code/i)).toBeInTheDocument();
  }
};
