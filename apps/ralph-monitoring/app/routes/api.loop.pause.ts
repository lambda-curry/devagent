import { data } from 'react-router';
import type { Route } from './+types/api.loop.pause';
import { createPauseSignal, getSignalState } from '~/utils/loop-control.server';

/**
 * POST /api/loop/pause — create pause signal and return current status.
 */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    throw data({ success: false, message: 'Method not allowed' }, { status: 405 });
  }

  try {
    createPauseSignal();
    const state = getSignalState();
    return data(
      { success: true, message: 'Pause signal created', signals: state },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating pause signal:', error);
    throw data({ success: false, message: `Failed to create pause signal: ${message}` }, { status: 500 });
  }
}
