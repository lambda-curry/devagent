/**
 * retry.test.ts
 *
 * Unit tests for retry logic.
 */
import { describe, expect, it, vi } from 'vitest';
import { calculateNextDelay } from '../utils/retry';

describe('Retry Logic', () => {
  describe('calculateNextDelay', () => {
    it('should calculate exponential backoff without jitter', () => {
      let delay = 1000;
      const backoff = 1.5;

      delay = calculateNextDelay(delay, backoff, false);
      expect(delay).toBe(1500);

      delay = calculateNextDelay(delay, backoff, false);
      expect(delay).toBe(2250);

      delay = calculateNextDelay(delay, backoff, false);
      expect(delay).toBe(3375);
    });

    it('should calculate exponential backoff with jitter', () => {
      const delay = 1000;
      const backoff = 1.5;
      const nextDelay = 1500;

      for (let i = 0; i < 100; i++) {
        const result = calculateNextDelay(delay, backoff, true);
        // Jitter is ±25%, so the range is [1500 * 0.75, 1500 * 1.25]
        expect(result).toBeGreaterThanOrEqual(nextDelay * 0.75);
        expect(result).toBeLessThanOrEqual(nextDelay * 1.25);
      }
    });

    it('should cap the delay at maxDelay', () => {
      let delay = 5000;
      const backoff = 2;
      const maxDelay = 8000;

      delay = calculateNextDelay(delay, backoff, false, maxDelay);
      expect(delay).toBe(8000); // 5000 * 2 = 10000, capped at 8000
    });

    it('should not exceed maxDelay even with jitter', () => {
      const delay = 8000;
      const backoff = 2;
      const maxDelay = 10000;

      for (let i = 0; i < 100; i++) {
        const result = calculateNextDelay(delay, backoff, true, maxDelay);
        expect(result).toBeLessThanOrEqual(maxDelay);
      }
    });
  });
});
