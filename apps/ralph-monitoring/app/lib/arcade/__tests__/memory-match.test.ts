import { describe, expect, it } from 'vitest';
import { createDeck, createInitialGameState, selectCard } from '../memory-match';

describe('memory-match', () => {
  it('creates a deterministic deck for the same seed', () => {
    const faces = ['A', 'B', 'C', 'D'] as const;
    const deckA = createDeck({ seed: 'seed-1', faces });
    const deckB = createDeck({ seed: 'seed-1', faces });

    expect(deckA).toEqual(deckB);
  });

  it('creates different decks for different seeds (with enough cards)', () => {
    const faces = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
    const deckA = createDeck({ seed: 'seed-a', faces });
    const deckB = createDeck({ seed: 'seed-b', faces });

    expect(deckA).not.toEqual(deckB);
  });

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

