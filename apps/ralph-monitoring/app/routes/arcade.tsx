import type { Route } from './+types/arcade';
import { useSearchParams } from 'react-router';
import { MemoryMatch } from '~/components/arcade/memory-match';
import { DEFAULT_SEED, deriveNextSeed } from '~/lib/arcade/memory-match';

export const meta: Route.MetaFunction = () => [
  { title: 'Memory Match' },
  { name: 'description', content: 'Play the deterministic Memory Match mini-game.' }
];

export default function Arcade() {
  const [searchParams, setSearchParams] = useSearchParams();
  const seed = searchParams.get('seed')?.trim() || DEFAULT_SEED;

  const handleNewGame = () => {
    const nextSeed = deriveNextSeed(seed);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('seed', nextSeed);
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <MemoryMatch key={seed} seed={seed} onNewGame={handleNewGame} />
  );
}

