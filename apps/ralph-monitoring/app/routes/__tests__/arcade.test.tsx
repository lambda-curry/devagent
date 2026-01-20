/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Arcade from '../arcade';
import { createRoutesStub } from '~/lib/test-utils/router';
import { createMemoryMatchState } from '~/lib/arcade/memory-match';

const createRouter = (initialEntries: string[] = ['/arcade?seed=default']) => {
  const Stub = createRoutesStub([
    { path: '/', Component: () => <div>Home</div> },
    { path: '/arcade', Component: Arcade }
  ]);

  return function Router() {
    return <Stub initialEntries={initialEntries} />;
  };
};

const getBoardButtons = () => {
  const board = screen.getByTestId('arcade-board');
  return within(board).getAllByRole('button');
};

const getSeedText = () => screen.getByTestId('arcade-seed').textContent ?? '';
const getMovesText = () => screen.getByTestId('arcade-moves').textContent ?? '';
const getMatchesText = () => screen.getByTestId('arcade-matches').textContent ?? '';

describe('/arcade', () => {
  it('renders the page', async () => {
    const Router = createRouter();
    render(<Router />);

    expect(await screen.findByRole('heading', { name: /Memory Match/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /New game/i })).toBeInTheDocument();

    expect(await screen.findByTestId('arcade-seed')).toBeInTheDocument();
    expect(getSeedText()).toContain('default');
    expect(getMovesText()).toContain('Moves: 0');
    expect(getMatchesText()).toContain('Matches: 0 / 8');
  });

  it('New game updates seed and resets counters', async () => {
    const Router = createRouter(['/arcade?seed=default']);
    render(<Router />);

    const user = userEvent.setup();

    // Make a single matching move so we can verify reset.
    const state = createMemoryMatchState({ seed: 'default', totalPairs: 8 });
    const first = state.cards[0];
    if (!first) throw new Error('expected at least one card');
    const second = state.cards.find((c) => c.id !== first.id && c.symbol === first.symbol);
    if (!second) throw new Error('expected a matching pair');

    const firstIndex = Number(first.id);
    const secondIndex = Number(second.id);

    await user.click(getBoardButtons()[firstIndex]!);
    await user.click(getBoardButtons()[secondIndex]!);

    expect(getMovesText()).toContain('Moves: 1');
    expect(getMatchesText()).toContain('Matches: 1 / 8');

    await user.click(await screen.findByRole('button', { name: /New game/i }));

    await waitFor(() => {
      expect(getSeedText()).toContain('default-1');
      expect(getMovesText()).toContain('Moves: 0');
      expect(getMatchesText()).toContain('Matches: 0 / 8');
      expect(screen.queryByTestId('arcade-win')).not.toBeInTheDocument();
    });
  });

  it('can reach the win state with deterministic interactions', async () => {
    const Router = createRouter(['/arcade?seed=default']);
    render(<Router />);

    const user = userEvent.setup();

    const state = createMemoryMatchState({ seed: 'default', totalPairs: 8 });
    const indicesBySymbol = new Map<string, number[]>();
    for (const card of state.cards) {
      const idx = Number(card.id);
      const existing = indicesBySymbol.get(card.symbol);
      if (existing) existing.push(idx);
      else indicesBySymbol.set(card.symbol, [idx]);
    }

    // Click each matching pair (8 total) to guarantee a win.
    for (const [symbol, indices] of indicesBySymbol.entries()) {
      if (indices.length !== 2) throw new Error(`expected 2 cards for symbol "${symbol}"`);
      const [a, b] = indices;
      await user.click(getBoardButtons()[a]!);
      await user.click(getBoardButtons()[b]!);
    }

    expect(await screen.findByTestId('arcade-win')).toBeInTheDocument();
    expect(await screen.findByTestId('arcade-status')).toHaveTextContent(/You win!/i);

    // Once won, the entire board should be disabled.
    for (const button of getBoardButtons()) expect(button).toBeDisabled();
  });
});

