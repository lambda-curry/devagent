/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Arcade from '../arcade';
import { createRoutesStub } from '~/lib/test-utils/router';
import { createMemoryMatchGame } from '~/lib/arcade/memory-match';

function makeExpectedSeed() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

describe('/arcade', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders, can reach win state deterministically, and "New game" resets', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);

    const Router = createRoutesStub([
      { path: '/', Component: () => <div>Home</div> },
      { path: '/arcade', Component: Arcade }
    ]);

    render(<Router initialEntries={['/arcade?seed=demo']} />);

    expect(await screen.findByRole('heading', { name: /Memory Match/i })).toBeInTheDocument();
    expect(await screen.findByText(/Seed:/i)).toBeInTheDocument();
    expect(await screen.findByText(/Matched:\s*0\/8/i)).toBeInTheDocument();
    expect(screen.queryByText(/You win/i)).not.toBeInTheDocument();

    const game = createMemoryMatchGame({ seed: 'demo', pairCount: 8 });
    const user = userEvent.setup();

    for (let pairId = 0; pairId < game.pairCount; pairId += 1) {
      const indices = game.deck
        .map((card, index) => ({ card, index }))
        .filter(({ card }) => card.pairId === pairId)
        .map(({ index }) => index);

      const [a, b] = indices;
      if (a === undefined || b === undefined) throw new Error(`expected 2 indices for pairId ${pairId}`);

      const cards = screen.getAllByRole('button', { name: /^Card \d+:/ });
      expect(cards).toHaveLength(16);

      await user.click(cards[a]);
      await user.click(cards[b]);
    }

    expect(await screen.findByText(/You win/i)).toBeInTheDocument();
    expect(await screen.findByText(/Matched:\s*8\/8/i)).toBeInTheDocument();

    const expectedSeed = makeExpectedSeed();
    await user.click(await screen.findByRole('button', { name: /New game/i }));

    // Remounts the board via `key={seed}` and should reset state.
    expect(await screen.findByText(expectedSeed)).toBeInTheDocument();
    expect(await screen.findByText(/Moves:\s*0/i)).toBeInTheDocument();
    expect(await screen.findByText(/Matched:\s*0\/8/i)).toBeInTheDocument();
    expect(screen.queryByText(/You win/i)).not.toBeInTheDocument();
  });
});

