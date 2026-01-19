import type { Meta, StoryObj } from '@storybook/react';
import { FileText } from 'lucide-react';
import { expect, within } from '@storybook/test';
import { MarkdownSection } from '~/components/MarkdownSection';

const meta = {
  title: 'components/MarkdownSection',
  component: MarkdownSection,
  args: {
    title: 'Description',
    icon: FileText,
    content: [
      'This section renders markdown from task fields.',
      '',
      '- Supports lists',
      '- `inline code`',
      '',
      '```ts',
      "const taskId = 'devagent-20e9.4';",
      '```'
    ].join('\n')
  }
} satisfies Meta<typeof MarkdownSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: /description/i })).toBeInTheDocument();
    await expect(canvas.getByText(/supports lists/i)).toBeInTheDocument();
    await expect(canvas.getByText(/inline code/i)).toBeInTheDocument();
  }
};

export const EmptyContent: Story = {
  args: {
    content: ''
  },
  render: (args) => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        When content is empty, the component returns <code>null</code>.
      </p>
      <MarkdownSection {...args} />
    </div>
  )
};
