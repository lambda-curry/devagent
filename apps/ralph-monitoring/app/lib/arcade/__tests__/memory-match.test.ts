import { describe, expect, it } from 'vitest';

import {
  createMemoryMatchGame,
  isMemoryMatchCardRevealed,
  isMemoryMatchWon,
  selectMemoryMatchCard
} from '../memory-match';

describe('memory-match', () => {
  it('is deterministic for the same seed', () => {
    const a = createMemoryMatchGame({ seed: 'seed-123', pairCount: 8 });
    const b = createMemoryMatchGame({ seed: 'seed-123', pairCount: 8 });

    expect(a.deck.map((c) => c.id)).toEqual(b.deck.map((c) => c.id));
    expect(a.deck.map((c) => c.pairId)).toEqual(b.deck.map((c) => c.pairId));
  });

  it('changes ordering for different seeds (with high probability)', () => {
    const a = createMemoryMatchGame({ seed: 'seed-a', pairCount: 8 });
    const b = createMemoryMatchGame({ seed: 'seed-b', pairCount: 8 });

    expect(a.deck.map((c) => c.id)).not.toEqual(b.deck.map((c) => c.id));
  });

  it('keeps a mismatch revealed until the next selection', () => {
    const game0 = createMemoryMatchGame({ seed: 'mismatch-seed', pairCount: 6 });

    const first = 0;
    const firstPairId = game0.deck[first]?.pairId;
    if (firstPairId === undefined) throw new Error('unexpected empty deck');

    const second = game0.deck.findIndex((c, idx) => idx !== first && c.pairId !== firstPairId);
    if (second === -1) throw new Error('failed to locate a mismatching second card');

    const third = game0.deck.findIndex((c, idx) => idx !== first && idx !== second && c.pairId !== firstPairId);
    if (third === -1) throw new Error('failed to locate a third card');

    const game1 = selectMemoryMatchCard(game0, first);
    expect(game1.revealedIndices).toEqual([first]);

    const game2 = selectMemoryMatchCard(game1, second);
    expect(game2.revealedIndices.sort((x, y) => x - y)).toEqual([first, second].sort((x, y) => x - y));

    const game3 = selectMemoryMatchCard(game2, third);
    expect(game3.revealedIndices).toEqual([third]);
  });

  it('keeps matched cards revealed and marks win when all pairs matched', () => {
    let game = createMemoryMatchGame({ seed: 'win-seed', pairCount: 4 });

    // Match every pair deterministically by scanning the deck.
    for (let pairId = 0; pairId < game.pairCount; pairId += 1) {
      const indices = game.deck
        .map((c, idx) => ({ c, idx }))
        .filter(({ c }) => c.pairId === pairId)
        .map(({ idx }) => idx);

      if (indices.length !== 2) throw new Error(`expected exactly 2 cards for pair ${pairId}`);
      game = selectMemoryMatchCard(game, indices[0] ?? -1);
      game = selectMemoryMatchCard(game, indices[1] ?? -1);

      const [a, b] = indices;
      if (a === undefined || b === undefined) throw new Error('unexpected indices');
      expect(isMemoryMatchCardRevealed(game, a)).toBe(true);
      expect(isMemoryMatchCardRevealed(game, b)).toBe(true);
    }

    expect(isMemoryMatchWon(game)).toBe(true);
    expect(game.matchedPairIds.size).toBe(game.pairCount);
  });
});

