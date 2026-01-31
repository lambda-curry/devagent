import { data } from 'react-router';
import type { Route } from './+types/api.loop.skip.$taskId';
import { createSkipSignal, getSignalState } from '~/utils/loop-control.server';

/**
 * POST /api/loop/skip/:taskId — create skip signal for the given task.
 */
export async function action({ params, request }: Route.ActionArgs) {
  const taskId = params.taskId;
  if (!taskId?.trim()) {
    throw data({ success: false, message: 'Task ID is required' }, { status: 400 });
  }

  if (request.method !== 'POST') {
    throw data({ success: false, message: 'Method not allowed' }, { status: 405 });
  }

  try {
    createSkipSignal(taskId.trim());
    const state = getSignalState();
    return data(
      { success: true, message: `Skip signal created for task ${taskId}`, signals: state },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error creating skip signal for ${taskId}:`, error);
    throw data({ success: false, message: `Failed to create skip signal: ${message}` }, { status: 500 });
  }
}
