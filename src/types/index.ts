export type ScreenType = 
  | 'welcome'
  | 'home'
  | 'tasks'
  | 'rewards'
  | 'badges'
  | 'leaderboard'
  | 'learn'
  | 'profile'
  | 'activity'
  | 'settings'
  | 'points-history';

export type TaskCategory = 'energy' | 'water' | 'waste' | 'food' | 'commute' | 'habits';

export type TaskDifficulty = 'Easy' | 'Medium' | 'Challenging';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  points: number;
  impactLabel: string;
  co2SavedKg: number;
  energySavedKwh: number;
  waterSavedL: number;
  durationMinutes: number;
  description: string;
  whyItMatters: string;
  actionSteps: string[];
  isCompletedToday: boolean;
  completedAt?: string;
  completedCount: number;
  verificationNote?: string;
}

export interface Badge {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  category: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  requirementDescription: string;
  currentProgress: number;
  targetProgress: number;
  bonusPoints: number;
}

export interface RewardItem {
  id: string;
  title: string;
  organization: string;
  costPoints: number;
  category: 'Tree Planting' | 'Clean Energy' | 'Eco Gear' | 'Water Access';
  description: string;
  impactMetric: string;
  claimedCount: number;
  imageEmoji: string;
}

export interface ClaimedVoucher {
  id: string;
  rewardId: string;
  rewardTitle: string;
  code: string;
  claimedAt: string;
  pointsSpent: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  readTimeMinutes: number;
  category: string;
  summary: string;
  keyPoints: string[];
  content: string[];
  quiz: QuizQuestion[];
  isCompleted: boolean;
  bonusPoints: number;
}

export interface ActivityLog {
  id: string;
  type: 'task_completed' | 'quiz_completed' | 'reward_claimed' | 'badge_unlocked' | 'streak_bonus';
  title: string;
  pointsDelta: number;
  timestamp: string;
  impactDetails?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  location: string;
  points: number;
  badgesCount: number;
  isCurrentUser?: boolean;
  avatarSeed: string;
}

export interface UserState {
  hasOnboarded: boolean;
  name: string;
  location: string;
  points: number;
  streakDays: number;
  lastActiveDate: string;
  co2AvoidedKg: number;
  energySavedKwh: number;
  waterConservedL: number;
  plasticBottlesAvoided: number;
  treesPlanted: number;
  completedTaskIds: string[];
  unlockedBadgeIds: string[];
  claimedVouchers: ClaimedVoucher[];
  completedLessonIds: string[];
  activityLogs: ActivityLog[];
  notificationEnabled: boolean;
  dailyGoalPoints: number;
}
