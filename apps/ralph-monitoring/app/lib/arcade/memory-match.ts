export const DEFAULT_SEED = 'demo';

export interface MemoryMatchCard {
  id: string;
  face: string;
  pairId: string;
}

export interface MemoryMatchGameState {
  seed: string;
  cards: MemoryMatchCard[];
  moves: number;
  matchedCardIds: string[];
  revealedCardIds: string[];
  unmatchedPairCardIds: readonly [string, string] | null;
}

function hashStringToUint32(input: string) {
  // FNV-1a 32-bit
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seedUint32: number) {
  let t = seedUint32 >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeededRng(seed: string) {
  return mulberry32(hashStringToUint32(seed));
}

export function seededShuffle<T>(items: readonly T[], seed: string) {
  const rng = createSeededRng(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j] as T;
    out[j] = tmp as T;
  }
  return out;
}

export function deriveNextSeed(currentSeed: string) {
  // Deterministic step function: same input always produces same "next" seed.
  // Keeps "New game" stable for tests while still changing the board.
  const next = (hashStringToUint32(currentSeed) + 1) >>> 0;
  return next.toString(36);
}

export interface CreateDeckOptions {
  seed: string;
  faces: readonly string[];
}

export function createDeck({ seed, faces }: CreateDeckOptions) {
  const base = faces.flatMap((face, idx) => {
    const pairId = `p-${idx + 1}`;
    return [
      { id: '', face, pairId } satisfies MemoryMatchCard,
      { id: '', face, pairId } satisfies MemoryMatchCard,
    ];
  });

  const shuffled = seededShuffle(base, seed);
  return shuffled.map((card, idx) => ({ ...card, id: `c-${idx + 1}` }));
}

export function createInitialGameState(seed: string, cards: MemoryMatchCard[]): MemoryMatchGameState {
  return {
    seed,
    cards,
    moves: 0,
    matchedCardIds: [],
    revealedCardIds: [],
    unmatchedPairCardIds: null,
  };
}

export function getMatchedPairsCount(state: MemoryMatchGameState) {
  return Math.floor(state.matchedCardIds.length / 2);
}

export function isGameWon(state: MemoryMatchGameState) {
  return state.matchedCardIds.length === state.cards.length;
}

function getCardById(state: MemoryMatchGameState, cardId: string) {
  return state.cards.find(card => card.id === cardId) ?? null;
}

function hasId(list: readonly string[], id: string) {
  return list.includes(id);
}

function withoutIds(list: readonly string[], ids: readonly string[]) {
  return list.filter(id => !ids.includes(id));
}

export function selectCard(state: MemoryMatchGameState, cardId: string): MemoryMatchGameState {
  if (isGameWon(state)) return state;

  const card = getCardById(state, cardId);
  if (!card) return state;

  if (hasId(state.matchedCardIds, cardId)) return state;
  if (hasId(state.revealedCardIds, cardId)) return state;

  // If the last pick was a mismatch, flip those back on the next selection.
  const shouldClearMismatch = state.unmatchedPairCardIds !== null;
  const baseState = shouldClearMismatch
    ? {
        ...state,
        revealedCardIds: [],
        unmatchedPairCardIds: null,
      }
    : state;

  const nextRevealed = [...baseState.revealedCardIds, cardId];
  if (nextRevealed.length === 1) {
    return {
      ...baseState,
      revealedCardIds: nextRevealed,
    };
  }

  if (nextRevealed.length !== 2) return baseState;

  const [firstId, secondId] = nextRevealed;
  const first = getCardById(baseState, firstId);
  const second = getCardById(baseState, secondId);
  if (!first || !second) return baseState;

  const moves = baseState.moves + 1;
  const isMatch = first.pairId === second.pairId;

  if (isMatch) {
    return {
      ...baseState,
      moves,
      matchedCardIds: [...baseState.matchedCardIds, firstId, secondId],
      revealedCardIds: [],
      unmatchedPairCardIds: null,
    };
  }

  return {
    ...baseState,
    moves,
    revealedCardIds: nextRevealed,
    unmatchedPairCardIds: [firstId, secondId],
    // Keep matchedCardIds unchanged.
  };
}

export function getCardState(
  state: MemoryMatchGameState,
  cardId: string,
): 'hidden' | 'revealed' | 'matched' {
  if (hasId(state.matchedCardIds, cardId)) return 'matched';
  if (hasId(state.revealedCardIds, cardId)) return 'revealed';
  return 'hidden';
}

export function clearUnmatchedReveals(state: MemoryMatchGameState): MemoryMatchGameState {
  if (!state.unmatchedPairCardIds) return state;
  return {
    ...state,
    revealedCardIds: withoutIds(state.revealedCardIds, state.unmatchedPairCardIds),
    unmatchedPairCardIds: null,
  };
}

