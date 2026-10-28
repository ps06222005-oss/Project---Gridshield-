import React from 'react';
import { ArrowLeft, Bell, Zap, Target, ShieldCheck, Info } from 'lucide-react';
import { UserState } from '../types';

interface SettingsScreenProps {
  userState: UserState;
  onUpdateSettings: (settings: Partial<UserState>) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userState,
  onUpdateSettings,
  onBack,
}) => {
  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-lg mx-auto space-y-4 text-[#344437]">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-black/5 text-[#55644C] transition-colors cursor-pointer"
          aria-label="Back to Profile"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#243428]">
            Settings & Preferences
          </h1>
          <p className="text-xs text-[#627359]">
            Configure daily targets, regional grid sync, and reminders.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Daily Goal Target */}
        <div className="p-4 rounded-3xl bg-white border border-[#EBE4D2] shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <Target className="w-4 h-4 text-[#879B68]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#243428]">
              Daily Green Points Target
            </h2>
          </div>
          <p className="text-xs text-[#52634A] leading-relaxed">
            Choose your daily goal threshold to maintain healthy habit consistency.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => onUpdateSettings({ dailyGoalPoints: goal })}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  userState.dailyGoalPoints === goal
                    ? 'bg-[#879B68] text-white shadow-xs'
                    : 'bg-[#F2ECE0] text-[#4E5E47] hover:bg-[#E8E1CE]'
                }`}
              >
                {goal} pts
              </button>
            ))}
          </div>
        </div>

        {/* Reminder Notifications */}
        <div className="p-4 rounded-3xl bg-white border border-[#EBE4D2] shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#F0F3DF] text-[#879B68]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#243428]">
                Habit & Solar Reminders
              </h2>
              <p className="text-[11px] text-[#697960]">
                Receive gentle alerts during local clean energy hours.
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={userState.notificationEnabled}
            onChange={(e) => onUpdateSettings({ notificationEnabled: e.target.checked })}
            className="w-5 h-5 rounded border-[#C4D0B5] text-[#879B68] focus:ring-[#879B68] cursor-pointer"
            aria-label="Toggle habit and solar reminders"
          />
        </div>

        {/* About Info */}
        <div className="p-4 rounded-3xl bg-[#F0F3DF] border border-[#DFE5CC] space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#28382B]">
            <ShieldCheck className="w-4 h-4 text-[#879B68]" />
            <span>GRIDSHIELD AI Principles</span>
          </div>
          <p className="text-[#55644C] leading-relaxed text-[11px]">
            Designed to foster intrinsic eco-stewardship without carbon-guilt or urgency fatigue. Habit completion uses transparent self-reporting to encourage personal integrity and sustainable daily routines.
          </p>
          <div className="pt-1 text-[10px] text-[#7A8A70]">
            Version 2.4.0 • Warm Cream & Matcha Architecture
          </div>
        </div>
      </div>
    </div>
  );
};
