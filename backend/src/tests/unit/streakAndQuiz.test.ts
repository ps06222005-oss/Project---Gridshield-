/**
 * unit/streakAndQuiz.test.ts — Unit tests for streak tracking logic,
 * server-side quiz grading algorithm, and voucher code generation.
 */
import { describe, it, expect, vi } from 'vitest';
import { Types } from 'mongoose';
import { User } from '../../models/User';
import { updateStreak, deleteUser } from '../../services/userService';
import { getUserLocalDateString } from '../../services/taskService';
import { TaskCompletion } from '../../models/TaskCompletion';
import { PointsLedger } from '../../models/PointsLedger';
import { UserBadge } from '../../models/UserBadge';
import { RewardRedemption } from '../../models/RewardRedemption';
import { QuizAttempt } from '../../models/QuizAttempt';
import { UserSettings } from '../../models/UserSettings';

describe('Streak calculation policy', () => {
  it('increments streak when active on consecutive day in user timezone', async () => {
    const userId = new Types.ObjectId();
    const tz = 'Asia/Kolkata';
    const yesterday = getUserLocalDateString(new Date(Date.now() - 86_400_000), tz);

    const mockUser = {
      _id: userId,
      timezone: tz,
      streakDays: 3,
      lastActiveDate: yesterday,
    };

    vi.spyOn(User, 'findById').mockReturnValue({
      session: vi.fn().mockResolvedValue(mockUser),
    } as any);

    const updateSpy = vi.spyOn(User, 'findByIdAndUpdate').mockResolvedValue(mockUser as any);

    await updateStreak(userId);

    const today = getUserLocalDateString(new Date(), tz);
    expect(updateSpy).toHaveBeenCalledWith(
      userId,
      { lastActiveDate: today, streakDays: 4 },
      { session: undefined }
    );
  });

  it('resets streak to 1 when there is a gap > 1 day', async () => {
    const userId = new Types.ObjectId();
    const tz = 'Asia/Kolkata';
    const twoDaysAgo = getUserLocalDateString(new Date(Date.now() - 2 * 86_400_000), tz);

    const mockUser = {
      _id: userId,
      timezone: tz,
      streakDays: 10,
      lastActiveDate: twoDaysAgo,
    };

    vi.spyOn(User, 'findById').mockReturnValue({
      session: vi.fn().mockResolvedValue(mockUser),
    } as any);

    const updateSpy = vi.spyOn(User, 'findByIdAndUpdate').mockResolvedValue(mockUser as any);

    await updateStreak(userId);

    const today = getUserLocalDateString(new Date(), tz);
    expect(updateSpy).toHaveBeenCalledWith(
      userId,
      { lastActiveDate: today, streakDays: 1 },
      { session: undefined }
    );
  });

  it('does not alter streak if already active today', async () => {
    const userId = new Types.ObjectId();
    const tz = 'Asia/Kolkata';
    const today = getUserLocalDateString(new Date(), tz);

    const mockUser = {
      _id: userId,
      timezone: tz,
      streakDays: 5,
      lastActiveDate: today,
    };

    vi.spyOn(User, 'findById').mockReturnValue({
      session: vi.fn().mockResolvedValue(mockUser),
    } as any);

    const updateSpy = vi.spyOn(User, 'findByIdAndUpdate');
    updateSpy.mockClear();

    await updateStreak(userId);

    expect(updateSpy).not.toHaveBeenCalled();
  });
});

describe('deleteUser cascade cleanup', () => {
  it('deletes all private user records across all models', async () => {
    const userId = new Types.ObjectId();

    const taskSpy = vi.spyOn(TaskCompletion, 'deleteMany').mockResolvedValue({} as any);
    const ledgerSpy = vi.spyOn(PointsLedger, 'deleteMany').mockResolvedValue({} as any);
    const badgeSpy = vi.spyOn(UserBadge, 'deleteMany').mockResolvedValue({} as any);
    const rewardSpy = vi.spyOn(RewardRedemption, 'deleteMany').mockResolvedValue({} as any);
    const quizSpy = vi.spyOn(QuizAttempt, 'deleteMany').mockResolvedValue({} as any);
    const settingsSpy = vi.spyOn(UserSettings, 'deleteOne').mockResolvedValue({} as any);
    const userSpy = vi.spyOn(User, 'findByIdAndDelete').mockResolvedValue({} as any);

    await deleteUser(userId);

    expect(taskSpy).toHaveBeenCalledWith({ userId });
    expect(ledgerSpy).toHaveBeenCalledWith({ userId });
    expect(badgeSpy).toHaveBeenCalledWith({ userId });
    expect(rewardSpy).toHaveBeenCalledWith({ userId });
    expect(quizSpy).toHaveBeenCalledWith({ userId });
    expect(settingsSpy).toHaveBeenCalledWith({ userId });
    expect(userSpy).toHaveBeenCalledWith(userId);
  });
});

describe('Timezone day-boundary calculations across global zones', () => {
  it('handles UTC+14 (Kiribati) and UTC-10 (Honolulu) at the exact same instant', () => {
    const d = new Date('2026-10-29T00:30:00.000Z');
    // In Kiribati (UTC+14), it is 2026-10-29 14:30
    const dateKiribati = getUserLocalDateString(d, 'Pacific/Kiritimati');
    // In Honolulu (UTC-10), it is 2026-10-28 14:30
    const dateHonolulu = getUserLocalDateString(d, 'Pacific/Honolulu');

    expect(dateKiribati).toBe('2026-10-29');
    expect(dateHonolulu).toBe('2026-10-28');
  });

  it('correctly tracks date at 23:59:59 and 00:00:01 in Tokyo (UTC+9)', () => {
    // 14:59:59 UTC = 23:59:59 Tokyo
    const beforeMidnight = new Date('2026-10-28T14:59:59.000Z');
    expect(getUserLocalDateString(beforeMidnight, 'Asia/Tokyo')).toBe('2026-10-28');

    // 15:00:01 UTC = 00:00:01 Tokyo next day
    const afterMidnight = new Date('2026-10-28T15:00:01.000Z');
    expect(getUserLocalDateString(afterMidnight, 'Asia/Tokyo')).toBe('2026-10-29');
  });
});
