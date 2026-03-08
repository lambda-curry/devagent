import type { Meta, StoryObj } from '@storybook/react';
import { EpicMetaCard } from '~/components/EpicMetaCard';

const meta = {
  title: 'components/EpicMetaCard',
  component: EpicMetaCard,
} satisfies Meta<typeof EpicMetaCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPrLink: Story = {
  args: {
    prUrl: 'https://github.com/org/repo/pull/42',
  },
};

export const NoPrLink: Story = {
  args: {
    prUrl: null,
  },
};

export const WithPrLinkDark: Story = {
  ...WithPrLink,
  parameters: { theme: 'dark' },
};

export const NoPrLinkDark: Story = {
  ...NoPrLink,
  parameters: { theme: 'dark' },
};
