import { describe, it, expect } from 'vitest';
import {
  logViewerReducer,
  createInitialState,
  type LogViewerState,
} from '../LogViewer.reducer';

// ============================================================================
// Tests for LogViewer Connection State Machine
// ============================================================================

describe('LogViewer reducer', () => {
  describe('createInitialState', () => {
    it('returns inactive state when task has no execution history', () => {
      const state = createInitialState(false, true, false);

      expect(state.wait.availability).toBe('inactive');
      expect(state.isLoading).toBe(false);
      expect(state.connection.status).toBe('idle');
    });

    it('returns inactive state when task is not active', () => {
      const state = createInitialState(true, false, true);

      expect(state.wait.availability).toBe('inactive');
      expect(state.isLoading).toBe(false);
    });

    it('returns waiting state when active task has execution history but no logs', () => {
      const state = createInitialState(true, true, false);

      expect(state.wait.availability).toBe('waiting');
      expect(state.isLoading).toBe(true);
    });

    it('returns available state when active task has logs', () => {
      const state = createInitialState(true, true, true);

      expect(state.wait.availability).toBe('available');
      expect(state.isLoading).toBe(true);
    });
  });

  describe('connection state transitions', () => {
    it('transitions from idle to connecting on CONNECT_START', () => {
      const initial = createInitialState(true, true, true);
      const next = logViewerReducer(initial, { type: 'CONNECT_START' });

      expect(next.connection.status).toBe('connecting');
      expect(next.connection.error).toBeNull();
      expect(next.isLoading).toBe(true);
    });

    it('transitions from connecting to connected on CONNECT_SUCCESS', () => {
      let state = createInitialState(true, true, true);
      state = logViewerReducer(state, { type: 'CONNECT_START' });
      state = logViewerReducer(state, { type: 'CONNECT_SUCCESS' });

      expect(state.connection.status).toBe('connected');
      expect(state.connection.error).toBeNull();
      expect(state.connection.retryCount).toBe(0);
      expect(state.connection.nextRetryDelayMs).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('transitions to error state on CONNECT_ERROR', () => {
      let state = createInitialState(true, true, true);
      state = logViewerReducer(state, { type: 'CONNECT_START' });
      state = logViewerReducer(state, {
        type: 'CONNECT_ERROR',
        error: { message: 'Connection failed', code: 'CONNECTION_ERROR' },
        recoverable: false,
      });

      expect(state.connection.status).toBe('error');
      expect(state.connection.error?.message).toBe('Connection failed');
      expect(state.connection.error?.code).toBe('CONNECTION_ERROR');
      expect(state.isLoading).toBe(false);
    });

    it('transitions from connected to reconnecting on CONNECTION_LOST', () => {
      let state = createInitialState(true, true, true);
      state = logViewerReducer(state, { type: 'CONNECT_START' });
      state = logViewerReducer(state, { type: 'CONNECT_SUCCESS' });
      state = logViewerReducer(state, { type: 'CONNECTION_LOST', nextRetryDelayMs: 2000 });

      expect(state.connection.status).toBe('reconnecting');
      expect(state.connection.error?.code).toBe('RECONNECTING');
      expect(state.connection.retryCount).toBe(1);
      expect(state.connection.nextRetryDelayMs).toBe(2000);
    });

    it('increments retryCount on repeated CONNECTION_LOST', () => {
      let state = createInitialState(true, true, true);
      state = logViewerReducer(state, { type: 'CONNECT_SUCCESS' });

      state = logViewerReducer(state, { type: 'CONNECTION_LOST', nextRetryDelayMs: 1000 });
      expect(state.connection.retryCount).toBe(1);

      state = logViewerReducer(state, { type: 'RECONNECT_START' });
      state = logViewerReducer(state, { type: 'CONNECTION_LOST', nextRetryDelayMs: 2000 });
      expect(state.connection.retryCount).toBe(2);

      state = logViewerReducer(state, { type: 'RECONNECT_START' });
      state = logViewerReducer(state, { type: 'CONNECTION_LOST', nextRetryDelayMs: 4000 });
      expect(state.connection.retryCount).toBe(3);
    });

    it('resets retryCount on successful reconnection', () => {
      let state = createInitialState(true, true, true);
      state = logViewerReducer(state, { type: 'CONNECT_SUCCESS' });
      state = logViewerReducer(state, { type: 'CONNECTION_LOST', nextRetryDelayMs: 1000 });
      state = logViewerReducer(state, { type: 'RECONNECT_START' });
      state = logViewerReducer(state, { type: 'CONNECTION_LOST', nextRetryDelayMs: 2000 });

      expect(state.connection.retryCount).toBe(2);

      state = logViewerReducer(state, { type: 'RECONNECT_START' });
      state = logViewerReducer(state, { type: 'CONNECT_SUCCESS' });

      expect(state.connection.retryCount).toBe(0);
      expect(state.connection.status).toBe('connected');
    });
  });

  describe('wait state transitions', () => {
    it('tracks wait attempts with WAIT_NEXT_ATTEMPT', () => {
      let state = createInitialState(true, true, false);

      state = logViewerReducer(state, { type: 'WAIT_NEXT_ATTEMPT', attempt: 1, nextDelayMs: 500 });
      expect(state.wait.availability).toBe('waiting');
      expect(state.wait.attempt).toBe(1);
      expect(state.wait.nextDelayMs).toBe(500);

      state = logViewerReducer(state, { type: 'WAIT_NEXT_ATTEMPT', attempt: 2, nextDelayMs: 1000 });
      expect(state.wait.attempt).toBe(2);
      expect(state.wait.nextDelayMs).toBe(1000);
    });

    it('transitions to available on WAIT_SUCCESS', () => {
      let state = createInitialState(true, true, false);
      state = logViewerReducer(state, { type: 'WAIT_NEXT_ATTEMPT', attempt: 2, nextDelayMs: 1000 });
      state = logViewerReducer(state, {
        type: 'WAIT_SUCCESS',
        logs: 'Log content here',
        warning: 'Some warning',
        truncated: true,
      });

      expect(state.wait.availability).toBe('available');
      expect(state.wait.attempt).toBe(0);
      expect(state.wait.nextDelayMs).toBeNull();
      expect(state.logs).toBe('Log content here');
      expect(state.warning).toBe('Some warning');
      expect(state.isTruncated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('transitions to missing on WAIT_EXHAUSTED', () => {
      let state = createInitialState(true, true, false);
      state = logViewerReducer(state, { type: 'WAIT_NEXT_ATTEMPT', attempt: 6, nextDelayMs: 8000 });
      state = logViewerReducer(state, {
        type: 'WAIT_EXHAUSTED',
        error: { message: 'Log file not found', code: 'NOT_FOUND', recoverable: false },
      });

      expect(state.wait.availability).toBe('missing');
      expect(state.wait.attempt).toBe(6); // Preserves attempt count for display
      expect(state.connection.error?.message).toBe('Log file not found');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('log content actions', () => {
    it('appends log content with APPEND_LOG', () => {
      let state = createInitialState(true, true, true);
      state = logViewerReducer(state, { type: 'CONNECT_SUCCESS' });

      state = logViewerReducer(state, { type: 'APPEND_LOG', data: 'Line 1' });
      expect(state.logs).toBe('Line 1');

      state = logViewerReducer(state, { type: 'APPEND_LOG', data: 'Line 2' });
      expect(state.logs).toBe('Line 1\nLine 2');

      state = logViewerReducer(state, { type: 'APPEND_LOG', data: 'Line 3' });
      expect(state.logs).toBe('Line 1\nLine 2\nLine 3');
    });

    it('replaces log content with SET_LOGS', () => {
      let state = createInitialState(true, true, true);
      state = logViewerReducer(state, { type: 'APPEND_LOG', data: 'Old content' });

      state = logViewerReducer(state, {
        type: 'SET_LOGS',
        logs: 'New content',
        warning: 'File is large',
        truncated: true,
      });

      expect(state.logs).toBe('New content');
      expect(state.warning).toBe('File is large');
      expect(state.isTruncated).toBe(true);
    });
  });

  describe('availability actions', () => {
    it('sets inactive state with SET_INACTIVE', () => {
      let state = createInitialState(true, true, true);
      state = logViewerReducer(state, { type: 'CONNECT_SUCCESS' });
      state = logViewerReducer(state, { type: 'APPEND_LOG', data: 'Some logs' });

      state = logViewerReducer(state, { type: 'SET_INACTIVE' });

      expect(state.wait.availability).toBe('inactive');
      expect(state.connection.status).toBe('idle');
      expect(state.connection.error).toBeNull();
      expect(state.isLoading).toBe(false);
      // Note: logs are preserved for display
      expect(state.logs).toBe('Some logs');
    });
  });

  describe('reset actions', () => {
    it('fully resets state with RESET', () => {
      let state = createInitialState(true, true, true);
      state = logViewerReducer(state, { type: 'CONNECT_SUCCESS' });
      state = logViewerReducer(state, { type: 'APPEND_LOG', data: 'Some logs' });
      state = logViewerReducer(state, { type: 'CONNECTION_LOST', nextRetryDelayMs: 2000 });

      state = logViewerReducer(state, { type: 'RESET' });

      expect(state.connection.status).toBe('idle');
      expect(state.connection.error).toBeNull();
      expect(state.connection.retryCount).toBe(0);
      expect(state.wait.availability).toBe('inactive');
      expect(state.wait.attempt).toBe(0);
      expect(state.logs).toBe('');
      expect(state.warning).toBeNull();
      expect(state.isTruncated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('prepares for retry with RETRY', () => {
      let state = createInitialState(true, true, true);
      state = logViewerReducer(state, {
        type: 'CONNECT_ERROR',
        error: { message: 'Failed', code: 'ERROR' },
        recoverable: false,
      });
      state = { ...state, logs: 'Old logs', warning: 'Old warning' };

      state = logViewerReducer(state, { type: 'RETRY' });

      expect(state.connection.status).toBe('idle');
      expect(state.connection.error).toBeNull();
      expect(state.connection.retryCount).toBe(0);
      expect(state.wait.attempt).toBe(0);
      expect(state.isLoading).toBe(true);
      expect(state.warning).toBeNull();
      expect(state.isTruncated).toBe(false);
      // Note: logs are preserved - they'll be replaced when new logs load
      expect(state.logs).toBe('Old logs');
    });
  });

  describe('impossible states are prevented', () => {
    it('cannot be connected and have a connection error simultaneously', () => {
      let state = createInitialState(true, true, true);
      state = logViewerReducer(state, { type: 'CONNECT_SUCCESS' });

      // Verify connected state has no error
      expect(state.connection.status).toBe('connected');
      expect(state.connection.error).toBeNull();

      // An error transitions out of connected
      state = logViewerReducer(state, {
        type: 'CONNECT_ERROR',
        error: { message: 'Error', code: 'ERROR' },
        recoverable: false,
      });
      expect(state.connection.status).toBe('error');
      expect(state.connection.error).not.toBeNull();
    });

    it('cannot be reconnecting with zero retry count', () => {
      let state = createInitialState(true, true, true);
      state = logViewerReducer(state, { type: 'CONNECT_SUCCESS' });
      state = logViewerReducer(state, { type: 'CONNECTION_LOST', nextRetryDelayMs: 1000 });

      // Reconnecting state always increments retry count
      expect(state.connection.status).toBe('reconnecting');
      expect(state.connection.retryCount).toBeGreaterThan(0);
    });

    it('wait availability and connection status are independent', () => {
      // Can have available logs but disconnected (static fallback)
      let state = createInitialState(true, true, true);
      state = logViewerReducer(state, {
        type: 'SET_LOGS',
        logs: 'Static logs',
      });
      state = logViewerReducer(state, {
        type: 'CONNECT_ERROR',
        error: { message: 'Stream failed', code: 'STREAM_ERROR' },
        recoverable: true,
      });

      expect(state.wait.availability).toBe('available');
      expect(state.connection.status).toBe('error');
      expect(state.logs).toBe('Static logs');
    });
  });
});
