/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenType, UserState, Task, Badge, RewardItem, Lesson } from './types';
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

const STORAGE_KEY = 'gridshield_user_state_v1';
const TASKS_STORAGE_KEY = 'gridshield_tasks_state_v1';

export default function App() {
  // Load saved state or fall back to initial
  const [userState, setUserState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return INITIAL_USER_STATE;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read tasks from localStorage', e);
    }
    return INITIAL_TASKS;
  });

  // Evaluate badges on user state
  const badges = evaluateBadgesProgress(userState, ALL_BADGES);

  // Check query parameter for autostart
  const isAutoStart = typeof window !== 'undefined' && window.location.search.includes('autostart=1');

  // Screen state
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    if (isAutoStart) return 'home';
    return userState.hasOnboarded ? 'home' : 'welcome';
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
    }, 3200);
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userState));
    } catch (e) {
      console.warn('Could not write userState to localStorage', e);
    }
  }, [userState]);

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Could not write tasks to localStorage', e);
    }
  }, [tasks]);

  // Handlers
  const handleStartApp = () => {
    setUserState((prev) => ({ ...prev, hasOnboarded: true }));
    setCurrentScreen('home');
  };

  const handleCompleteTask = (task: Task, note?: string) => {
    const result = completeTaskAction(userState, task, note);
    if (!result.success) {
      showToast(result.error || 'Task already completed today.');
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
    showToast(`🌟 +${result.pointsAwarded} Green Points earned! Great action.`);
  };

  const handleRedeemReward = (reward: RewardItem) => {
    const result = redeemRewardAction(userState, reward);
    if (!result.success) {
      showToast(result.error || 'Cannot redeem reward.');
      return;
    }

    setUserState(result.newState);
    showToast(`🎉 Redeemed ${reward.title}! Check your Vouchers tab.`);
  };

  const handleCompleteQuiz = (lesson: Lesson, score: number, bonusPoints: number) => {
    const alreadyCompleted = userState.completedLessonIds.includes(lesson.id);
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
      showToast(`🏆 Quiz Mastered! +${bonusPoints} bonus points added to your balance.`);
    }
  };

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TASKS_STORAGE_KEY);
    setUserState(INITIAL_USER_STATE);
    setTasks(INITIAL_TASKS);
    showToast('Reset sample demo data successfully.');
  };

  const handleUpdateLocation = (newLoc: string) => {
    setUserState((prev) => ({ ...prev, location: newLoc }));
    showToast(`Grid center updated to ${newLoc}`);
  };

  const handleUpdateSettings = (partial: Partial<UserState>) => {
    setUserState((prev) => ({ ...prev, ...partial }));
    showToast('Settings saved.');
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

      {/* Screen Routing */}
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onGetStarted={handleStartApp}
          onExplore={handleStartApp}
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
          entries={MOCK_LEADERBOARD}
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
