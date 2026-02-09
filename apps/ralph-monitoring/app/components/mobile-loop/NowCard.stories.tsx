import type { Meta, StoryObj } from '@storybook/react';
import { NowCard } from '~/components/mobile-loop/NowCard';

const meta = {
  title: 'mobile-loop/NowCard',
  component: NowCard,
  parameters: {
    viewport: { defaultViewport: 'mobile375' },
    layout: 'padded'
  },
  argTypes: {
    title: { control: 'text' },
    agent: { control: 'text' },
    elapsed: { control: 'text' },
    ctaLabel: { control: 'text' }
  }
} satisfies Meta<typeof NowCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Design Exploration — Mobile Loop Monitor Layout & Components',
    agent: 'Pixel Perfector',
    elapsed: '2m 34s',
    ctaLabel: 'Watch Live'
  }
};

export const ShortTitle: Story = {
  args: {
    title: 'Loop Dashboard',
    agent: 'Code Wizard',
    elapsed: '0m 12s',
    ctaLabel: 'Watch Live'
  }
};

export const NoMeta: Story = {
  args: {
    title: 'Current task',
    ctaLabel: 'Watch Live'
  }
};

export const NoCta: Story = {
  args: {
    title: 'Last completed: QA: Loop Dashboard',
    agent: 'Bug Hunter',
    elapsed: '2m ago',
    ctaLabel: ''
  }
};

export const IdleState: Story = {
  args: {
    title: 'No task running',
    agent: undefined,
    elapsed: undefined,
    ctaLabel: ''
  }
};

export const Dark: Story = {
  args: Default.args,
  parameters: { theme: 'dark' }
};
