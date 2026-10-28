import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateUserLevel, completeTaskAction, redeemRewardAction, gradeQuiz, evaluateBadgesProgress } from './ecoLogic';
import { UserState, Task, RewardItem, Badge } from '../types';

const mockUserState: UserState = {
  hasOnboarded: true,
  name: 'Aarav Sharma',
  location: 'Bengaluru, India',
  points: 120,
  streakDays: 4,
  lastActiveDate: '2026-10-28',
  co2AvoidedKg: 3.5,
  energySavedKwh: 4.2,
  waterConservedL: 25.0,
  plasticBottlesAvoided: 8,
  treesPlanted: 1,
  completedTaskIds: ['task-1'],
  unlockedBadgeIds: ['badge-first-action'],
  claimedVouchers: [],
  completedLessonIds: [],
  activityLogs: [],
  notificationEnabled: true,
  dailyGoalPoints: 50,
};

const mockTask: Task = {
  id: 'task-2',
  title: 'Unplug Standby Appliances',
  category: 'energy',
  difficulty: 'Easy',
  points: 25,
  impactLabel: 'Save 0.4 kWh',
  co2SavedKg: 0.35,
  energySavedKwh: 0.4,
  waterSavedL: 0,
  durationMinutes: 5,
  description: 'Switch off vampire power loads.',
  whyItMatters: 'Vampire loads consume 5-10% of home electricity.',
  actionSteps: ['Check entertainment setup', 'Turn off wall switch'],
  isCompletedToday: false,
  completedCount: 12,
};

test('calculateUserLevel accurately assigns tiers and percentage', () => {
  const lvl1 = calculateUserLevel(50);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.title, 'Seedling Steward');
  assert.equal(lvl1.progressPercent, 50);

  const lvl2 = calculateUserLevel(150);
  assert.equal(lvl2.level, 2);
  assert.equal(lvl2.title, 'Sprout Guardian');
  assert.ok(lvl2.progressPercent > 0);

  const lvl4 = calculateUserLevel(650);
  assert.equal(lvl4.level, 4);
  assert.equal(lvl4.title, 'Canopy Guardian');
});

test('completeTaskAction awards points and records activity', () => {
  const result = completeTaskAction(mockUserState, mockTask, 'Unplugged microwave');
  assert.equal(result.success, true);
  assert.equal(result.pointsAwarded, 25);
  assert.equal(result.newState.points, 145);
  assert.ok(result.newState.completedTaskIds.includes('task-2'));
  assert.equal(result.newState.activityLogs.length, 1);
  assert.equal(result.newState.co2AvoidedKg, 3.85);
});

test('completeTaskAction prevents duplicate completion', () => {
  const duplicateTask: Task = { ...mockTask, id: 'task-1' };
  const result = completeTaskAction(mockUserState, duplicateTask);
  assert.equal(result.success, false);
  assert.equal(result.pointsAwarded, 0);
  assert.equal(result.newState.points, 120);
});

test('redeemRewardAction handles insufficient points and successful redemption', () => {
  const expensiveReward: RewardItem = {
    id: 'rew-tree-1',
    title: 'Plant a Mangrove Tree in Sundarbans',
    organization: 'Grow-Trees India',
    costPoints: 200,
    category: 'Tree Planting',
    description: 'Planting coastal mangroves protects against storm surges.',
    impactMetric: '1 Mangrove planted • ~12kg CO2/year',
    claimedCount: 42,
    imageEmoji: '🌱',
  };

  // Attempt with 120 pts (needs 200)
  const failResult = redeemRewardAction(mockUserState, expensiveReward);
  assert.equal(failResult.success, false);
  assert.match(failResult.error || '', /Not enough green points/);

  // Attempt with rich user state
  const richState: UserState = { ...mockUserState, points: 250 };
  const successResult = redeemRewardAction(richState, expensiveReward);
  assert.equal(successResult.success, true);
  assert.equal(successResult.newState.points, 50);
  assert.equal(successResult.newState.treesPlanted, 2);
  assert.ok(successResult.voucher?.code.startsWith('GRID-TRE'));
  assert.equal(successResult.newState.claimedVouchers.length, 1);
});

test('gradeQuiz accurately scores user answers', () => {
  const questions = [
    { question: 'Q1', options: ['A', 'B', 'C'], correctAnswerIndex: 1, explanation: '' },
    { question: 'Q2', options: ['A', 'B', 'C'], correctAnswerIndex: 0, explanation: '' },
    { question: 'Q3', options: ['A', 'B', 'C'], correctAnswerIndex: 2, explanation: '' },
  ];

  const passResult = gradeQuiz([1, 0, 2], questions);
  assert.equal(passResult.score, 100);
  assert.equal(passResult.passed, true);

  const failResult = gradeQuiz([0, 1, 1], questions);
  assert.equal(failResult.score, 0);
  assert.equal(failResult.passed, false);
});

test('evaluateBadgesProgress computes unlock state properly', () => {
  const sampleBadges: Badge[] = [
    {
      id: 'badge-first-action',
      title: 'First Step',
      subtitle: 'Complete 1 action',
      icon: '🌱',
      category: 'milestone',
      isUnlocked: false,
      requirementDescription: 'Complete 1 eco habit',
      currentProgress: 0,
      targetProgress: 1,
      bonusPoints: 20,
    },
    {
      id: 'badge-streak-7',
      title: 'Week of Green',
      subtitle: '7-day streak',
      icon: '🔥',
      category: 'streak',
      isUnlocked: false,
      requirementDescription: 'Maintain a 7-day active streak',
      currentProgress: 0,
      targetProgress: 7,
      bonusPoints: 50,
    },
  ];

  const evaluated = evaluateBadgesProgress(mockUserState, sampleBadges);
  assert.equal(evaluated[0].isUnlocked, true);
  assert.equal(evaluated[1].isUnlocked, false);
  assert.equal(evaluated[1].currentProgress, 4);
});
