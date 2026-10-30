/**
 * unit/schemas.test.ts — Unit tests for Zod validation schemas.
 */
import { describe, it, expect } from 'vitest';
import {
  UpdateProfileSchema,
  CompleteTaskSchema,
  QuizSubmitSchema,
  UpdateSettingsSchema,
  LeaderboardQuerySchema,
} from '../../schemas';

describe('Zod Validation Schemas', () => {
  describe('UpdateProfileSchema', () => {
    it('accepts valid profile updates', () => {
      const parsed = UpdateProfileSchema.parse({
        name: 'Devan S.',
        location: 'Bengaluru, India',
        hasOnboarded: true,
      });
      expect(parsed.name).toBe('Devan S.');
      expect(parsed.location).toBe('Bengaluru, India');
      expect(parsed.hasOnboarded).toBe(true);
    });

    it('rejects empty name', () => {
      expect(() => UpdateProfileSchema.parse({ name: '' })).toThrow();
    });

    it('rejects overly long name (> 100 chars)', () => {
      expect(() =>
        UpdateProfileSchema.parse({ name: 'A'.repeat(101) })
      ).toThrow();
    });
  });

  describe('CompleteTaskSchema', () => {
    it('accepts empty verificationNote', () => {
      const parsed = CompleteTaskSchema.parse({});
      expect(parsed.verificationNote).toBe('');
    });

    it('accepts valid verificationNote', () => {
      const parsed = CompleteTaskSchema.parse({
        verificationNote: 'Switched off air conditioner at 10pm',
      });
      expect(parsed.verificationNote).toBe(
        'Switched off air conditioner at 10pm'
      );
    });

    it('rejects overly long verificationNote (> 500 chars)', () => {
      expect(() =>
        CompleteTaskSchema.parse({ verificationNote: 'x'.repeat(501) })
      ).toThrow();
    });
  });

  describe('QuizSubmitSchema', () => {
    it('accepts valid answer arrays', () => {
      const parsed = QuizSubmitSchema.parse({ answers: [1, 0, 2] });
      expect(parsed.answers).toEqual([1, 0, 2]);
    });

    it('rejects empty answer arrays', () => {
      expect(() => QuizSubmitSchema.parse({ answers: [] })).toThrow();
    });

    it('rejects negative answer indices', () => {
      expect(() => QuizSubmitSchema.parse({ answers: [-1] })).toThrow();
    });
  });

  describe('UpdateSettingsSchema', () => {
    it('accepts valid daily goal points: 25, 50, 75, 100', () => {
      expect(UpdateSettingsSchema.parse({ dailyGoalPoints: 25 }).dailyGoalPoints).toBe(25);
      expect(UpdateSettingsSchema.parse({ dailyGoalPoints: 50 }).dailyGoalPoints).toBe(50);
      expect(UpdateSettingsSchema.parse({ dailyGoalPoints: 75 }).dailyGoalPoints).toBe(75);
      expect(UpdateSettingsSchema.parse({ dailyGoalPoints: 100 }).dailyGoalPoints).toBe(100);
    });

    it('rejects arbitrary daily goal points (e.g. 999 or 33)', () => {
      expect(() => UpdateSettingsSchema.parse({ dailyGoalPoints: 999 })).toThrow();
    });

    it('accepts boolean notificationEnabled', () => {
      const parsed = UpdateSettingsSchema.parse({ notificationEnabled: false });
      expect(parsed.notificationEnabled).toBe(false);
    });
  });

  describe('LeaderboardQuerySchema', () => {
    it('coerces strings to numbers for page and limit', () => {
      const parsed = LeaderboardQuerySchema.parse({ page: '2', limit: '10' });
      expect(parsed.page).toBe(2);
      expect(parsed.limit).toBe(10);
      expect(parsed.period).toBe('all-time');
    });

    it('accepts weekly period', () => {
      const parsed = LeaderboardQuerySchema.parse({ period: 'weekly' });
      expect(parsed.period).toBe('weekly');
    });

    it('rejects invalid period', () => {
      expect(() => LeaderboardQuerySchema.parse({ period: 'invalid' })).toThrow();
    });
  });
});
