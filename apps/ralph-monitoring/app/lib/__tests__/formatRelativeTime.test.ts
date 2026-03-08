import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from '../formatRelativeTime';

describe('formatRelativeTime', () => {
  const base = new Date('2026-02-09T12:00:00Z').getTime();

  it('returns "just now" for less than 1 minute ago', () => {
    const t = new Date(base - 30_000).toISOString();
    expect(formatRelativeTime(t, base)).toBe('just now');
  });

  it('returns "just now" for 0 ms ago', () => {
    expect(formatRelativeTime(new Date(base).toISOString(), base)).toBe('just now');
  });

  it('returns "1m ago" for 1 minute ago', () => {
    const t = new Date(base - 60_000).toISOString();
    expect(formatRelativeTime(t, base)).toBe('1m ago');
  });

  it('returns "2m ago" for 2 minutes ago', () => {
    const t = new Date(base - 2 * 60_000).toISOString();
    expect(formatRelativeTime(t, base)).toBe('2m ago');
  });

  it('returns "1h ago" for 1 hour ago', () => {
    const t = new Date(base - 3_600_000).toISOString();
    expect(formatRelativeTime(t, base)).toBe('1h ago');
  });

  it('returns "2h ago" for 2 hours ago', () => {
    const t = new Date(base - 2 * 3_600_000).toISOString();
    expect(formatRelativeTime(t, base)).toBe('2h ago');
  });

  it('returns "1d ago" for 1 day ago', () => {
    const t = new Date(base - 86_400_000).toISOString();
    expect(formatRelativeTime(t, base)).toBe('1d ago');
  });

  it('returns empty string for invalid ISO date', () => {
    expect(formatRelativeTime('not-a-date', base)).toBe('');
  });

  it('returns "just now" for future date', () => {
    const t = new Date(base + 60_000).toISOString();
    expect(formatRelativeTime(t, base)).toBe('just now');
  });
});
