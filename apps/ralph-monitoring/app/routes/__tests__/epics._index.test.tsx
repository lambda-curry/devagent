/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EpicsIndex, { loader } from '../epics._index';
import type { Route } from '../+types/epics._index';
import * as beadsServer from '~/db/beads.server';
import type { BeadsTask } from '~/db/beads.server';
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

  it('renders epic list with title, status, task count, and progress', async () => {
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
    expect(screen.getByText('2 of 4 tasks completed')).toBeInTheDocument();
    expect(screen.getByText('2 of 2 tasks completed')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '50%' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '100%' })).toBeInTheDocument();
  });

  it('links each epic to epic detail view', async () => {
    vi.mocked(beadsServer.getEpics).mockReturnValue(mockEpics);
    const request = new Request('http://test/epics');
    const loaderData = await loader(createLoaderArgs(request));
    const RouteComponent = () => (
      <EpicsIndex {...createComponentProps(loaderData)} />
    );
    const Stub = createRoutesStub([{ path: '/', Component: RouteComponent }]);
    render(<Stub />);

    const links = screen.getAllByRole('link');
    const linkToEpicA = links.find((l) => l.getAttribute('href') === '/epics/epic-a');
    const linkToEpicB = links.find((l) => l.getAttribute('href') === '/epics/epic-b');
    expect(linkToEpicA).toBeInTheDocument();
    expect(linkToEpicB).toBeInTheDocument();
  });

  it('renders epic with unknown status using fallback icon', async () => {
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
    expect(screen.getByRole('progressbar', { name: '50%' })).toBeInTheDocument();
  });
});
