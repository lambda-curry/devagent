/**
 * retry.ts
 *
 * Exponential backoff with jitter for retries.
 */

export interface BackoffOptions {
  delay: number;
  backoff: number;
  maxDelay?: number;
  jitter?: boolean;
}

/**
 * Sleeps for a given duration.
 * @param ms Duration to sleep in milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculates the next delay for exponential backoff.
 * @param currentDelay The current delay.
 * @param backoff The backoff factor.
 * @param jitter Whether to apply jitter.
 * @param maxDelay Optional maximum delay.
 * @returns The next delay in milliseconds.
 */
export function calculateNextDelay(
  currentDelay: number,
  backoff: number,
  jitter: boolean = true,
  maxDelay?: number
): number {
  let next = currentDelay * backoff;

  if (jitter) {
    // Apply jitter: ±25%
    next = next * (0.75 + Math.random() * 0.5);
  }

  if (maxDelay && next > maxDelay) {
    next = maxDelay;
  }

  return Math.round(next);
}
