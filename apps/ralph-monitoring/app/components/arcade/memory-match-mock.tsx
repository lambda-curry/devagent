import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

export interface MemoryMatchMockCard {
  id: string;
  face: string;
  state: 'hidden' | 'revealed' | 'matched';
}

export interface MemoryMatchMockProps {
  seed: string;
  moves: number;
  matches: {
    matchedPairs: number;
    totalPairs: number;
  };
  phase: 'initial' | 'mid-game' | 'win';
  cards: MemoryMatchMockCard[];
}

export const MemoryMatchMock = ({ seed, moves, matches, phase, cards }: MemoryMatchMockProps) => {
  const isWin = phase === 'win';
  const statusText = isWin
    ? `You win — ${matches.matchedPairs}/${matches.totalPairs} matches in ${moves} moves.`
    : phase === 'mid-game'
      ? 'Pick a second card to try for a match.'
      : 'Pick two cards to find a matching pair.';

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6" data-qa="arcade-memory-match">
      <header className="mb-4 flex flex-col gap-3 md:mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-pretty text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
              Memory Match
            </h1>
            <p className="text-sm text-muted-foreground">
              Deterministic by default. Keyboard-friendly. Screenshot-ready.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button type="button" data-qa="arcade-new-game">
              New game
            </Button>
            <Badge variant="secondary" data-qa="arcade-seed">
              Seed: <span className="ml-1 font-mono">{seed}</span>
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" data-qa="arcade-moves">
            Moves: <span className="ml-1 font-mono">{moves}</span>
          </Badge>
          <Badge variant="outline" data-qa="arcade-matches">
            Matches: <span className="ml-1 font-mono">{matches.matchedPairs}</span>/{matches.totalPairs}
          </Badge>
          {isWin ? (
            <Badge data-qa="arcade-win-badge">Win</Badge>
          ) : (
            <Badge variant="secondary" data-qa="arcade-in-progress-badge">
              In progress
            </Badge>
          )}
        </div>
      </header>

      <Card data-qa="arcade-board-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Board</CardTitle>
          <CardDescription>
            <output aria-live="polite" data-qa="arcade-status">
              {statusText}
            </output>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <fieldset className="grid grid-cols-4 gap-2 sm:gap-3" aria-label="Memory match board">
            <legend className="sr-only">Memory match board</legend>
            {cards.map((card, idx) => {
              const isHidden = card.state === 'hidden';
              const isMatched = card.state === 'matched';
              const isRevealed = card.state === 'revealed';

              const label = isMatched
                ? `Card ${idx + 1}: matched`
                : isRevealed
                  ? `Card ${idx + 1}: revealed ${card.face}`
                  : `Card ${idx + 1}: hidden`;

              return (
                <Button
                  key={card.id}
                  type="button"
                  variant={isMatched ? 'secondary' : 'outline'}
                  disabled={isWin || isMatched}
                  aria-pressed={isRevealed || isMatched}
                  aria-label={label}
                  data-qa={`arcade-card-${idx + 1}`}
                  className={[
                    'h-14 w-full justify-center font-mono text-lg sm:h-16',
                    isRevealed ? 'ring-2 ring-ring ring-offset-2' : '',
                    isMatched ? 'opacity-100' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {isHidden ? '•' : card.face}
                </Button>
              );
            })}
          </fieldset>

          <p className="mt-4 text-xs text-muted-foreground" data-qa="arcade-a11y-hint">
            Keyboard: Tab to a card, then press Enter/Space to flip it.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

