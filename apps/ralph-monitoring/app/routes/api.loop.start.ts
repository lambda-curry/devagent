import { data } from 'react-router';
import type { Route } from './+types/api.loop.start';
import { findRunFileByEpicId, spawnRalphLoop } from '~/utils/loop-start.server';

/**
 * POST /api/loop/start — start Ralph loop for the given epic ID.
 * Body: { "epicId": "devagent-..." } or { "epicId": "...", "runFilePath": "/absolute/path" }.
 */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    throw data({ success: false, message: 'Method not allowed' }, { status: 405 });
  }

  let epicId: string | undefined;
  let runFilePath: string | undefined;

  try {
    const body = await request.json().catch(() => ({})) as { epicId?: string; runFilePath?: string };
    epicId = typeof body?.epicId === 'string' ? body.epicId.trim() : undefined;
    runFilePath = typeof body?.runFilePath === 'string' ? body.runFilePath.trim() || undefined : undefined;
  } catch {
    throw data({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  if (!epicId) {
    throw data({ success: false, message: 'epicId is required' }, { status: 400 });
  }

  const resolvedRunFile = runFilePath ?? findRunFileByEpicId(epicId);
  if (!resolvedRunFile) {
    throw data(
      {
        success: false,
        message: runFilePath
          ? `Run file not found at ${runFilePath}`
          : `No run file found for epic ${epicId} in .devagent/plugins/ralph/runs`,
      },
      { status: 400 }
    );
  }

  const result = await spawnRalphLoop(resolvedRunFile);
  return data(result, { status: result.success ? 200 : 400 });
}
