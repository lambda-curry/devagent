import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import type { Route } from './+types/arcade';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import {
  DEFAULT_MEMORY_MATCH_SEED,
  createMemoryMatchGame,
  isMemoryMatchCardRevealed,
  isMemoryMatchWon,
  selectMemoryMatchCard,
  type MemoryMatchGame
} from '~/lib/arcade/memory-match';

export const meta: Route.MetaFunction = () => [
  { title: 'Memory Match' },
  { name: 'description', content: 'A tiny arcade mode: Memory Match' }
];

function generateSeed() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function MemoryMatchBoard(props: { seed: string; onNewGame: () => void }) {
  const { seed, onNewGame } = props;
  const pairCount = 8;

  const [game, setGame] = useState<MemoryMatchGame>(() => createMemoryMatchGame({ seed, pairCount }));
  const isWon = isMemoryMatchWon(game);
  const matchedPairsCount = game.matchedPairIds.size;

  const restartSameSeed = () => setGame(createMemoryMatchGame({ seed, pairCount }));

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Flip cards to find pairs. A mismatched pair flips back on your next pick.
            </p>
            <p className="text-xs text-muted-foreground">
              Seed: <code className="font-mono">{seed}</code> (try `?seed=demo`)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Moves: {game.moves}</Badge>
            <Badge variant="secondary">
              Matched: {matchedPairsCount}/{pairCount}
            </Badge>
            {isWon ? <Badge>You win</Badge> : null}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {game.deck.map((card, index) => {
            const isMatched = game.matchedPairIds.has(card.pairId);
            const isRevealed = isMemoryMatchCardRevealed(game, index);
            const isDisabled = isWon || isMatched || game.revealedIndices.includes(index);

            return (
              <button
                key={card.id}
                type="button"
                className={cn(
                  'aspect-square w-full select-none rounded-lg border bg-card text-card-foreground shadow-sm transition-colors',
                  'flex items-center justify-center text-3xl leading-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:pointer-events-none disabled:opacity-70',
                  !isRevealed && 'hover:bg-accent',
                  isRevealed && !isMatched && !isWon && 'bg-secondary',
                  isMatched && 'bg-primary text-primary-foreground'
                )}
                aria-label={isRevealed ? `Card ${index + 1}: ${card.face}` : `Card ${index + 1}: hidden`}
                disabled={isDisabled}
                onClick={() => setGame((current) => selectMemoryMatchCard(current, index))}
              >
                {isRevealed ? card.face : <span className="text-muted-foreground">?</span>}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button type="button" onClick={onNewGame}>
              New game
            </Button>
            <Button type="button" variant="outline" onClick={restartSameSeed}>
              Restart
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: To make screenshots reproducible, keep the same `seed` in the URL.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Arcade() {
  const [searchParams, setSearchParams] = useSearchParams();
  const seedFromUrl = searchParams.get('seed')?.trim();
  const seed = seedFromUrl ? seedFromUrl : DEFAULT_MEMORY_MATCH_SEED;

  const startNewGame = () => {
    const next = new URLSearchParams(searchParams);
    next.set('seed', generateSeed());
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Memory Match</h1>
          <Button asChild variant="outline">
            <Link to="/" prefetch="intent">
              Back to Home
            </Link>
          </Button>
        </div>

        <MemoryMatchBoard key={seed} seed={seed} onNewGame={startNewGame} />
      </div>
    </div>
  );
}

