/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { loader } from '../_index';
import type { Route } from '../+types/_index';

const createLoaderArgs = (): Route.LoaderArgs => ({
  request: new Request('http://localhost/'),
  params: {},
  context: {},
  unstable_pattern: ''
});

describe('Index (root)', () => {
  it('should redirect to /projects/combined', async () => {
    const result = await loader(createLoaderArgs());
    expect(result).toBeInstanceOf(Response);
    const response = result as Response;
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/projects/combined');
  });
});
