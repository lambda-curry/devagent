import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from '~/components/ProgressBar';

const meta = {
  title: 'components/ProgressBar',
  component: ProgressBar,
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    color: {
      control: 'select',
      options: ['primary', 'muted', 'destructive', 'secondary', 'accent']
    },
    showAnimation: { control: 'boolean' }
  }
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 65,
    label: '65%'
  }
};

export const NoLabel: Story = {
  args: {
    value: 40
  }
};

export const Full: Story = {
  args: {
    value: 100,
    label: '100%'
  }
};

export const Empty: Story = {
  args: {
    value: 0,
    label: '0%'
  }
};

export const Primary: Story = {
  args: {
    value: 75,
    label: '75%',
    color: 'primary'
  }
};

export const Destructive: Story = {
  args: {
    value: 90,
    label: '90%',
    color: 'destructive'
  }
};

export const Muted: Story = {
  args: {
    value: 33,
    label: '33%',
    color: 'muted'
  }
};

export const WithAnimation: Story = {
  args: {
    value: 60,
    label: '60%',
    showAnimation: true
  }
};
