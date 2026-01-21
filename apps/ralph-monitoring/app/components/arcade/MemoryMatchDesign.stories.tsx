import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

type TileVisualState = 'hidden' | 'revealed' | 'matched';

interface TileModel {
  index: number;
  face: string;
  state: TileVisualState;
}

interface MemoryMatchDesignProps {
  seed: string;
  moves: number;
  matches: number;
  totalPairs: number;
  statusText: string;
  isLocked?: boolean;
  tiles: TileModel[];
  columns: number;
}

const getTileAriaLabel = (tile: TileModel) => {
  if (tile.state === 'hidden') return `Card ${tile.index + 1}, hidden`;
  if (tile.state === 'matched') return `Card ${tile.index + 1}, ${tile.face} matched`;
  return `Card ${tile.index + 1}, ${tile.face}`;
};

const MemoryMatchDesign = ({
  seed,
  moves,
  matches,
  totalPairs,
  statusText,
  isLocked = false,
  tiles,
  columns,
}: MemoryMatchDesignProps) => (
  <div className="w-full max-w-4xl">
    <Card>
      <CardHeader className="gap-[var(--space-2)]">
        <div className="flex flex-col gap-[var(--space-2)] sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-[var(--space-1)]">
            <CardTitle>Memory Match</CardTitle>
            <CardDescription>
              Match all pairs. Seed: <span className="font-mono text-foreground">{seed}</span>
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-[var(--space-2)]">
            <Button type="button">New game</Button>
            <Button type="button" variant="outline">
              Copy seed
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <Badge variant="secondary">Moves: {moves}</Badge>
          <Badge variant="secondary">
            Matches: {matches}/{totalPairs}
          </Badge>
          <output className="text-sm text-muted-foreground" aria-live="polite">
            Status: {statusText}
          </output>
        </div>
      </CardHeader>

      <CardContent className="grid gap-[var(--space-4)]">
        <section
          className="grid gap-[var(--space-3)]"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
          aria-label="Memory match board"
        >
          {tiles.map((tile) => {
            const isDisabled = isLocked || tile.state === 'matched';
            const label = getTileAriaLabel(tile);
            const face = tile.state === 'hidden' ? '?' : tile.face;

            return (
              <button
                key={tile.index}
                type="button"
                className={[
                  'aspect-square w-full min-w-0 rounded-lg border border-input bg-background',
                  'shadow-[var(--shadow-1)]',
                  'flex items-center justify-center',
                  'text-2xl sm:text-3xl',
                  'focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)]',
                  'disabled:opacity-[var(--disabled-opacity)] disabled:pointer-events-none',
                  tile.state === 'matched' ? 'bg-secondary text-secondary-foreground' : '',
                ].join(' ')}
                aria-label={label}
                disabled={isDisabled}
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
  </div>
);

const buildTiles = (overrides: Partial<TileModel>[]): TileModel[] => {
  // Deterministic visual ordering for Storybook:
  // - Pairs exist, but not necessarily adjacent (so we can show a deterministic "no match" state).
  // - Index 0 and 1 are different faces by default.
  const orderedFaces = [
    '🍎',
    '🦊',
    '🧠',
    '⚡️',
    '🍎',
    '🦊',
    '🧠',
    '⚡️',
    '🪐',
    '🧩',
    '🛰️',
    '🧪',
    '🪐',
    '🧩',
    '🛰️',
    '🧪',
  ];

  return orderedFaces.map((face, index) => ({
    index,
    face,
    state: 'hidden' as const,
    ...(overrides[index] ?? {}),
  }));
};

const meta = {
  title: 'arcade/MemoryMatch (design)',
  component: MemoryMatchDesign,
  parameters: {
    docs: {
      description: {
        component:
          'Deterministic “design states” for the /arcade Memory Match UI. These stories document key UI states for implementation + QA screenshots.'
      }
    }
  },
  args: {
    seed: '12345678',
    moves: 0,
    matches: 0,
    totalPairs: 8,
    statusText: 'Pick a card.',
    columns: 4,
    tiles: buildTiles([]),
  },
} satisfies Meta<typeof MemoryMatchDesign>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initial: Story = {};

export const InitialDark: Story = {
  ...Initial,
  parameters: { theme: 'dark' },
};

export const MidGameTwoRevealedNoMatch: Story = {
  args: {
    moves: 1,
    matches: 0,
    statusText: 'No match. Pick another card to hide them.',
    tiles: buildTiles([
      { state: 'revealed' as const },
      { state: 'revealed' as const },
    ]),
  },
};

export const MidGameTwoRevealedNoMatchDark: Story = {
  ...MidGameTwoRevealedNoMatch,
  parameters: { theme: 'dark' },
};

export const WinLocked: Story = {
  args: {
    moves: 12,
    matches: 8,
    statusText: 'You win.',
    isLocked: true,
    tiles: buildTiles(Array.from({ length: 16 }, () => ({ state: 'matched' as const }))),
  },
};

export const WinLockedDark: Story = {
  ...WinLocked,
  parameters: { theme: 'dark' },
};

