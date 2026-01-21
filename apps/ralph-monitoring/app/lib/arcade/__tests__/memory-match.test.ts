import { describe, expect, it } from 'vitest';
import { createMemoryMatchTiles } from '~/lib/arcade/memory-match';

const deckSignature = (seed: string) =>
  createMemoryMatchTiles({ seed, pairs: 8 }).map((tile) => tile.pairId);

describe('memory-match determinism', () => {
  it('produces the same deck for the same seed', () => {
    expect(deckSignature('stable-seed')).toEqual(deckSignature('stable-seed'));
  });

  it('produces a different deck for different seeds', () => {
    expect(deckSignature('seed-a')).not.toEqual(deckSignature('seed-b'));
  });
});

