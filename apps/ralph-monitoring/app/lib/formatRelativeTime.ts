/**
 * Format an ISO date string as a relative time label (e.g. "2m ago", "1h ago").
 * Used for "last activity" on loop cards. Pure function for easy testing.
 *
 * @param isoDate - ISO 8601 date string (e.g. from updated_at)
 * @param nowMs - Optional reference time in ms (default: Date.now()); inject for tests
 * @returns Label like "1m ago", "2h ago", or "just now" for &lt; 1 minute
 */
export function formatRelativeTime(
  isoDate: string,
  nowMs: number = Date.now()
): string {
  const ts = Date.parse(isoDate);
  if (Number.isNaN(ts)) return '';

  const diffMs = nowMs - ts;
  if (diffMs < 0) return 'just now';
  if (diffMs < 60_000) return 'just now';
  if (diffMs < 3_600_000) {
    const minutes = Math.floor(diffMs / 60_000);
    return `${minutes}m ago`;
  }
  if (diffMs < 86_400_000) {
    const hours = Math.floor(diffMs / 3_600_000);
    return `${hours}h ago`;
  }
  const days = Math.floor(diffMs / 86_400_000);
  return `${days}d ago`;
}
