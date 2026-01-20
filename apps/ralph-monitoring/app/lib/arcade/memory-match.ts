export const DEFAULT_MEMORY_MATCH_SEED = 'default';

export interface MemoryMatchCard {
  id: string;
  pairId: number;
  face: string;
}

export interface MemoryMatchGame {
  seed: string;
  pairCount: number;
  deck: MemoryMatchCard[];
  revealedIndices: number[];
  matchedPairIds: Set<number>;
  moves: number;
}

const DEFAULT_FACES = [
  '🍓',
  '🍋',
  '🍇',
  '🍉',
  '🍒',
  '🥝',
  '🍍',
  '🍑',
  '🥥',
  '🍏',
  '🍊',
  '🍌'
];

function fnv1a32(input: string) {
  // 32-bit FNV-1a hash (deterministic across runtimes)
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    // hash *= 16777619 (with overflow)
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRng<T>(items: readonly T[], nextRandom: () => number) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(nextRandom() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function createMemoryMatchDeck(options: { seed: string; pairCount: number; faces?: readonly string[] }) {
  const { seed, pairCount, faces = DEFAULT_FACES } = options;
  if (pairCount <= 0) throw new Error('pairCount must be > 0');
  if (faces.length < pairCount) throw new Error('not enough faces for requested pairCount');

  const baseCards: MemoryMatchCard[] = [];
  const chosenFaces = faces.slice(0, pairCount);
  for (let pairId = 0; pairId < pairCount; pairId += 1) {
    const face = chosenFaces[pairId] ?? '';
    baseCards.push(
      { id: `p${pairId}-a`, pairId, face },
      { id: `p${pairId}-b`, pairId, face }
    );
  }

  const rng = mulberry32(fnv1a32(seed));
  return shuffleWithRng(baseCards, rng);
}

export function createMemoryMatchGame(options: { seed?: string; pairCount?: number }): MemoryMatchGame {
  const seed = options.seed?.trim() ? options.seed.trim() : DEFAULT_MEMORY_MATCH_SEED;
  const pairCount = options.pairCount ?? 8;

  return {
    seed,
    pairCount,
    deck: createMemoryMatchDeck({ seed, pairCount }),
    revealedIndices: [],
    matchedPairIds: new Set<number>(),
    moves: 0
  };
}

export function isMemoryMatchWon(game: MemoryMatchGame) {
  return game.matchedPairIds.size >= game.pairCount;
}

export function isMemoryMatchCardRevealed(game: MemoryMatchGame, index: number) {
  if (isMemoryMatchWon(game)) return true;
  const card = game.deck[index];
  if (!card) return false;
  return game.matchedPairIds.has(card.pairId) || game.revealedIndices.includes(index);
}

export function selectMemoryMatchCard(game: MemoryMatchGame, index: number): MemoryMatchGame {
  if (isMemoryMatchWon(game)) return game;
  const card = game.deck[index];
  if (!card) return game;
  if (game.matchedPairIds.has(card.pairId)) return game;
  if (game.revealedIndices.includes(index)) return game;

  // If the player previously revealed a mismatched pair, it reverts on the next selection.
  const revealedBase = game.revealedIndices.length === 2 ? [] : game.revealedIndices;
  const revealedNext = [...revealedBase, index];

  if (revealedNext.length < 2) {
    return { ...game, revealedIndices: revealedNext };
  }

  const [a, b] = revealedNext;
  const cardA = game.deck[a];
  const cardB = game.deck[b];
  if (!cardA || !cardB) return game;

  const nextMoves = game.moves + 1;
  if (cardA.pairId === cardB.pairId) {
    const matchedPairIds = new Set(game.matchedPairIds);
    matchedPairIds.add(cardA.pairId);
    return { ...game, moves: nextMoves, matchedPairIds, revealedIndices: [] };
  }

  return { ...game, moves: nextMoves, revealedIndices: revealedNext };
}

