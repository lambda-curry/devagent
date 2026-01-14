import { stopTaskProcess } from '~/utils/process.server';

/**
 * API endpoint to stop a running task process
 * Sends SIGTERM, then SIGKILL if needed
 * Handles process groups if available
 */
export async function action({ params, request }: { params: { taskId?: string }; request: Request }) {
  const taskId = params.taskId;
  
  if (!taskId) {
    return new Response(JSON.stringify({ success: false, message: 'Task ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await stopTaskProcess(taskId);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error stopping task ${taskId}:`, error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: `Failed to stop task: ${errorMessage}` 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
