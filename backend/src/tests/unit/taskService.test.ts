/**
 * unit/taskService.test.ts — Unit tests for user timezone policy and date utility.
 */
import { describe, it, expect } from 'vitest';
import { utcDateString, getUserLocalDateString } from '../../services/taskService';

describe('utcDateString', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const result = utcDateString(new Date('2026-10-29T10:30:00.000Z'));
    expect(result).toBe('2026-10-29');
  });

  it('returns today when called with no argument', () => {
    const result = utcDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('correctly handles midnight boundary (UTC)', () => {
    const result = utcDateString(new Date('2026-10-28T23:59:59.000Z'));
    expect(result).toBe('2026-10-28');
    const result2 = utcDateString(new Date('2026-10-29T00:00:00.000Z'));
    expect(result2).toBe('2026-10-29');
  });
});

describe('getUserLocalDateString (User Timezone Policy)', () => {
  it('calculates calendar date in Asia/Kolkata (UTC+5:30) correctly', () => {
    // 2026-10-28 20:00:00 UTC is 2026-10-29 01:30:00 in India
    const d = new Date('2026-10-28T20:00:00.000Z');
    expect(getUserLocalDateString(d, 'Asia/Kolkata')).toBe('2026-10-29');
    expect(utcDateString(d)).toBe('2026-10-28');
  });

  it('calculates calendar date in America/New_York (UTC-4/-5) correctly', () => {
    // 2026-10-29 02:00:00 UTC is still 2026-10-28 22:00:00 in New York (EDT)
    const d = new Date('2026-10-29T02:00:00.000Z');
    expect(getUserLocalDateString(d, 'America/New_York')).toBe('2026-10-28');
    expect(utcDateString(d)).toBe('2026-10-29');
  });

  it('falls back gracefully to UTC on invalid timezone string', () => {
    const d = new Date('2026-10-29T12:00:00.000Z');
    expect(getUserLocalDateString(d, 'Invalid/Timezone')).toBe('2026-10-29');
  });
});
