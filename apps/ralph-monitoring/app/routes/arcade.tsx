import type { Route } from './+types/arcade';
import { MemoryMatchMock } from '~/components/arcade/memory-match-mock';

const initialCards = [
  { id: 'card-1', face: 'A', state: 'hidden' },
  { id: 'card-2', face: 'B', state: 'hidden' },
  { id: 'card-3', face: 'C', state: 'hidden' },
  { id: 'card-4', face: 'D', state: 'hidden' },
  { id: 'card-5', face: 'E', state: 'hidden' },
  { id: 'card-6', face: 'F', state: 'hidden' },
  { id: 'card-7', face: 'G', state: 'hidden' },
  { id: 'card-8', face: 'H', state: 'hidden' },
  { id: 'card-9', face: 'A', state: 'hidden' },
  { id: 'card-10', face: 'B', state: 'hidden' },
  { id: 'card-11', face: 'C', state: 'hidden' },
  { id: 'card-12', face: 'D', state: 'hidden' },
  { id: 'card-13', face: 'E', state: 'hidden' },
  { id: 'card-14', face: 'F', state: 'hidden' },
  { id: 'card-15', face: 'G', state: 'hidden' },
  { id: 'card-16', face: 'H', state: 'hidden' }
] as const satisfies Parameters<typeof MemoryMatchMock>[0]['cards'];

export const meta: Route.MetaFunction = () => [
  { title: 'Memory Match' },
  { name: 'description', content: 'Play the deterministic Memory Match mini-game.' }
];

export default function Arcade() {
  return (
    <MemoryMatchMock
      seed="demo"
      moves={0}
      matches={{ matchedPairs: 0, totalPairs: 8 }}
      phase="initial"
      cards={[...initialCards]}
    />
  );
}

