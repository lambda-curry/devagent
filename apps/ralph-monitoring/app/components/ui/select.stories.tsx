import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';

function SelectDemo() {
  const [value, setValue] = useState('all');
  return (
    <div className="max-w-xs">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger aria-label="Status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="blocked">Blocked</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

const meta = {
  title: 'ui/Select',
  component: SelectDemo
} satisfies Meta<typeof SelectDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interaction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: /status/i });

    await userEvent.click(trigger);
    const listbox = within(document.body).getByRole('listbox');
    await userEvent.click(within(listbox).getByRole('option', { name: /^blocked$/i }));

    await expect(trigger).toHaveTextContent(/blocked/i);
  }
};
