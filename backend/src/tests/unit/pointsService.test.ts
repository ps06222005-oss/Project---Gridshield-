/**
 * unit/pointsService.test.ts — Unit tests for level calculation.
 * These tests do NOT require a database connection.
 */
import { describe, it, expect } from 'vitest';
import { calculateUserLevel, LEVEL_THRESHOLDS } from '../../services/pointsService';

describe('calculateUserLevel', () => {
  it('returns level 1 for 0 points', () => {
    const info = calculateUserLevel(0);
    expect(info.level).toBe(1);
    expect(info.title).toBe('Seedling Steward');
    expect(info.progressPercent).toBe(0);
  });

  it('returns level 1 for 50 points (mid-level)', () => {
    const info = calculateUserLevel(50);
    expect(info.level).toBe(1);
    expect(info.progressPercent).toBe(50);
  });

  it('returns level 2 at exactly 100 points', () => {
    const info = calculateUserLevel(100);
    expect(info.level).toBe(2);
    expect(info.title).toBe('Sprout Guardian');
  });

  it('returns level 3 at 250 points', () => {
    expect(calculateUserLevel(250).level).toBe(3);
  });

  it('returns level 6 at max threshold', () => {
    const info = calculateUserLevel(1500);
    expect(info.level).toBe(6);
    expect(info.title).toBe('Planetary Shield');
  });

  it('caps progress at 100% within a level', () => {
    // Just below next level threshold
    const info = calculateUserLevel(99);
    expect(info.progressPercent).toBeLessThanOrEqual(100);
  });

  it('handles negative points safely', () => {
    const info = calculateUserLevel(-50);
    expect(info.level).toBe(1);
    expect(info.progressPercent).toBe(0);
  });

  it('level thresholds are contiguous (no gaps)', () => {
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      expect(LEVEL_THRESHOLDS[i].minPoints).toBe(LEVEL_THRESHOLDS[i - 1].maxPoints);
    }
  });
});
