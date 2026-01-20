export interface MemoryMatchCard {
  id: string;
  symbol: string;
  isMatched: boolean;
}

export interface MemoryMatchState {
  seed: string;
  totalPairs: number;
  moves: number;
  matchedPairs: number;
  isWin: boolean;
  cards: MemoryMatchCard[];
  faceUpCardIds: string[];
  pendingHideCardIds: string[];
}

export interface CreateMemoryMatchStateOptions {
  seed: string;
  totalPairs?: number;
  symbols?: readonly string[];
}

export interface MemoryMatchSelectAction {
  type: 'select';
  cardId: string;
}

export type MemoryMatchAction = MemoryMatchSelectAction;

const DEFAULT_SYMBOLS: readonly string[] = [
  '🍎',
  '🍌',
  '🍇',
  '🍒',
  '🍓',
  '🍍',
  '🥝',
  '🍑',
  '🍉',
  '🥥',
  '🍋',
  '🍊',
  '🥭',
  '🍐',
  '🫐',
  '🍈'
];

const seedToUint32 = (seed: string): number => {
  // FNV-1a 32-bit (deterministic, small, no deps)
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const mulberry32 = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const seededShuffle = <T>(items: readonly T[], seed: string): T[] => {
  const rng = mulberry32(seedToUint32(seed));
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export const createMemoryMatchState = (options: CreateMemoryMatchStateOptions): MemoryMatchState => {
  const totalPairs = options.totalPairs ?? 8;
  const symbols = options.symbols ?? DEFAULT_SYMBOLS;

  if (totalPairs < 1) throw new Error(`totalPairs must be >= 1 (got ${totalPairs})`);
  if (totalPairs > symbols.length) throw new Error(`totalPairs must be <= ${symbols.length} (got ${totalPairs})`);

  const pairSymbols = symbols.slice(0, totalPairs);
  const deckSymbols = seededShuffle([...pairSymbols, ...pairSymbols], options.seed);

  const cards: MemoryMatchCard[] = deckSymbols.map((symbol, idx) => ({
    id: String(idx),
    symbol,
    isMatched: false
  }));

  return {
    seed: options.seed,
    totalPairs,
    moves: 0,
    matchedPairs: 0,
    isWin: false,
    cards,
    faceUpCardIds: [],
    pendingHideCardIds: []
  };
};

const getCardById = (state: MemoryMatchState, cardId: string): MemoryMatchCard | undefined =>
  state.cards.find((card) => card.id === cardId);

const hidePendingMismatchIfNeeded = (state: MemoryMatchState): MemoryMatchState => {
  if (state.pendingHideCardIds.length === 0) return state;

  return {
    ...state,
    faceUpCardIds: [],
    pendingHideCardIds: []
  };
};

export const memoryMatchReducer = (state: MemoryMatchState, action: MemoryMatchAction): MemoryMatchState => {
  if (action.type !== 'select') return state;
  if (state.isWin) return state;

  const card = getCardById(state, action.cardId);
  if (!card) return state;
  if (card.isMatched) return state;

  // If the user taps a mismatched 3rd card, flip back the old mismatch first.
  const baseState = hidePendingMismatchIfNeeded(state);

  if (baseState.faceUpCardIds.includes(action.cardId)) return baseState;

  if (baseState.faceUpCardIds.length === 0) {
    return {
      ...baseState,
      faceUpCardIds: [action.cardId]
    };
  }

  if (baseState.faceUpCardIds.length === 1) {
    const [firstId] = baseState.faceUpCardIds;
    const secondId = action.cardId;
    const firstCard = getCardById(baseState, firstId);
    const secondCard = getCardById(baseState, secondId);
    if (!firstCard || !secondCard) return baseState;

    const nextMoves = baseState.moves + 1;

    if (firstCard.symbol === secondCard.symbol) {
      const nextCards = baseState.cards.map((c) =>
        c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
      );
      const nextMatchedPairs = baseState.matchedPairs + 1;
      const nextIsWin = nextMatchedPairs === baseState.totalPairs;

      return {
        ...baseState,
        moves: nextMoves,
        matchedPairs: nextMatchedPairs,
        isWin: nextIsWin,
        cards: nextCards,
        faceUpCardIds: [],
        pendingHideCardIds: []
      };
    }

    return {
      ...baseState,
      moves: nextMoves,
      faceUpCardIds: [firstId, secondId],
      pendingHideCardIds: [firstId, secondId]
    };
  }

  // If we ever end up with two cards face up, keep the state stable
  // (mismatches only clear on the *next* selection).
  return state;
};

export const isCardRevealed = (state: MemoryMatchState, cardId: string): boolean => {
  if (state.isWin) return true;
  const card = getCardById(state, cardId);
  if (!card) return false;
  if (card.isMatched) return true;
  return state.faceUpCardIds.includes(cardId);
};

export const getNextSeed = (seed: string): string => {
  const trimmed = seed.trim();
  if (trimmed === '') return '1';

  const asNumber = Number(trimmed);
  if (Number.isInteger(asNumber) && Number.isFinite(asNumber)) return String(asNumber + 1);

  const match = /^(?<base>.*?)(?:-(?<n>\d+))?$/.exec(trimmed);
  const base = match?.groups?.base ?? trimmed;
  const n = match?.groups?.n ? Number(match.groups.n) : 0;
  return `${base}-${n + 1}`;
};

