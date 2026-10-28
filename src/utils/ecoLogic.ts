import { UserState, Task, RewardItem, ClaimedVoucher, ActivityLog, Badge, QuizQuestion } from '../types';

export interface UserLevelInfo {
  level: number;
  title: string;
  currentLevelPoints: number;
  nextLevelPoints: number;
  progressPercent: number;
}

export const LEVEL_THRESHOLDS = [
  { level: 1, title: 'Seedling Steward', minPoints: 0, maxPoints: 100 },
  { level: 2, title: 'Sprout Guardian', minPoints: 100, maxPoints: 250 },
  { level: 3, title: 'Foliage Protector', minPoints: 250, maxPoints: 500 },
  { level: 4, title: 'Canopy Guardian', minPoints: 500, maxPoints: 900 },
  { level: 5, title: 'Earth Champion', minPoints: 900, maxPoints: 1500 },
  { level: 6, title: 'Planetary Shield', minPoints: 1500, maxPoints: 3000 },
];

export function calculateUserLevel(points: number): UserLevelInfo {
  const safePoints = Math.max(0, points);
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    const tier = LEVEL_THRESHOLDS[i];
    if (safePoints >= tier.minPoints) {
      const span = tier.maxPoints - tier.minPoints;
      const progress = span > 0 ? Math.min(100, Math.round(((safePoints - tier.minPoints) / span) * 100)) : 100;
      return {
        level: tier.level,
        title: tier.title,
        currentLevelPoints: safePoints - tier.minPoints,
        nextLevelPoints: tier.maxPoints,
        progressPercent: progress,
      };
    }
  }
  return {
    level: 1,
    title: 'Seedling Steward',
    currentLevelPoints: safePoints,
    nextLevelPoints: 100,
    progressPercent: Math.min(100, safePoints),
  };
}

export function completeTaskAction(
  currentState: UserState,
  task: Task,
  verificationNote?: string
): { success: boolean; error?: string; newState: UserState; pointsAwarded: number } {
  // Prevent duplicate completion if already completed
  if (currentState.completedTaskIds.includes(task.id)) {
    return {
      success: false,
      error: 'Task is already completed today! Great job.',
      newState: currentState,
      pointsAwarded: 0,
    };
  }

  const nowIso = new Date().toISOString();
  const pointsAwarded = task.points;
  const newPoints = currentState.points + pointsAwarded;
  const newCompletedTaskIds = [...currentState.completedTaskIds, task.id];

  const newActivity: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'task_completed',
    title: `Completed: ${task.title}`,
    pointsDelta: pointsAwarded,
    timestamp: nowIso,
    impactDetails: `${task.co2SavedKg > 0 ? `${task.co2SavedKg}kg CO₂e` : ''} ${task.energySavedKwh > 0 ? `• ${task.energySavedKwh}kWh` : ''}`.trim(),
  };

  const newState: UserState = {
    ...currentState,
    points: newPoints,
    completedTaskIds: newCompletedTaskIds,
    co2AvoidedKg: Number((currentState.co2AvoidedKg + task.co2SavedKg).toFixed(2)),
    energySavedKwh: Number((currentState.energySavedKwh + task.energySavedKwh).toFixed(2)),
    waterConservedL: Number((currentState.waterConservedL + task.waterSavedL).toFixed(1)),
    activityLogs: [newActivity, ...currentState.activityLogs],
  };

  return {
    success: true,
    newState,
    pointsAwarded,
  };
}

export function redeemRewardAction(
  currentState: UserState,
  reward: RewardItem
): { success: boolean; error?: string; newState: UserState; voucher?: ClaimedVoucher } {
  if (currentState.points < reward.costPoints) {
    return {
      success: false,
      error: `Not enough green points. You need ${reward.costPoints - currentState.points} more points.`,
      newState: currentState,
    };
  }

  const nowIso = new Date().toISOString();
  const voucherCode = `GRID-${reward.category.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const voucher: ClaimedVoucher = {
    id: `vouch-${Date.now()}`,
    rewardId: reward.id,
    rewardTitle: reward.title,
    code: voucherCode,
    claimedAt: nowIso,
    pointsSpent: reward.costPoints,
  };

  const newActivity: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'reward_claimed',
    title: `Redeemed: ${reward.title}`,
    pointsDelta: -reward.costPoints,
    timestamp: nowIso,
    impactDetails: reward.impactMetric,
  };

  const newState: UserState = {
    ...currentState,
    points: currentState.points - reward.costPoints,
    treesPlanted: reward.category === 'Tree Planting' ? currentState.treesPlanted + 1 : currentState.treesPlanted,
    claimedVouchers: [voucher, ...currentState.claimedVouchers],
    activityLogs: [newActivity, ...currentState.activityLogs],
  };

  return {
    success: true,
    newState,
    voucher,
  };
}

export function gradeQuiz(
  userAnswers: number[],
  quizQuestions: QuizQuestion[]
): { score: number; total: number; passed: boolean; correctCount: number } {
  if (quizQuestions.length === 0) {
    return { score: 100, total: 0, passed: true, correctCount: 0 };
  }

  let correctCount = 0;
  for (let i = 0; i < quizQuestions.length; i++) {
    if (userAnswers[i] === quizQuestions[i].correctAnswerIndex) {
      correctCount++;
    }
  }

  const score = Math.round((correctCount / quizQuestions.length) * 100);
  const passed = score >= 60;

  return {
    score,
    total: quizQuestions.length,
    passed,
    correctCount,
  };
}

export function evaluateBadgesProgress(userState: UserState, badges: Badge[]): Badge[] {
  return badges.map(badge => {
    let currentProgress = 0;
    switch (badge.id) {
      case 'badge-first-action':
        currentProgress = userState.completedTaskIds.length;
        break;
      case 'badge-streak-3':
        currentProgress = userState.streakDays;
        break;
      case 'badge-streak-7':
        currentProgress = userState.streakDays;
        break;
      case 'badge-carbon-cutter':
        currentProgress = Math.round(userState.co2AvoidedKg);
        break;
      case 'badge-tree-planter':
        currentProgress = userState.treesPlanted;
        break;
      case 'badge-quiz-scholar':
        currentProgress = userState.completedLessonIds.length;
        break;
      case 'badge-grid-hero':
        currentProgress = Math.round(userState.energySavedKwh);
        break;
      default:
        currentProgress = badge.currentProgress;
    }

    const isUnlocked = userState.unlockedBadgeIds.includes(badge.id) || currentProgress >= badge.targetProgress;
    return {
      ...badge,
      currentProgress: Math.min(badge.targetProgress, currentProgress),
      isUnlocked,
      unlockedAt: isUnlocked && !badge.unlockedAt ? new Date().toISOString() : badge.unlockedAt,
    };
  });
}
