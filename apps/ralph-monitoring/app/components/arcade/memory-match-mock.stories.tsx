import type { Meta, StoryObj } from '@storybook/react';
import { MemoryMatchMock } from '~/components/arcade/memory-match-mock';

const meta = {
  title: 'arcade/MemoryMatch (mock)',
  component: MemoryMatchMock,
} satisfies Meta<typeof MemoryMatchMock>;

export default meta;
type Story = StoryObj<typeof meta>;

const faces = ['🍒', '🍒', '🍋', '🍋', '🍇', '🍇', '⭐', '⭐', '🍀', '🍀', '🔥', '🔥', '🌙', '🌙', '🎯', '🎯'];

export const Initial: Story = {
  args: {
    seed: '123',
    moves: 0,
    matches: { matchedPairs: 0, totalPairs: 8 },
    phase: 'initial',
    cards: faces.map((face, i) => ({ id: `c-${i + 1}`, face, state: 'hidden' })),
  },
};

export const MidGame: Story = {
  args: {
    seed: '123',
    moves: 5,
    matches: { matchedPairs: 2, totalPairs: 8 },
    phase: 'mid-game',
    cards: faces.map((face, i) => {
      if (i === 0) return { id: `c-${i + 1}`, face, state: 'revealed' };
      if (i === 3) return { id: `c-${i + 1}`, face, state: 'revealed' };
      if (i === 6 || i === 7 || i === 10 || i === 11) return { id: `c-${i + 1}`, face, state: 'matched' };
      return { id: `c-${i + 1}`, face, state: 'hidden' };
    }),
  },
};

export const Win: Story = {
  args: {
    seed: '999',
    moves: 12,
    matches: { matchedPairs: 8, totalPairs: 8 },
    phase: 'win',
    cards: faces.map((face, i) => ({ id: `c-${i + 1}`, face, state: 'matched' })),
  },
};

