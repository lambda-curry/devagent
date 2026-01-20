import { Link, href, useSearchParams } from 'react-router';
import type { Route } from './+types/arcade';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { createMemoryMatchState, getNextSeed, isCardRevealed, memoryMatchReducer } from '~/lib/arcade/memory-match';
import { useReducer } from 'react';

export const meta: Route.MetaFunction = () => [
  { title: 'Memory Match' },
  { name: 'description', content: 'Play Memory Match in the Ralph Arcade.' }
];

const DEFAULT_SEED = 'default';
const TOTAL_PAIRS = 8;

interface MemoryMatchGameProps {
  seed: string;
}

function MemoryMatchGame({ seed }: MemoryMatchGameProps) {
  const [state, dispatch] = useReducer(
    memoryMatchReducer,
    { seed, totalPairs: TOTAL_PAIRS },
    ({ seed, totalPairs }) => createMemoryMatchState({ seed, totalPairs })
  );

  const statusText = state.isWin
    ? 'You win!'
    : state.pendingHideCardIds.length > 0
      ? 'No match. Select another card to continue.'
      : 'Select two cards to find a match.';

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge data-testid="arcade-seed" variant="outline">
            Seed: <code className="ml-1 font-mono">{state.seed}</code>
          </Badge>
          <Badge data-testid="arcade-moves" variant="secondary">
            Moves: {state.moves}
          </Badge>
          <Badge data-testid="arcade-matches" variant="secondary">
            Matches: {state.matchedPairs} / {state.totalPairs}
          </Badge>
        </div>

        <p
          aria-atomic="true"
          aria-live="polite"
          className="text-sm text-muted-foreground"
          data-testid="arcade-status"
        >
          {statusText}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {state.isWin ? (
          <div className="rounded-md border bg-muted px-3 py-2 font-semibold" data-testid="arcade-win">
            You win!
          </div>
        ) : null}

        <fieldset className="grid grid-cols-4 gap-2 sm:gap-3" data-testid="arcade-board">
          <legend className="sr-only">Memory Match board</legend>
          {state.cards.map((card, index) => {
            const isRevealed = isCardRevealed(state, card.id);
            const ariaLabel = state.isWin
              ? `Card ${index + 1}: matched ${card.symbol}`
              : card.isMatched
                ? `Card ${index + 1}: matched ${card.symbol}`
                : isRevealed
                  ? `Card ${index + 1}: ${card.symbol}`
                  : `Card ${index + 1}: face down`;

            return (
              <Button
                key={card.id}
                type="button"
                variant={isRevealed ? 'secondary' : 'outline'}
                className="aspect-square w-full text-2xl sm:text-3xl"
                onClick={() => dispatch({ type: 'select', cardId: card.id })}
                disabled={state.isWin || card.isMatched}
                aria-label={ariaLabel}
                aria-pressed={isRevealed}
              >
                <span aria-hidden="true">{isRevealed ? card.symbol : '?'}</span>
              </Button>
            );
          })}
        </fieldset>
      </CardContent>
    </Card>
  );
}

export default function Arcade() {
  const [searchParams, setSearchParams] = useSearchParams();
  const seedFromUrl = searchParams.get('seed');
  const seed = seedFromUrl?.trim() ? seedFromUrl : DEFAULT_SEED;

  const setSeed = (nextSeed: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('seed', nextSeed);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Memory Match</h1>
          <div className="flex items-center gap-2">
            <Button type="button" onClick={() => setSeed(getNextSeed(seed))}>
              New game
            </Button>
            <Button asChild variant="outline">
              <Link to={href('/')} prefetch="intent">
                Back to home
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How to play</CardTitle>
            <CardDescription>
              Click two cards to find a match. If they don’t match, they flip back on your next selection. You can reproduce a
              board with <code className="font-mono">?seed=&lt;value&gt;</code>.
            </CardDescription>
          </CardHeader>
        </Card>

        <MemoryMatchGame key={seed} seed={seed} />
      </div>
    </div>
  );
}

