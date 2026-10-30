/**
 * client.ts — Typed API client for GRIDSHIELD AI.
 * Handles authentication header injection and structured error responses.
 */
import { UserState, Task, RewardItem, Lesson, Badge, ClaimedVoucher, ActivityLog, LeaderboardEntry } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

let authTokenProvider: ((forceRefresh?: boolean) => Promise<string | null>) | null = null;

export function setAuthTokenProvider(provider: (forceRefresh?: boolean) => Promise<string | null>) {
  authTokenProvider = provider;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly issues?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}, retryOnAuth = true): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (authTokenProvider) {
    const token = await authTokenProvider(false);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle token refresh on 401 if a token provider exists
  if (response.status === 401 && retryOnAuth && authTokenProvider) {
    try {
      const freshToken = await authTokenProvider(true /* forceRefresh */);
      if (freshToken) {
        headers.set('Authorization', `Bearer ${freshToken}`);
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });

        if (retryResponse.status === 204) {
          return {} as T;
        }

        const retryData = await retryResponse.json().catch(() => ({}));
        if (!retryResponse.ok) {
          throw new ApiError(
            retryResponse.status,
            retryData.message || retryData.error || `HTTP ${retryResponse.status}`,
            retryData.issues
          );
        }
        return retryData as T;
      }
    } catch (refreshErr) {
      if (refreshErr instanceof ApiError) throw refreshErr;
      // Fall through to standard error handling
    }
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || data.error || `HTTP ${response.status}`,
      data.issues
    );
  }

  return data as T;
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; database: string }>('/health'),

  // User Profile
  getMe: () => request<UserState & { id: string; level: any }>('/me'),
  updateMe: (payload: { name?: string; location?: string; hasOnboarded?: boolean }) =>
    request<{ name?: string; location?: string; hasOnboarded?: boolean }>('/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteMe: () => request<void>('/me', { method: 'DELETE' }),

  // Dashboard
  getDashboard: () =>
    request<{
      user: UserState;
      level: any;
      completedTasksToday: string[];
      completedTasksTotal: number;
      completedLessonSlugs: string[];
      unlockedBadges: Badge[];
      todayPoints: number;
      recentActivity: ActivityLog[];
    }>('/dashboard'),

  // Tasks
  getTasks: (params?: { category?: string; difficulty?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<Task[]>(`/tasks${query ? `?${query}` : ''}`);
  },
  getMyTasks: () => request<{ completedToday: string[]; completedEver: string[] }>('/me/tasks'),
  completeTask: (taskId: string, verificationNote?: string) =>
    request<{
      pointsAwarded: number;
      newBalance: number;
      badgesUnlocked: string[];
      completedAt: string;
    }>(`/tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ verificationNote: verificationNote || '' }),
    }),

  // Rewards
  getRewards: () => request<RewardItem[]>('/rewards'),
  redeemReward: (rewardId: string) =>
    request<{
      voucherCode: string;
      rewardTitle: string;
      pointsSpent: number;
      newBalance: number;
      badgesUnlocked: string[];
    }>(`/rewards/${rewardId}/redeem`, {
      method: 'POST',
    }),
  getMyVouchers: () => request<ClaimedVoucher[]>('/me/vouchers'),

  // Badges
  getBadges: () => request<Badge[]>('/badges'),
  getMyBadges: () => request<{ unlocked: any[]; progress: Badge[] }>('/me/badges'),

  // Lessons
  getLessons: () => request<Lesson[]>('/lessons'),
  getLesson: (lessonId: string) => request<Lesson>(`/lessons/${lessonId}`),
  submitQuiz: (lessonId: string, answers: number[]) =>
    request<{
      score: number;
      passed: boolean;
      correctCount: number;
      total: number;
      bonusPointsAwarded: number;
      isFirstPass: boolean;
      newBalance?: number;
      badgesUnlocked: string[];
      results: Array<{ correct: boolean; explanation: string }>;
    }>(`/lessons/${lessonId}/quiz/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  // Community Leaderboard
  getLeaderboard: (period: 'weekly' | 'all-time' = 'all-time', page = 1, limit = 20) =>
    request<{
      entries: LeaderboardEntry[];
      currentUserRank: number | null;
      total: number;
      page: number;
      limit: number;
    }>(`/leaderboard?period=${period}&page=${page}&limit=${limit}`),

  // Activity & History
  getActivity: (page = 1, limit = 20) =>
    request<{ logs: ActivityLog[]; total: number; page: number; limit: number }>(
      `/me/activity?page=${page}&limit=${limit}`
    ),
  getPointsHistory: (page = 1, limit = 20) =>
    request<{ entries: any[]; total: number; page: number; limit: number }>(
      `/me/points/history?page=${page}&limit=${limit}`
    ),

  // Settings
  getSettings: () => request<{ notificationEnabled: boolean; dailyGoalPoints: number }>('/me/settings'),
  updateSettings: (payload: { notificationEnabled?: boolean; dailyGoalPoints?: number }) =>
    request<{ notificationEnabled: boolean; dailyGoalPoints: number }>('/me/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
