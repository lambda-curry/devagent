export const DEFAULT_SEED = 'default';

export const DEFAULT_FACES = [
  '🍎',
  '🦊',
  '🧠',
  '⚡️',
  '🪐',
  '🧩',
  '🛰️',
  '🧪',
] as const;

export interface SeedResult {
  seed: string;
  isValid: boolean;
  message?: string;
  hasUrlSeed: boolean;
}

const SEED_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

export const parseSeedFromUrl = (raw: string | null | undefined): SeedResult => {
  if (!raw) return { seed: DEFAULT_SEED, isValid: true, hasUrlSeed: false };

  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      seed: DEFAULT_SEED,
      isValid: false,
      hasUrlSeed: true,
      message: 'Invalid seed; using default.',
    };
  }

  if (!SEED_PATTERN.test(trimmed)) {
    return {
      seed: DEFAULT_SEED,
      isValid: false,
      hasUrlSeed: true,
      message: 'Invalid seed; using default.',
    };
  }

  return { seed: trimmed, isValid: true, hasUrlSeed: true };
};

const fnv1a32 = (input: string) => {
  // 32-bit FNV-1a hash for deterministic PRNG seeding.
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const seededShuffle = <T,>(items: readonly T[], seed: string): T[] => {
  const out = [...items];
  const rng = mulberry32(fnv1a32(seed));

  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }

  return out;
};

export interface MemoryMatchTile {
  id: string;
  pairId: number;
  face: string;
}

export interface MemoryMatchGameState {
  seed: string;
  totalPairs: number;
  tiles: readonly MemoryMatchTile[];
  moves: number;
  revealed: readonly number[];
  pendingMismatch: readonly [number, number] | null;
  matched: readonly boolean[];
  statusText: string;
  isLocked: boolean;
}

export interface CreateMemoryMatchGameOptions {
  seed: string;
  pairs?: number;
  faces?: readonly string[];
  statusText?: string;
}

const normalizePairs = (pairs: number | undefined, faces: readonly string[]) => {
  const safe = Number.isFinite(pairs) ? Math.floor(pairs as number) : DEFAULT_FACES.length;
  const clamped = Math.max(1, Math.min(safe, faces.length));
  return clamped;
};

export const createMemoryMatchTiles = ({
  seed,
  pairs,
  faces = DEFAULT_FACES,
}: Pick<CreateMemoryMatchGameOptions, 'seed' | 'pairs' | 'faces'>): MemoryMatchTile[] => {
  const safeFaces = faces.length >= 1 ? faces : DEFAULT_FACES;
  const totalPairs = normalizePairs(pairs, safeFaces);

  const pairIds: number[] = [];
  for (let pairId = 0; pairId < totalPairs; pairId += 1) {
    pairIds.push(pairId);
    pairIds.push(pairId);
  }

  const shuffledPairIds = seededShuffle(pairIds, seed);

  return shuffledPairIds.map((pairId, index) => ({
    id: `tile-${index}`,
    pairId,
    face: safeFaces[pairId] ?? String(pairId + 1),
  }));
};

export const createMemoryMatchGame = ({
  seed,
  pairs,
  faces = DEFAULT_FACES,
  statusText = 'Pick a card.',
}: CreateMemoryMatchGameOptions): MemoryMatchGameState => {
  const tiles = createMemoryMatchTiles({ seed, pairs, faces });
  const matched = Array.from({ length: tiles.length }, () => false);

  return {
    seed,
    totalPairs: tiles.length / 2,
    tiles,
    moves: 0,
    revealed: [],
    pendingMismatch: null,
    matched,
    statusText,
    isLocked: false,
  };
};

export const getMatchedPairsCount = (matched: readonly boolean[]) => {
  const matchedTiles = matched.reduce((count, isMatched) => count + (isMatched ? 1 : 0), 0);
  return Math.floor(matchedTiles / 2);
};

export const selectMemoryMatchTile = (state: MemoryMatchGameState, index: number): MemoryMatchGameState => {
  if (state.isLocked) return state;
  if (index < 0 || index >= state.tiles.length) return state;
  if (state.matched[index]) return state;
  if (state.revealed.includes(index)) return state;

  // If we have a pending mismatch, hide it on the next *new* selection.
  if (state.pendingMismatch) {
    const [a, b] = state.pendingMismatch;
    // Clicking either revealed mismatch tile should not count as the "next selection".
    if (index === a || index === b) return state;
    return selectMemoryMatchTile(
      {
        ...state,
        revealed: [],
        pendingMismatch: null,
      },
      index,
    );
  }

  if (state.revealed.length === 0) {
    return {
      ...state,
      revealed: [index],
      statusText: 'Pick a second card.',
    };
  }

  if (state.revealed.length === 1) {
    const first = state.revealed[0];
    const second = index;
    const moves = state.moves + 1;
    const isMatch = state.tiles[first]?.pairId === state.tiles[second]?.pairId;

    if (isMatch) {
      const matched = [...state.matched];
      matched[first] = true;
      matched[second] = true;

      const matchedPairs = getMatchedPairsCount(matched);
      const isLocked = matchedPairs === state.totalPairs;

      return {
        ...state,
        moves,
        matched,
        revealed: [],
        pendingMismatch: null,
        isLocked,
        statusText: isLocked ? 'You win.' : 'Match!',
      };
    }

    return {
      ...state,
      moves,
      revealed: [first, second],
      pendingMismatch: [first, second],
      statusText: 'No match. Pick another card to hide them.',
    };
  }

  return state;
};

export const createRandomSeed = () => {
  const bytes = new Uint8Array(8);
  const getRandomValues = globalThis.crypto?.getRandomValues?.bind(globalThis.crypto);
  if (getRandomValues) getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return hex || `${Date.now().toString(16)}`;
};

