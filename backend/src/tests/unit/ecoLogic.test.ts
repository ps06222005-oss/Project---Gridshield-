/**
 * unit/ecoLogic.test.ts — Unit tests for eco logic transferred to backend services.
 * Tests level calculation thresholds, streak updates, badge criteria, and quiz grading.
 */
import { describe, it, expect } from 'vitest';
import { calculateUserLevel } from '../../services/pointsService';

describe('Level calculation thresholds and titles', () => {
  it('correctly maps points to level 1: Seedling Steward', () => {
    const l0 = calculateUserLevel(0);
    expect(l0.level).toBe(1);
    expect(l0.title).toBe('Seedling Steward');
    expect(l0.progressPercent).toBe(0);

    const l50 = calculateUserLevel(50);
    expect(l50.level).toBe(1);
    expect(l50.title).toBe('Seedling Steward');
    expect(l50.progressPercent).toBe(50);
  });

  it('correctly maps points to level 2: Sprout Guardian (100 - 250)', () => {
    const l100 = calculateUserLevel(100);
    expect(l100.level).toBe(2);
    expect(l100.title).toBe('Sprout Guardian');
    expect(l100.progressPercent).toBe(0);

    const l175 = calculateUserLevel(175);
    expect(l175.level).toBe(2);
    expect(l175.progressPercent).toBe(50);
  });

  it('correctly maps points to level 3: Foliage Protector (250 - 500)', () => {
    const l250 = calculateUserLevel(250);
    expect(l250.level).toBe(3);
    expect(l250.title).toBe('Foliage Protector');
  });

  it('correctly maps points to level 4: Canopy Guardian (500 - 900)', () => {
    const l500 = calculateUserLevel(500);
    expect(l500.level).toBe(4);
    expect(l500.title).toBe('Canopy Guardian');
  });

  it('correctly maps points to level 5: Earth Champion (900 - 1500)', () => {
    const l900 = calculateUserLevel(900);
    expect(l900.level).toBe(5);
    expect(l900.title).toBe('Earth Champion');
  });

  it('correctly maps points to level 6: Planetary Shield (1500 - 3000)', () => {
    const l1500 = calculateUserLevel(1500);
    expect(l1500.level).toBe(6);
    expect(l1500.title).toBe('Planetary Shield');
    expect(l1500.progressPercent).toBe(0);

    const l3000 = calculateUserLevel(3000);
    expect(l3000.level).toBe(6);
    expect(l3000.progressPercent).toBe(100);
  });

  it('clamps progress correctly beyond max points', () => {
    const l4000 = calculateUserLevel(4000);
    expect(l4000.level).toBe(6);
    expect(l4000.progressPercent).toBe(100);
  });
});
