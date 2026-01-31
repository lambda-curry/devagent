/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loader } from '../_index';
import type { Route } from '../+types/_index';
import * as projectsServer from '~/lib/projects.server';

vi.mock('~/lib/projects.server', () => ({ getDefaultProjectId: vi.fn() }));

const createLoaderArgs = (): Route.LoaderArgs => ({
  request: new Request('http://localhost/'),
  params: {},
  context: {},
  unstable_pattern: ''
});

describe('Index (root)', () => {
  beforeEach(() => {
    vi.mocked(projectsServer.getDefaultProjectId).mockReturnValue(null);
  });

  it('should redirect to /projects/combined when no default project', async () => {
    const result = await loader(createLoaderArgs());
    expect(result).toBeInstanceOf(Response);
    const response = result as Response;
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/projects/combined');
  });

  it('should redirect to default project when set in config', async () => {
    vi.mocked(projectsServer.getDefaultProjectId).mockReturnValue('my-project');
    const result = await loader(createLoaderArgs());
    expect(result).toBeInstanceOf(Response);
    const response = result as Response;
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/projects/my-project');
  });
});
