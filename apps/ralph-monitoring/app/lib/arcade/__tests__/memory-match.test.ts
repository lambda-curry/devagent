import { describe, expect, it } from 'vitest';
import { createDeck, createInitialGameState, selectCard } from '../memory-match';

describe('memory-match deterministic shuffle', () => {
  const faces = ['A', 'B', 'C', 'D'] as const;

  it('same seed produces the same shuffled deck', () => {
    const first = createDeck({ seed: 'alpha', faces });
    const second = createDeck({ seed: 'alpha', faces });

    expect(first).toEqual(second);
    expect(first.map(card => card.pairId)).toEqual(['p-1', 'p-2', 'p-4', 'p-2', 'p-4', 'p-3', 'p-1', 'p-3']);
    expect(first.map(card => card.face)).toEqual(['A', 'B', 'D', 'B', 'D', 'C', 'A', 'C']);
  });

  it('different seeds produce different shuffled decks', () => {
    const alpha = createDeck({ seed: 'alpha', faces });
    const beta = createDeck({ seed: 'beta', faces });

    expect(alpha).not.toEqual(beta);
    expect(beta.map(card => card.pairId)).toEqual(['p-3', 'p-1', 'p-4', 'p-4', 'p-3', 'p-1', 'p-2', 'p-2']);
    expect(beta.map(card => card.face)).toEqual(['C', 'A', 'D', 'D', 'C', 'A', 'B', 'B']);
  });
});

describe('memory-match game rules', () => {
  it('keeps mismatched pair revealed until next selection', () => {
    const cards = [
      { id: 'c-1', face: 'A', pairId: 'p-1' },
      { id: 'c-2', face: 'B', pairId: 'p-2' },
      { id: 'c-3', face: 'A', pairId: 'p-1' },
      { id: 'c-4', face: 'B', pairId: 'p-2' },
    ] as const;

    let state = createInitialGameState('seed', [...cards]);

    state = selectCard(state, 'c-1');
    expect(state.revealedCardIds).toEqual(['c-1']);
    expect(state.moves).toBe(0);

    state = selectCard(state, 'c-2');
    expect(state.revealedCardIds).toEqual(['c-1', 'c-2']);
    expect(state.unmatchedPairCardIds).toEqual(['c-1', 'c-2']);
    expect(state.moves).toBe(1);

    // Next selection clears mismatch first, then reveals the new card.
    state = selectCard(state, 'c-3');
    expect(state.revealedCardIds).toEqual(['c-3']);
    expect(state.unmatchedPairCardIds).toBeNull();
    expect(state.moves).toBe(1);

    // Now a matching second pick locks the pair as matched.
    state = selectCard(state, 'c-1');
    expect(state.revealedCardIds).toEqual([]);
    expect(state.unmatchedPairCardIds).toBeNull();
    expect(state.matchedCardIds.sort()).toEqual(['c-1', 'c-3']);
    expect(state.moves).toBe(2);
  });
});

