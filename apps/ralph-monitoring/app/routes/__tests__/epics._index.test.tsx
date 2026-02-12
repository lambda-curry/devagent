/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EpicsIndex, { loader, getEpicCardTargetPath } from '../epics._index';
import type { Route } from '../+types/epics._index';
import * as beadsServer from '~/db/beads.server';
import type { BeadsTask } from '~/db/beads.types';
import { createRoutesStub } from '~/lib/test-utils/router';

vi.mock('~/db/beads.server', () => ({
  getEpics: vi.fn(),
}));

vi.mock('~/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

const createLoaderArgs = (request: Request): Route.LoaderArgs => ({
  request,
  params: {},
  context: {},
  unstable_pattern: '',
});

const createComponentProps = (
  loaderData: Awaited<ReturnType<typeof loader>>
): Route.ComponentProps => ({
  loaderData,
  params: {},
  matches: [] as unknown as Route.ComponentProps['matches'],
});

describe('epics._index loader', () => {
  beforeEach(() => {
    vi.mocked(beadsServer.getEpics).mockReturnValue([]);
  });

  it('returns epics from getEpics()', async () => {
    const mockEpics: beadsServer.EpicSummary[] = [
      {
        id: 'epic-1',
        title: 'Dashboard Epic',
        status: 'in_progress',
        task_count: 10,
        completed_count: 3,
        progress_pct: 30,
        updated_at: '2026-01-30T12:00:00Z',
      },
    ];
    vi.mocked(beadsServer.getEpics).mockReturnValue(mockEpics);

    const request = new Request('http://test/epics');
    const result = await loader(createLoaderArgs(request));

    expect(result.epics).toEqual(mockEpics);
    expect(beadsServer.getEpics).toHaveBeenCalledTimes(1);
  });

  it('returns empty array when no epics exist', async () => {
    vi.mocked(beadsServer.getEpics).mockReturnValue([]);

    const request = new Request('http://test/epics');
    const result = await loader(createLoaderArgs(request));

    expect(result.epics).toEqual([]);
  });
});

describe('epics._index component', () => {
  beforeEach(() => {
    vi.mocked(beadsServer.getEpics).mockReturnValue([]);
  });

  const mockEpics: beadsServer.EpicSummary[] = [
    {
      id: 'epic-a',
      title: 'Epic A',
      status: 'in_progress',
      task_count: 4,
      completed_count: 2,
      progress_pct: 50,
      updated_at: '2026-01-30T12:00:00Z',
    },
    {
      id: 'epic-b',
      title: 'Epic B',
      status: 'closed',
      task_count: 2,
      completed_count: 2,
      progress_pct: 100,
      updated_at: '2026-01-29T10:00:00Z',
    },
  ];

  it('shows empty state when no epics', async () => {
    vi.mocked(beadsServer.getEpics).mockReturnValue([]);
    const request = new Request('http://test/epics');
    const loaderData = await loader(createLoaderArgs(request));
    const RouteComponent = () => (
      <EpicsIndex {...createComponentProps(loaderData)} />
    );
    const Stub = createRoutesStub([{ path: '/', Component: RouteComponent }]);
    render(<Stub />);

    expect(screen.getByText('No epics yet')).toBeInTheDocument();
    expect(
      screen.getByText(/Epics will appear here once Ralph creates parent tasks/)
    ).toBeInTheDocument();
  });

  it('renders epic list with title, progress, and loop cards', async () => {
    vi.mocked(beadsServer.getEpics).mockReturnValue(mockEpics);
    const request = new Request('http://test/epics');
    const loaderData = await loader(createLoaderArgs(request));
    const RouteComponent = () => (
      <EpicsIndex {...createComponentProps(loaderData)} />
    );
    const Stub = createRoutesStub([{ path: '/', Component: RouteComponent }]);
    render(<Stub />);

    expect(screen.getByText('Epic A')).toBeInTheDocument();
    expect(screen.getByText('Epic B')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '2/4' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '2/2' })).toBeInTheDocument();
  });

  it('sorts running epics first, then paused, then idle/closed', async () => {
    const epicsSortOrder: beadsServer.EpicSummary[] = [
      {
        id: 'closed-first',
        title: 'Closed Epic',
        status: 'closed',
        task_count: 2,
        completed_count: 2,
        progress_pct: 100,
        updated_at: '2026-01-29T10:00:00Z',
      },
      {
        id: 'running-second',
        title: 'Running Epic',
        status: 'in_progress',
        task_count: 5,
        completed_count: 2,
        progress_pct: 40,
        updated_at: '2026-01-30T12:00:00Z',
      },
      {
        id: 'open-third',
        title: 'Open Epic',
        status: 'open',
        task_count: 3,
        completed_count: 0,
        progress_pct: 0,
        updated_at: '2026-01-28T08:00:00Z',
      },
    ];
    vi.mocked(beadsServer.getEpics).mockReturnValue(epicsSortOrder);
    const request = new Request('http://test/epics');
    const loaderData = await loader(createLoaderArgs(request));
    const RouteComponent = () => (
      <EpicsIndex {...createComponentProps(loaderData)} />
    );
    const Stub = createRoutesStub([{ path: '/', Component: RouteComponent }]);
    render(<Stub />);

    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAccessibleName(/Running Epic/);
    expect(cards[1]).toHaveAccessibleName(/Open Epic/);
    expect(cards[2]).toHaveAccessibleName(/Closed Epic/);
  });

  it('each card is a single tap target with aria-label for accessibility', async () => {
    vi.mocked(beadsServer.getEpics).mockReturnValue(mockEpics);
    const request = new Request('http://test/epics');
    const loaderData = await loader(createLoaderArgs(request));
    const RouteComponent = () => (
      <EpicsIndex {...createComponentProps(loaderData)} />
    );
    const Stub = createRoutesStub([{ path: '/', Component: RouteComponent }]);
    render(<Stub />);

    const epicACard = screen.getByRole('button', {
      name: /Epic A.*2 of 4 tasks/,
    });
    const epicBCard = screen.getByRole('button', {
      name: /Epic B.*2 of 2 tasks/,
    });
    expect(epicACard).toBeInTheDocument();
    expect(epicBCard).toBeInTheDocument();
    expect(epicACard).toHaveAttribute('type', 'button');
  });

  it('displays current task and last activity when present', async () => {
    const epicsWithCurrentTask: beadsServer.EpicSummary[] = [
      {
        id: 'epic-curr',
        title: 'Epic With Current Task',
        status: 'in_progress',
        task_count: 5,
        completed_count: 2,
        progress_pct: 40,
        updated_at: '2026-01-30T12:00:00Z',
        current_task_title: 'QA: Loop Dashboard',
        current_task_agent: 'Bug Hunter',
      },
    ];
    vi.mocked(beadsServer.getEpics).mockReturnValue(epicsWithCurrentTask);
    const request = new Request('http://test/epics');
    const loaderData = await loader(createLoaderArgs(request));
    const RouteComponent = () => (
      <EpicsIndex {...createComponentProps(loaderData)} />
    );
    const Stub = createRoutesStub([{ path: '/', Component: RouteComponent }]);
    render(<Stub />);

    expect(screen.getByText('Epic With Current Task')).toBeInTheDocument();
    expect(screen.getByText(/QA: Loop Dashboard · Bug Hunter/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '2/5' })).toBeInTheDocument();
  });

  it('renders epic with unknown status as idle card', async () => {
    const epicsWithUnknownStatus: beadsServer.EpicSummary[] = [
      {
        id: 'epic-unknown',
        title: 'Epic with unknown status',
        status: 'tombstone' as BeadsTask['status'],
        task_count: 2,
        completed_count: 1,
        progress_pct: 50,
        updated_at: '2026-01-30T12:00:00Z',
      },
    ];
    vi.mocked(beadsServer.getEpics).mockReturnValue(epicsWithUnknownStatus);
    const request = new Request('http://test/epics');
    const loaderData = await loader(createLoaderArgs(request));
    const RouteComponent = () => (
      <EpicsIndex {...createComponentProps(loaderData)} />
    );
    const Stub = createRoutesStub([{ path: '/', Component: RouteComponent }]);
    render(<Stub />);

    expect(screen.getByText('Epic with unknown status')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '1/2' })).toBeInTheDocument();
  });

});

describe('getEpicCardTargetPath', () => {
  it('returns live path for in_progress (running) epic', () => {
    expect(getEpicCardTargetPath('epic-1', 'in_progress')).toBe(
      '/epics/epic-1/live'
    );
  });

  it('returns detail path for non-running statuses', () => {
    expect(getEpicCardTargetPath('epic-2', 'closed')).toBe('/epics/epic-2');
    expect(getEpicCardTargetPath('epic-3', 'open')).toBe('/epics/epic-3');
    expect(getEpicCardTargetPath('epic-4', 'blocked')).toBe('/epics/epic-4');
  });
});
