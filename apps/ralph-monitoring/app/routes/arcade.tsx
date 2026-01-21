import { Link, useSearchParams } from 'react-router';
import type { Route } from './+types/arcade';
import type { Reducer } from 'react';
import { useReducer, useState } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import {
  createMemoryMatchGame,
  createRandomSeed,
  getMatchedPairsCount,
  parseSeedFromUrl,
  selectMemoryMatchTile,
} from '~/lib/arcade/memory-match';

export const meta: Route.MetaFunction = () => [{ title: 'Memory Match' }];

interface MemoryMatchCardProps {
  seed: string;
  seedWarning?: string;
  onNewGame: () => void;
  initialStatusText: string;
}

type MemoryMatchAction =
  | { type: 'select'; index: number }
  | { type: 'set-status'; statusText: string };

const memoryMatchReducer: Reducer<
  ReturnType<typeof createMemoryMatchGame>,
  MemoryMatchAction
> = (state, action) => {
  if (action.type === 'select') return selectMemoryMatchTile(state, action.index);
  return { ...state, statusText: action.statusText };
};

const getTileAriaLabel = (args: {
  index: number;
  face: string;
  visualState: 'hidden' | 'revealed' | 'matched';
}) => {
  const { index, face, visualState } = args;
  if (visualState === 'hidden') return `Card ${index + 1}, hidden`;
  if (visualState === 'matched') return `Card ${index + 1}, ${face} matched`;
  return `Card ${index + 1}, ${face}`;
};

interface MemoryMatchInitArgs {
  seed: string;
  initialStatusText: string;
}

const initMemoryMatchGame = ({ seed, initialStatusText }: MemoryMatchInitArgs) =>
  createMemoryMatchGame({
    seed,
    pairs: 8,
    statusText: initialStatusText,
  });

const MemoryMatchCard = ({ seed, seedWarning, onNewGame, initialStatusText }: MemoryMatchCardProps) => {
  const [state, dispatch] = useReducer(memoryMatchReducer, { seed, initialStatusText }, initMemoryMatchGame);

  const matchedPairs = getMatchedPairsCount(state.matched);
  const totalPairs = state.totalPairs;

  const handleCopySeed = async () => {
    try {
      await navigator.clipboard.writeText(seed);
      dispatch({ type: 'set-status', statusText: 'Seed copied.' });
    } catch {
      dispatch({ type: 'set-status', statusText: 'Could not copy seed.' });
    }
  };

  return (
    <Card>
      <CardHeader className="gap-[var(--space-2)]">
        <div className="flex flex-col gap-[var(--space-2)] sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-[var(--space-1)]">
            <CardTitle>Memory Match</CardTitle>
            <CardDescription>
              Match all pairs. Seed: <span className="font-mono text-foreground">{seed}</span>
            </CardDescription>
            {seedWarning ? <p className="text-xs text-muted-foreground">{seedWarning}</p> : null}
          </div>

          <div className="flex flex-wrap items-center gap-[var(--space-2)]">
            <Button type="button" onClick={onNewGame}>
              New game
            </Button>
            <Button type="button" variant="outline" onClick={handleCopySeed}>
              Copy seed
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <Badge variant="secondary">Moves: {state.moves}</Badge>
          <Badge variant="secondary">
            Matches: {matchedPairs}/{totalPairs}
          </Badge>
          <output className="text-sm text-muted-foreground" aria-live="polite">
            Status: {state.statusText}
          </output>
        </div>
      </CardHeader>

      <CardContent className="grid gap-[var(--space-4)]">
        {state.isLocked ? (
          <div className="rounded-lg border border-border bg-secondary p-[var(--space-3)] text-sm text-secondary-foreground">
            <strong>You win</strong>. The board is locked—start a new game to play again.
          </div>
        ) : null}

        <section className="grid grid-cols-4 gap-[var(--space-3)]" aria-label="Memory match board">
          {state.tiles.map((tile, index) => {
            const isMatched = state.matched[index] ?? false;
            const isRevealed = state.revealed.includes(index);
            const visualState = isMatched ? 'matched' : isRevealed ? 'revealed' : 'hidden';

            const isDisabled = state.isLocked || isMatched;
            const label = getTileAriaLabel({ index, face: tile.face, visualState });
            const face = visualState === 'hidden' ? '?' : tile.face;

            return (
              <button
                key={tile.id}
                type="button"
                className={[
                  'aspect-square w-full min-w-0 rounded-lg border border-input bg-background',
                  'min-h-[var(--touch-target-min)]',
                  'shadow-[var(--shadow-1)]',
                  'flex items-center justify-center',
                  'text-2xl sm:text-3xl',
                  'focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)]',
                  'disabled:opacity-[var(--disabled-opacity)] disabled:pointer-events-none',
                  visualState === 'matched' ? 'bg-secondary text-secondary-foreground' : '',
                ].join(' ')}
                aria-label={label}
                disabled={isDisabled}
                onClick={() => dispatch({ type: 'select', index })}
              >
                <span aria-hidden="true">{face}</span>
              </button>
            );
          })}
        </section>

        <p className="text-sm text-muted-foreground">
          Hint: Non-matching cards flip back on the next selection.
        </p>
      </CardContent>
    </Card>
  );
};

export default function Arcade() {
  const [searchParams, setSearchParams] = useSearchParams();
  const seedResult = parseSeedFromUrl(searchParams.get('seed'));
  const seed = seedResult.seed;
  const [isSeedPinned] = useState(() => seedResult.hasUrlSeed && seedResult.isValid);

  const [gameNonce, setGameNonce] = useState(0);
  const [initialStatusText, setInitialStatusText] = useState('Pick a card.');

  const handleNewGame = () => {
    setInitialStatusText('New game started. Pick a card.');

    if (isSeedPinned) {
      setGameNonce((n) => n + 1);
      return;
    }

    const nextSeed = createRandomSeed();
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('seed', nextSeed);
    setSearchParams(nextParams, { replace: true });
    setGameNonce((n) => n + 1);
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-3xl p-[var(--space-6)] space-y-[var(--space-6)]">
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <h1 className="text-2xl font-semibold tracking-tight">Memory Match</h1>
          <Button asChild variant="outline">
            <Link to="/" prefetch="intent">
              Back to tasks
            </Link>
          </Button>
        </div>

        <MemoryMatchCard
          key={`${seed}:${gameNonce}`}
          seed={seed}
          seedWarning={seedResult.message}
          onNewGame={handleNewGame}
          initialStatusText={initialStatusText}
        />
      </div>
    </div>
  );
}

