/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Arcade from '../arcade';
import { createDeck, deriveNextSeed } from '~/lib/arcade/memory-match';
import { createRoutesStub } from '~/lib/test-utils/router';

const defaultFaces = ['🍒', '🍋', '🍇', '⭐', '🍀', '🔥', '🌙', '🎯'] as const;

const getPairIndicesByFace = (seed: string) => {
  const deck = createDeck({ seed, faces: defaultFaces });
  const indicesByFace = new Map<string, number[]>();

  for (const [idx, card] of deck.entries()) {
    const arr = indicesByFace.get(card.face) ?? [];
    arr.push(idx + 1);
    indicesByFace.set(card.face, arr);
  }

  return indicesByFace;
};

describe('/arcade', () => {
  it('renders the page', async () => {
    const Router = createRoutesStub([{ path: '/arcade', Component: Arcade }]);
    const { container } = render(<Router initialEntries={['/arcade?seed=demo']} />);

    expect(await screen.findByRole('heading', { name: /Memory Match/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /New game/i })).toBeInTheDocument();

    const seedBadge = container.querySelector('[data-qa="arcade-seed"]');
    expect(seedBadge).not.toBeNull();
    expect(seedBadge).toHaveTextContent('Seed: demo');
  });

  it('New game resets state and updates the seed', async () => {
    const seed = 'demo';
    const nextSeed = deriveNextSeed(seed);

    const Router = createRoutesStub([{ path: '/arcade', Component: Arcade }]);
    const { container } = render(<Router initialEntries={[`/arcade?seed=${seed}`]} />);
    const user = userEvent.setup();

    const indicesByFace = getPairIndicesByFace(seed);
    const firstPair = indicesByFace.values().next().value as number[] | undefined;
    if (!firstPair || firstPair.length !== 2) throw new Error('Expected a pair of indices');

    await user.click(await screen.findByRole('button', { name: `Card ${firstPair[0]}: hidden` }));
    await user.click(await screen.findByRole('button', { name: `Card ${firstPair[1]}: hidden` }));

    const movesBadge = container.querySelector('[data-qa="arcade-moves"]');
    const matchesBadge = container.querySelector('[data-qa="arcade-matches"]');
    expect(movesBadge).not.toBeNull();
    expect(matchesBadge).not.toBeNull();

    expect(movesBadge).toHaveTextContent('Moves: 1');
    expect(matchesBadge).toHaveTextContent('Matches: 1/8');

    await user.click(await screen.findByRole('button', { name: /New game/i }));

    await waitFor(() => {
      expect(container.querySelector('[data-qa="arcade-seed"]')).toHaveTextContent(`Seed: ${nextSeed}`);
      expect(container.querySelector('[data-qa="arcade-moves"]')).toHaveTextContent('Moves: 0');
      expect(container.querySelector('[data-qa="arcade-matches"]')).toHaveTextContent('Matches: 0/8');
    });
  });

  it('can reach the win state deterministically (seeded)', async () => {
    const seed = 'demo';

    const Router = createRoutesStub([{ path: '/arcade', Component: Arcade }]);
    const { container } = render(<Router initialEntries={[`/arcade?seed=${seed}`]} />);
    const user = userEvent.setup();

    const indicesByFace = getPairIndicesByFace(seed);
    for (const indices of indicesByFace.values()) {
      const [first, second] = indices;
      if (!first || !second) throw new Error('Expected exactly two indices per face');

      await user.click(await screen.findByRole('button', { name: `Card ${first}: hidden` }));
      await user.click(await screen.findByRole('button', { name: `Card ${second}: hidden` }));
    }

    expect(await screen.findByText(/You win —/i)).toBeInTheDocument();

    const winBadge = container.querySelector('[data-qa="arcade-win-badge"]');
    expect(winBadge).not.toBeNull();
    expect(winBadge).toHaveTextContent('Win');

    const matchesBadge = container.querySelector('[data-qa="arcade-matches"]');
    expect(matchesBadge).not.toBeNull();
    expect(matchesBadge).toHaveTextContent('Matches: 8/8');
  });
});

