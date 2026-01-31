/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { loader } from '../tasks.$taskId';
import type { Route } from '../+types/tasks.$taskId';

const createLoaderArgs = (taskId: string): Route.LoaderArgs => ({
  params: { taskId },
  request: new Request(`http://localhost/tasks/${taskId}`),
  context: {},
  unstable_pattern: ''
});

describe('tasks.$taskId (legacy redirect)', () => {
  it('should redirect to /projects/combined when taskId is missing', async () => {
    const result = await loader({
      ...createLoaderArgs(''),
      params: {}
    } as Route.LoaderArgs);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('Location')).toBe('/projects/combined');
  });

  it('should redirect to /projects/combined/tasks/:taskId', async () => {
    const result = await loader(createLoaderArgs('devagent-kwy.1'));
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(302);
    expect((result as Response).headers.get('Location')).toBe('/projects/combined/tasks/devagent-kwy.1');
  });
});
