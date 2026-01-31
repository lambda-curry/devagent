import { data } from 'react-router';
import type { Route } from './+types/api.tasks.$taskId.stop';
import { stopTaskProcess } from '~/utils/process.server';

/**
 * API endpoint to stop a running task process
 * Sends SIGTERM, then SIGKILL if needed
 * Handles process groups if available.
 * Optional query: projectId — for multi-project (reserved for future per-project PID dirs).
 */
export async function action({ params, request }: Route.ActionArgs) {
  const taskId = params.taskId;
  const url = new URL(request.url);
  const _projectId = url.searchParams.get('projectId') ?? undefined;

  if (!taskId) {
    throw data({ success: false, message: 'Task ID is required' }, { status: 400 });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    throw data({ success: false, message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const result = await stopTaskProcess(taskId);
    
    return data(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error stopping task ${taskId}:`, error);
    
    throw data({ 
      success: false, 
      message: `Failed to stop task: ${errorMessage}` 
    }, { status: 500 });
  }
}
