import { describe, expect, it } from 'vitest';

import { createMemoryMatchState, getNextSeed, isCardRevealed, memoryMatchReducer } from '../memory-match';

const dispatch = (state: ReturnType<typeof createMemoryMatchState>, cardId: string) =>
  memoryMatchReducer(state, { type: 'select', cardId });

describe('memory-match', () => {
  it('produces deterministic decks for a given seed', () => {
    const a = createMemoryMatchState({ seed: 'default', totalPairs: 8 });
    const b = createMemoryMatchState({ seed: 'default', totalPairs: 8 });
    const c = createMemoryMatchState({ seed: 'default-1', totalPairs: 8 });

    expect(a.cards.map((x) => x.symbol)).toEqual(b.cards.map((x) => x.symbol));
    expect(a.cards.map((x) => x.symbol)).not.toEqual(c.cards.map((x) => x.symbol));
  });

  it('keeps matching pairs revealed and increments moves on pair attempt', () => {
    const initial = createMemoryMatchState({ seed: 'default', totalPairs: 8 });
    const first = initial.cards[0];
    if (!first) throw new Error('expected at least one card');
    const second = initial.cards.find((c) => c.id !== first.id && c.symbol === first.symbol);
    if (!second) throw new Error('expected a matching pair in deck');

    const afterFirst = dispatch(initial, first.id);
    expect(afterFirst.moves).toBe(0);
    expect(afterFirst.faceUpCardIds).toEqual([first.id]);
    expect(isCardRevealed(afterFirst, first.id)).toBe(true);

    const afterSecond = dispatch(afterFirst, second.id);
    expect(afterSecond.moves).toBe(1);
    expect(afterSecond.matchedPairs).toBe(1);
    expect(afterSecond.faceUpCardIds).toEqual([]);
    expect(afterSecond.pendingHideCardIds).toEqual([]);
    expect(afterSecond.cards.find((c) => c.id === first.id)?.isMatched).toBe(true);
    expect(afterSecond.cards.find((c) => c.id === second.id)?.isMatched).toBe(true);
    expect(isCardRevealed(afterSecond, first.id)).toBe(true);
    expect(isCardRevealed(afterSecond, second.id)).toBe(true);
  });

  it('keeps mismatched pairs revealed until the next selection', () => {
    const initial = createMemoryMatchState({ seed: 'default', totalPairs: 8 });
    const first = initial.cards[0];
    const second = initial.cards.find((c) => c.id !== first?.id && c.symbol !== first?.symbol);
    const third = initial.cards.find((c) => c.id !== first?.id && c.id !== second?.id);
    if (!first || !second || !third) throw new Error('expected at least 3 cards');

    const s1 = dispatch(initial, first.id);
    const s2 = dispatch(s1, second.id);

    expect(s2.moves).toBe(1);
    expect(s2.faceUpCardIds).toEqual([first.id, second.id]);
    expect(s2.pendingHideCardIds).toEqual([first.id, second.id]);
    expect(isCardRevealed(s2, first.id)).toBe(true);
    expect(isCardRevealed(s2, second.id)).toBe(true);

    const s3 = dispatch(s2, third.id);
    expect(s3.moves).toBe(1);
    expect(s3.pendingHideCardIds).toEqual([]);
    expect(s3.faceUpCardIds).toEqual([third.id]);
    expect(isCardRevealed(s3, first.id)).toBe(false);
    expect(isCardRevealed(s3, second.id)).toBe(false);
    expect(isCardRevealed(s3, third.id)).toBe(true);
  });

  it('locks the game after win', () => {
    const initial = createMemoryMatchState({ seed: 'default', totalPairs: 1 });
    const [a, b] = initial.cards;
    if (!a || !b) throw new Error('expected 2 cards');

    const won = dispatch(dispatch(initial, a.id), b.id);
    expect(won.isWin).toBe(true);
    expect(won.matchedPairs).toBe(1);
    expect(won.moves).toBe(1);

    const ignored = dispatch(won, a.id);
    expect(ignored.moves).toBe(1);
    expect(ignored.matchedPairs).toBe(1);
  });

  it('increments seed deterministically for new game', () => {
    expect(getNextSeed('1')).toBe('2');
    expect(getNextSeed('default')).toBe('default-1');
    expect(getNextSeed('default-1')).toBe('default-2');
  });
});

