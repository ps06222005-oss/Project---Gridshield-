import React from 'react';
import { Flame, Award, Zap, Droplets, Leaf, Trees, ArrowRight, CheckCircle2, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import { UserState, Task, ScreenType } from '../types';
import { calculateUserLevel } from '../utils/ecoLogic';

interface HomeScreenProps {
  userState: UserState;
  tasks: Task[];
  onNavigate: (screen: ScreenType) => void;
  onOpenTask: (task: Task) => void;
  onQuickCompleteTask: (task: Task) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userState,
  tasks,
  onNavigate,
  onOpenTask,
  onQuickCompleteTask,
}) => {
  const levelInfo = calculateUserLevel(userState.points);
  const todaysTasks = tasks.slice(0, 3);
  const completedTodayCount = tasks.filter(t => userState.completedTaskIds.includes(t.id)).length;
  const todayPoints = tasks
    .filter(t => userState.completedTaskIds.includes(t.id))
    .reduce((sum, t) => sum + t.points, 0);

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-lg mx-auto space-y-5 text-[#344437]">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#879B68] text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {userState.name.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#738262] block">
              {userState.location}
            </span>
            <h1 className="text-sm sm:text-base font-bold text-[#243428] leading-tight">
              Hello, {userState.name}
            </h1>
          </div>
        </div>

        {/* Streak & Points Badges */}
        <div className="flex items-center gap-2">
          {/* Streak pill */}
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF0E0] border border-[#F4DEC6] text-xs font-bold text-[#B85D19] shadow-2xs"
            title={`${userState.streakDays} Day Active Streak`}
          >
            <Flame className="w-3.5 h-3.5 fill-[#E06E26] text-[#E06E26]" />
            <span>{userState.streakDays}d</span>
          </div>

          {/* Points pill */}
          <button
            type="button"
            onClick={() => onNavigate('points-history')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F3DF] border border-[#DFE5CC] text-xs font-bold text-[#2E3D2F] hover:bg-[#E5EBD0] transition-colors shadow-2xs cursor-pointer"
            aria-label="View Points History"
          >
            <Award className="w-3.5 h-3.5 text-[#879B68]" />
            <span>{userState.points} pts</span>
          </button>
        </div>
      </header>

      {/* Local Grid Live Status Card */}
      <section className="p-4 rounded-3xl bg-[#F0F3DF] border border-[#DFE5CC] shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 text-[10px] font-bold text-[#3E523A] border border-[#D5DEBF]">
              <span className="w-2 h-2 rounded-full bg-[#879B68] animate-ping" />
              <span>Grid Frequency: 50.02 Hz • Normal</span>
            </div>
            <h2 className="text-sm font-bold text-[#243428] pt-1">
              Southern Regional Grid: Green Window
            </h2>
            <p className="text-xs text-[#55644C] leading-relaxed max-w-[280px]">
              Solar feeding is optimal. Run laundry and charge devices now to absorb clean renewable power.
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/80 text-[#879B68] shadow-xs shrink-0">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Impact Metric Chips */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#697A5E]">
            Cumulative Impact
          </h2>
          <span className="text-[11px] text-[#78886E]">Self-reported</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-white border border-[#EBE4D2] shadow-2xs">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#668DA0]">
              <Leaf className="w-3.5 h-3.5 text-[#879B68]" />
              <span>CO₂ Avoided</span>
            </div>
            <div className="text-lg font-extrabold text-[#243428] mt-1">
              {userState.co2AvoidedKg} <span className="text-xs font-normal text-[#6B7962]">kg</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#EBE4D2] shadow-2xs">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#879B68]">
              <Zap className="w-3.5 h-3.5 text-[#879B68]" />
              <span>Electricity</span>
            </div>
            <div className="text-lg font-extrabold text-[#243428] mt-1">
              {userState.energySavedKwh} <span className="text-xs font-normal text-[#6B7962]">kWh</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#EBE4D2] shadow-2xs">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#668DA0]">
              <Droplets className="w-3.5 h-3.5 text-[#668DA0]" />
              <span>Water Conserved</span>
            </div>
            <div className="text-lg font-extrabold text-[#243428] mt-1">
              {userState.waterConservedL} <span className="text-xs font-normal text-[#6B7962]">L</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#EBE4D2] shadow-2xs">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#76875E]">
              <Trees className="w-3.5 h-3.5 text-[#76875E]" />
              <span>Trees Planted</span>
            </div>
            <div className="text-lg font-extrabold text-[#243428] mt-1">
              {userState.treesPlanted} <span className="text-xs font-normal text-[#6B7962]">tree</span>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Goal Bar */}
      <section className="p-3.5 rounded-2xl bg-white border border-[#EBE4D2] shadow-2xs space-y-2">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#2E3E2B]">
            <Sparkles className="w-3.5 h-3.5 text-[#879B68]" />
            <span>Today's Green Goal</span>
          </div>
          <span className="font-semibold text-[#6E7E64]">
            {todayPoints} / {userState.dailyGoalPoints} pts ({Math.min(100, Math.round((todayPoints / userState.dailyGoalPoints) * 100))}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-[#F0EBE0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#879B68] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (todayPoints / userState.dailyGoalPoints) * 100)}%` }}
          />
        </div>
      </section>

      {/* Actionable Habits for Today */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#697A5E]">
            Today's Eco Habits ({completedTodayCount}/{tasks.length})
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('tasks')}
            className="text-xs font-semibold text-[#879B68] hover:text-[#5B6D45] flex items-center gap-1 cursor-pointer"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {todaysTasks.map((t) => {
            const isDone = userState.completedTaskIds.includes(t.id);
            return (
              <div
                key={t.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-[#F2ECE0]/60 border-[#E5DFCF] opacity-85'
                    : 'bg-white border-[#EBE4D2] hover:border-[#CCD8B8] shadow-2xs'
                }`}
              >
                <div 
                  onClick={() => onOpenTask(t)}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#F0F3DF] text-[#55644C]">
                      {t.category}
                    </span>
                    <span className="text-[11px] font-semibold text-[#879B68]">
                      +{t.points} pts
                    </span>
                  </div>
                  <h3 className={`text-xs sm:text-sm font-bold mt-1 ${isDone ? 'line-through text-[#798871]' : 'text-[#243428]'}`}>
                    {t.title}
                  </h3>
                  <p className="text-[11px] text-[#6E7D66] mt-0.5">
                    {t.impactLabel}
                  </p>
                </div>

                <div className="shrink-0">
                  {isDone ? (
                    <div className="p-2 rounded-full bg-[#D9E5C3] text-[#344437]">
                      <CheckCircle2 className="w-5 h-5 text-[#879B68]" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onQuickCompleteTask(t)}
                      className="p-2 rounded-full bg-[#F0F3DF] hover:bg-[#879B68] text-[#55644C] hover:text-white transition-all cursor-pointer shadow-2xs"
                      aria-label={`Complete ${t.title}`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Canopy Progress Mini Card */}
      <section className="p-4 rounded-3xl bg-white border border-[#EBE4D2] shadow-xs flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#879B68] tracking-wider block">
            Level {levelInfo.level} • {levelInfo.title}
          </span>
          <h3 className="text-sm font-bold text-[#243428]">
            Grow Your Eco Shield
          </h3>
          <p className="text-xs text-[#55644C] leading-relaxed">
            {levelInfo.nextLevelPoints - userState.points > 0
              ? `${levelInfo.nextLevelPoints - userState.points} more points to reach Level ${levelInfo.level + 1}`
              : 'Max level achieved!'}
          </p>
          <div className="w-36 h-2 bg-[#F0EBE0] rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-[#879B68] rounded-full"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Tree Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-[#F0F3DF] border border-[#DFE5CC] flex items-center justify-center text-3xl shadow-xs shrink-0">
          🌳
        </div>
      </section>

      {/* Quick Action Shortcuts */}
      <section className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onNavigate('badges')}
          className="p-3 rounded-2xl bg-white border border-[#EBE4D2] hover:bg-[#F8F4EA] transition-colors flex items-center justify-between text-left cursor-pointer shadow-2xs"
        >
          <div>
            <span className="text-xs font-bold text-[#243428] block">All Badges</span>
            <span className="text-[11px] text-[#718068]">{userState.unlockedBadgeIds.length} Unlocked</span>
          </div>
          <Award className="w-5 h-5 text-[#879B68]" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('leaderboard')}
          className="p-3 rounded-2xl bg-white border border-[#EBE4D2] hover:bg-[#F8F4EA] transition-colors flex items-center justify-between text-left cursor-pointer shadow-2xs"
        >
          <div>
            <span className="text-xs font-bold text-[#243428] block">Leaderboard</span>
            <span className="text-[11px] text-[#718068]">Local Grid Circle</span>
          </div>
          <TrendingUp className="w-5 h-5 text-[#879B68]" />
        </button>
      </section>
    </div>
  );
};
