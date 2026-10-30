/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ScreenType, UserState, Task, Badge, RewardItem, Lesson, LeaderboardEntry } from './types';
import {
  INITIAL_USER_STATE,
  INITIAL_TASKS,
  ALL_BADGES,
  REWARDS_CATALOG,
  LESSONS_CATALOG,
  MOCK_LEADERBOARD,
} from './data/mockData';
import {
  completeTaskAction,
  redeemRewardAction,
  evaluateBadgesProgress,
} from './utils/ecoLogic';
import { useAuth } from './context/AuthContext';
import { api, ApiError } from './api/client';
import { WelcomeScreen } from './components/WelcomeScreen';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './views/HomeScreen';
import { TasksScreen } from './views/TasksScreen';
import { RewardsScreen } from './views/RewardsScreen';
import { BadgesScreen } from './views/BadgesScreen';
import { LeaderboardScreen } from './views/LeaderboardScreen';
import { LearnScreen } from './views/LearnScreen';
import { ProfileScreen } from './views/ProfileScreen';
import { ActivityScreen } from './views/ActivityScreen';
import { SettingsScreen } from './views/SettingsScreen';
import { PointsHistoryScreen } from './views/PointsHistoryScreen';
import { TaskDetailModal } from './components/TaskDetailModal';
import { BadgeDetailModal } from './components/BadgeDetailModal';
import { LessonQuizModal } from './components/LessonQuizModal';
import { Loader2, WifiOff } from 'lucide-react';

const STORAGE_KEY = 'gridshield_guest_user_state_v1';
const TASKS_STORAGE_KEY = 'gridshield_guest_tasks_state_v1';

export default function App() {
  const { user, idToken, isGuest, isLoading: isAuthLoading, authError, signInWithGoogle, signInAsGuest, signOut } = useAuth();

  // In-memory state for user and tasks
  const [userState, setUserState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read guest state from localStorage', e);
    }
    return INITIAL_USER_STATE;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read guest tasks from localStorage', e);
    }
    return INITIAL_TASKS;
  });

  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [isActionPending, setIsActionPending] = useState<boolean>(false);

  // Evaluate badges on user state
  const badges = evaluateBadgesProgress(userState, ALL_BADGES);

  // Query parameter for autostart
  const isAutoStart = typeof window !== 'undefined' && window.location.search.includes('autostart=1');

  // Screen state
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    if (isAutoStart) return 'home';
    return (userState.hasOnboarded || isGuest) ? 'home' : 'welcome';
  });

  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync guest state only to guest storage key
  useEffect(() => {
    if (!user && isGuest) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userState));
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      } catch (e) {
        console.warn('Could not write guest state to localStorage', e);
      }
    }
  }, [userState, tasks, user, isGuest]);

  // Sync from backend when authenticated
  const loadBackendData = useCallback(async () => {
    if (!user || !idToken) return;
    setIsDataLoading(true);
    try {
      const [dash, backendTasks, vouchers, lbRes] = await Promise.all([
        api.getDashboard(),
        api.getTasks().catch(() => INITIAL_TASKS),
        api.getMyVouchers().catch(() => []),
        api.getLeaderboard('all-time', 1, 20).catch(() => ({ entries: [] })),
      ]);

      setIsBackendConnected(true);

      // Map backend tasks with completed today flag
      const mappedTasks: Task[] = backendTasks.map((bt: any) => ({
        id: bt.taskId || bt.id,
        title: bt.title,
        category: bt.category,
        difficulty: bt.difficulty,
        points: bt.points,
        impactLabel: bt.impactLabel || '',
        co2SavedKg: bt.co2SavedKg || 0,
        energySavedKwh: bt.energySavedKwh || 0,
        waterSavedL: bt.waterSavedL || 0,
        durationMinutes: bt.durationMinutes || 0,
        description: bt.description || '',
        whyItMatters: bt.whyItMatters || '',
        actionSteps: bt.actionSteps || [],
        isCompletedToday: dash.completedTasksToday?.includes(bt.taskId) ?? false,
        completedCount: bt.globalCompletedCount || bt.completedCount || 0,
      }));

      setTasks(mappedTasks.length > 0 ? mappedTasks : INITIAL_TASKS);

      setUserState({
        hasOnboarded: true,
        name: dash.user?.name || user.displayName || 'Green Guardian',
        location: dash.user?.location || 'Bengaluru, India',
        points: dash.user?.points ?? 0,
        streakDays: dash.user?.streakDays ?? 0,
        lastActiveDate: dash.user?.lastActiveDate || '',
        co2AvoidedKg: dash.user?.co2AvoidedKg ?? 0,
        energySavedKwh: dash.user?.energySavedKwh ?? 0,
        waterConservedL: dash.user?.waterConservedL ?? 0,
        plasticBottlesAvoided: dash.user?.plasticBottlesAvoided ?? 0,
        treesPlanted: dash.user?.treesPlanted ?? 0,
        completedTaskIds: dash.completedTasksToday || [],
        unlockedBadgeIds: dash.unlockedBadges?.map((b: any) => b.badgeId) || [],
        claimedVouchers: vouchers.map((v: any) => ({
          id: v._id || v.id,
          rewardId: v.rewardSlug || v.rewardId,
          rewardTitle: v.rewardTitle || 'Verified Green Reward',
          code: v.voucherCode || v.code,
          claimedAt: v.claimedAt,
          pointsSpent: v.pointsSpent,
        })),
        completedLessonIds: dash.completedLessonSlugs || [],
        activityLogs: (dash.recentActivity || []).map((a: any) => ({
          id: a.id || a._id,
          type: a.type,
          title: a.title,
          pointsDelta: a.pointsDelta,
          timestamp: a.timestamp,
          impactDetails: a.impactDetails,
        })),
        notificationEnabled: dash.user?.notificationEnabled ?? true,
        dailyGoalPoints: dash.user?.dailyGoalPoints ?? 50,
      });

      if (lbRes.entries && lbRes.entries.length > 0) {
        setLeaderboardEntries(lbRes.entries);
      }

      setCurrentScreen('home');
    } catch (err: any) {
      console.warn('[api] Failed to fetch backend data, falling back to local guest mode:', err.message);
      setIsBackendConnected(false);
      showToast('Backend offline. Showing local demonstration state.');
    } finally {
      setIsDataLoading(false);
    }
  }, [user, idToken]);

  useEffect(() => {
    if (user && idToken) {
      loadBackendData();
    }
  }, [user, idToken, loadBackendData]);

  // Handlers
  const handleStartGoogleAuth = async () => {
    const success = await signInWithGoogle();
    if (success) {
      showToast('Signed in successfully with Google!');
    }
  };

  const handleStartGuestMode = () => {
    signInAsGuest();
    setUserState((prev) => ({ ...prev, hasOnboarded: true }));
    setCurrentScreen('home');
    showToast('Entered Guest Demo Mode.');
  };

  const handleSignOutUser = async () => {
    await signOut();
    setUserState(INITIAL_USER_STATE);
    setTasks(INITIAL_TASKS);
    setCurrentScreen('welcome');
    showToast('Signed out.');
  };

  const handleDeleteUserAccount = async () => {
    try {
      await api.deleteMe();
      await signOut();
      setUserState(INITIAL_USER_STATE);
      setTasks(INITIAL_TASKS);
      setCurrentScreen('welcome');
      showToast('Your account and associated data have been permanently deleted.');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete account.');
    }
  };

  const handleCompleteTask = async (task: Task, note?: string) => {
    if (isActionPending) return;

    // Check if task is already completed today
    if (userState.completedTaskIds.includes(task.id)) {
      showToast('Task already completed today. Resets tomorrow!');
      return;
    }

    setIsActionPending(true);

    if (user && idToken && isBackendConnected) {
      try {
        const result = await api.completeTask(task.id, note);
        // Authoritative update from server balance
        setUserState((prev) => ({
          ...prev,
          points: result.newBalance,
          completedTaskIds: [...prev.completedTaskIds, task.id],
        }));

        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  isCompletedToday: true,
                  completedAt: result.completedAt,
                  completedCount: t.completedCount + 1,
                }
              : t
          )
        );

        setSelectedTask(null);
        showToast(`🌟 +${result.pointsAwarded} Green Points! (Server Verified)`);

        if (result.badgesUnlocked && result.badgesUnlocked.length > 0) {
          setTimeout(() => {
            showToast(`🏆 Badge Unlocked: ${result.badgesUnlocked.join(', ')}!`);
          }, 1500);
        }
      } catch (err: any) {
        if (err instanceof ApiError && err.statusCode === 409) {
          showToast('Task already completed today. Resets at midnight in your timezone!');
        } else {
          showToast(err.message || 'Could not record completion.');
        }
      } finally {
        setIsActionPending(false);
      }
    } else {
      // Guest demo completion
      const result = completeTaskAction(userState, task, note);
      if (!result.success) {
        showToast(result.error || 'Task already completed today.');
        setIsActionPending(false);
        return;
      }

      setUserState(result.newState);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                isCompletedToday: true,
                completedAt: new Date().toISOString(),
                completedCount: t.completedCount + 1,
              }
            : t
        )
      );
      setSelectedTask(null);
      showToast(`🌟 +${result.pointsAwarded} Green Points earned! (Guest Mode)`);
      setIsActionPending(false);
    }
  };

  const handleRedeemReward = async (reward: RewardItem) => {
    if (isActionPending) return;
    if (userState.points < reward.costPoints) {
      showToast(`Need ${reward.costPoints - userState.points} more points to redeem.`);
      return;
    }

    setIsActionPending(true);

    if (user && idToken && isBackendConnected) {
      try {
        const result = await api.redeemReward(reward.id);
        setUserState((prev) => ({
          ...prev,
          points: result.newBalance,
          claimedVouchers: [
            {
              id: `vouch-${Date.now()}`,
              rewardId: reward.id,
              rewardTitle: result.rewardTitle,
              code: result.voucherCode,
              claimedAt: new Date().toISOString(),
              pointsSpent: result.pointsSpent,
            },
            ...prev.claimedVouchers,
          ],
        }));
        showToast(`🎉 Redeemed ${reward.title}! Code: ${result.voucherCode}`);
      } catch (err: any) {
        showToast(err.message || 'Failed to redeem reward.');
      } finally {
        setIsActionPending(false);
      }
    } else {
      // Guest demo redemption
      const result = redeemRewardAction(userState, reward);
      if (!result.success) {
        showToast(result.error || 'Cannot redeem reward.');
        setIsActionPending(false);
        return;
      }
      setUserState(result.newState);
      showToast(`🎉 Redeemed ${reward.title}! Check your Vouchers tab.`);
      setIsActionPending(false);
    }
  };

  const handleCompleteQuiz = async (
    lesson: Lesson,
    score: number,
    bonusPoints: number,
    answers?: number[]
  ) => {
    const alreadyCompleted = userState.completedLessonIds.includes(lesson.id);

    if (user && idToken && isBackendConnected && answers && answers.length > 0) {
      try {
        const res = await api.submitQuiz(lesson.id, answers);
        if (res.newBalance !== undefined) {
          setUserState((prev) => ({
            ...prev,
            points: res.newBalance!,
            completedLessonIds: Array.from(new Set([...prev.completedLessonIds, lesson.id])),
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                type: 'quiz_completed',
                title: `Mastered: ${lesson.title} Quiz`,
                pointsDelta: res.bonusPointsAwarded,
                timestamp: new Date().toISOString(),
                impactDetails: `Scored ${res.score}% (Server Verified)`,
              },
              ...prev.activityLogs,
            ],
          }));
          if (res.bonusPointsAwarded > 0) {
            showToast(`🏆 Quiz Mastered! +${res.bonusPointsAwarded} points awarded! (Server Verified)`);
          } else {
            showToast(`🏆 Quiz passed! Score: ${res.score}%. (Already completed)`);
          }
          if (res.badgesUnlocked && res.badgesUnlocked.length > 0) {
            setTimeout(() => {
              showToast(`🏆 Badge Unlocked: ${res.badgesUnlocked.join(', ')}!`);
            }, 1500);
          }
        }
        return;
      } catch (err: any) {
        console.warn('Backend quiz submit failed, falling back to local state:', err);
      }
    }

    if (!alreadyCompleted) {
      setUserState((prev) => ({
        ...prev,
        points: prev.points + bonusPoints,
        completedLessonIds: [...prev.completedLessonIds, lesson.id],
        activityLogs: [
          {
            id: `act-${Date.now()}`,
            type: 'quiz_completed',
            title: `Mastered: ${lesson.title} Quiz`,
            pointsDelta: bonusPoints,
            timestamp: new Date().toISOString(),
            impactDetails: `Scored ${score}%`,
          },
          ...prev.activityLogs,
        ],
      }));
      showToast(`🏆 Quiz Mastered! +${bonusPoints} points added.`);
    }
  };

  const handleSubmitQuizServer = async (lesson: Lesson, answers: number[]): Promise<boolean> => {
    if (user && idToken && isBackendConnected) {
      try {
        const res = await api.submitQuiz(lesson.id, answers);
        if (res.newBalance !== undefined) {
          setUserState((prev) => ({
            ...prev,
            points: res.newBalance!,
            completedLessonIds: [...prev.completedLessonIds, lesson.id],
          }));
        }
        return true;
      } catch (err: any) {
        console.warn('Server quiz submit error', err);
        return false;
      }
    }
    return false;
  };

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TASKS_STORAGE_KEY);
    setUserState(INITIAL_USER_STATE);
    setTasks(INITIAL_TASKS);
    showToast('Reset sample demo data successfully.');
  };

  const handleUpdateLocation = async (newLoc: string) => {
    setUserState((prev) => ({ ...prev, location: newLoc }));
    showToast(`Grid center updated to ${newLoc}`);
    if (user && idToken && isBackendConnected) {
      try {
        await api.updateMe({ location: newLoc });
      } catch {}
    }
  };

  const handleUpdateSettings = async (partial: Partial<UserState>) => {
    setUserState((prev) => ({ ...prev, ...partial }));
    showToast('Settings saved.');
    if (user && idToken && isBackendConnected) {
      try {
        await api.updateSettings({
          notificationEnabled: partial.notificationEnabled,
          dailyGoalPoints: partial.dailyGoalPoints,
        });
      } catch {}
    }
  };

  const isMainScreen = ['home', 'tasks', 'rewards', 'learn', 'profile'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#FFF9EC] text-[#344437] font-sans antialiased selection:bg-[#D9E5C3] selection:text-[#344437]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-60 px-4 py-2.5 rounded-full bg-[#243428] text-white text-xs font-semibold shadow-xl border border-[#3E523F] animate-in fade-in slide-in-from-top-3 duration-200 flex items-center gap-2 max-w-sm"
          role="status"
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Backend Offline Indicator */}
      {user && !isBackendConnected && (
        <div className="bg-[#FFF0E0] border-b border-[#F4DEC6] px-4 py-1.5 text-center text-xs font-semibold text-[#B85D19] flex items-center justify-center gap-1.5">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Backend offline. Running in synchronized local mode.</span>
          <button
            type="button"
            onClick={loadBackendData}
            className="underline ml-1 hover:text-[#8E4410] cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Screen Routing */}
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onGetStarted={handleStartGoogleAuth}
          onExplore={handleStartGuestMode}
          isLoading={isAuthLoading}
          authError={authError}
        />
      )}

      {currentScreen === 'home' && (
        <HomeScreen
          userState={userState}
          tasks={tasks}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onOpenTask={(task) => setSelectedTask(task)}
          onQuickCompleteTask={(task) => handleCompleteTask(task)}
        />
      )}

      {currentScreen === 'tasks' && (
        <TasksScreen
          tasks={tasks}
          userState={userState}
          onOpenTask={(task) => setSelectedTask(task)}
          onQuickCompleteTask={(task) => handleCompleteTask(task)}
        />
      )}

      {currentScreen === 'rewards' && (
        <RewardsScreen
          userState={userState}
          rewards={REWARDS_CATALOG}
          onRedeemReward={handleRedeemReward}
        />
      )}

      {currentScreen === 'badges' && (
        <BadgesScreen
          badges={badges}
          onOpenBadge={(b) => setSelectedBadge(b)}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'leaderboard' && (
        <LeaderboardScreen
          entries={leaderboardEntries}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'learn' && (
        <LearnScreen
          lessons={LESSONS_CATALOG}
          userState={userState}
          onOpenLesson={(lesson) => setSelectedLesson(lesson)}
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen
          userState={userState}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onUpdateLocation={handleUpdateLocation}
          onResetData={handleResetData}
          onOpenWelcome={() => setCurrentScreen('welcome')}
          isAuthenticated={!!user}
          onSignOut={handleSignOutUser}
          onSignIn={handleStartGoogleAuth}
          onDeleteAccount={handleDeleteUserAccount}
        />
      )}

      {currentScreen === 'activity' && (
        <ActivityScreen
          activityLogs={userState.activityLogs}
          onBack={() => setCurrentScreen('profile')}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          userState={userState}
          onUpdateSettings={handleUpdateSettings}
          onBack={() => setCurrentScreen('profile')}
        />
      )}

      {currentScreen === 'points-history' && (
        <PointsHistoryScreen
          currentPoints={userState.points}
          activityLogs={userState.activityLogs}
          onBack={() => setCurrentScreen('profile')}
        />
      )}

      {/* Bottom Navigation for Main Screens */}
      {isMainScreen && (
        <BottomNavigation
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          completedTasksCount={userState.completedTaskIds.length}
        />
      )}

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isCompleted={userState.completedTaskIds.includes(selectedTask.id)}
          onClose={() => setSelectedTask(null)}
          onComplete={(t, note) => handleCompleteTask(t, note)}
        />
      )}

      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}

      {selectedLesson && (
        <LessonQuizModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onCompleteQuiz={handleCompleteQuiz}
        />
      )}
    </div>
  );
}
