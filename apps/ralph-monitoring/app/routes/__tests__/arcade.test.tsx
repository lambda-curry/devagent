/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Arcade from '../arcade';
import { createMemoryMatchTiles } from '~/lib/arcade/memory-match';
import { createRoutesStub } from '~/lib/test-utils/router';

const seed = 'test-seed_123';

const getCardButton = (index: number) =>
  screen.getByRole('button', { name: new RegExp(`^Card ${index + 1},`) });

const getPairsInOrder = (gameSeed: string): Array<readonly [number, number]> => {
  const tiles = createMemoryMatchTiles({ seed: gameSeed, pairs: 8 });
  const indicesByPairId = new Map<number, number[]>();

  for (const [index, tile] of tiles.entries()) {
    const indices = indicesByPairId.get(tile.pairId) ?? [];
    indices.push(index);
    indicesByPairId.set(tile.pairId, indices);
  }

  return [...indicesByPairId.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, indices]) => {
      if (indices.length !== 2) throw new Error(`Expected exactly 2 tiles per pair, got ${indices.length}`);
      return [indices[0] as number, indices[1] as number] as const;
    });
};

const renderArcade = (initialEntry = `/arcade?seed=${seed}`) => {
  const Stub = createRoutesStub([{ path: '/arcade', Component: Arcade }]);
  render(<Stub initialEntries={[initialEntry]} />);
};

describe('/arcade', () => {
  it('renders the page and board', async () => {
    renderArcade();

    expect(await screen.findByRole('heading', { level: 1, name: 'Memory Match' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: /memory match board/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /new game/i })).toBeInTheDocument();
    expect(await screen.findByText('Moves: 0')).toBeInTheDocument();
    expect(await screen.findByText('Matches: 0/8')).toBeInTheDocument();
  });

  it('resets on New game (seed pinned)', async () => {
    const user = userEvent.setup();
    renderArcade();

    const [[a, b]] = getPairsInOrder(seed);

    await user.click(getCardButton(a));
    await user.click(getCardButton(b));

    expect(await screen.findByText('Moves: 1')).toBeInTheDocument();
    expect(await screen.findByText('Matches: 1/8')).toBeInTheDocument();
    expect(await screen.findByText(/Status: Match!/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /new game/i }));

    expect(await screen.findByText('Moves: 0')).toBeInTheDocument();
    expect(await screen.findByText('Matches: 0/8')).toBeInTheDocument();
    expect(await screen.findByText(/Status: New game started\. Pick a card\./i)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: `Card ${a + 1}, hidden` })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: `Card ${b + 1}, hidden` })).toBeInTheDocument();
  });

  it('can reach a deterministic win state', async () => {
    const user = userEvent.setup();
    renderArcade();

    const pairs = getPairsInOrder(seed);
    for (const [a, b] of pairs) {
      await user.click(getCardButton(a));
      await user.click(getCardButton(b));
    }

    expect(await screen.findByText(/The board is locked/i)).toBeInTheDocument();
    expect(await screen.findByText('Moves: 8')).toBeInTheDocument();
    expect(await screen.findByText('Matches: 8/8')).toBeInTheDocument();
    expect(getCardButton(0)).toBeDisabled();
  });
});

