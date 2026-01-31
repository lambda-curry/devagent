import { data } from 'react-router';
import type { Route } from './+types/api.loop.resume';
import { removePauseAndCreateResume, getSignalState } from '~/utils/loop-control.server';

/**
 * POST /api/loop/resume — remove pause signal and create resume so the loop continues.
 */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    throw data({ success: false, message: 'Method not allowed' }, { status: 405 });
  }

  try {
    removePauseAndCreateResume();
    const state = getSignalState();
    return data(
      { success: true, message: 'Resume signal created; pause removed', signals: state },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating resume signal:', error);
    throw data({ success: false, message: `Failed to create resume signal: ${message}` }, { status: 500 });
  }
}
