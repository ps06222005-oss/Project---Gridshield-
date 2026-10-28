import React from 'react';
import { Award, CheckCircle, Lock, ArrowLeft } from 'lucide-react';
import { Badge, ScreenType } from '../types';

interface BadgesScreenProps {
  badges: Badge[];
  onOpenBadge: (badge: Badge) => void;
  onBack?: () => void;
}

export const BadgesScreen: React.FC<BadgesScreenProps> = ({
  badges,
  onOpenBadge,
  onBack,
}) => {
  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const totalBonusPoints = badges
    .filter((b) => b.isUnlocked)
    .reduce((sum, b) => sum + b.bonusPoints, 0);

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-lg mx-auto space-y-4 text-[#344437]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-black/5 text-[#55644C] transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#243428]">
              Eco Badges
            </h1>
            <p className="text-xs text-[#627359]">
              Milestone achievements earned through consistent habit practice.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-[#879B68] block">
            {unlockedCount} of {badges.length} Unlocked
          </span>
          <span className="text-[10px] text-[#78886F]">
            +{totalBonusPoints} pts earned
          </span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge) => {
          const progressPercent = Math.min(
            100,
            Math.round((badge.currentProgress / badge.targetProgress) * 100)
          );
          return (
            <div
              key={badge.id}
              onClick={() => onOpenBadge(badge)}
              className={`p-4 rounded-3xl border transition-all text-center flex flex-col items-center justify-between cursor-pointer ${
                badge.isUnlocked
                  ? 'bg-white border-[#CCDAB8] hover:border-[#879B68] shadow-2xs'
                  : 'bg-[#F5EFE0]/70 border-[#E8E1CE] opacity-80'
              }`}
            >
              {/* Badge Icon */}
              <div className="relative my-2">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xs border ${
                    badge.isUnlocked
                      ? 'bg-[#F0F3DF] border-[#C3D2AA]'
                      : 'bg-[#ECE5D4] border-[#DDD5C0] grayscale opacity-60'
                  }`}
                >
                  {badge.icon}
                </div>
                {badge.isUnlocked ? (
                  <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#879B68] text-white">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#8C9882] text-white">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="w-full mt-1">
                <h3 className="text-xs sm:text-sm font-bold text-[#243428] truncate">
                  {badge.title}
                </h3>
                <p className="text-[10px] text-[#718069] mt-0.5 truncate">
                  {badge.subtitle}
                </p>
              </div>

              {/* Progress bar or Unlocked Tag */}
              <div className="w-full mt-3">
                {badge.isUnlocked ? (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#D9E5C3] text-[#28382B] text-[10px] font-bold">
                    +{badge.bonusPoints} pts
                  </span>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-[#76846E]">
                      <span>Progress</span>
                      <span>
                        {badge.currentProgress}/{badge.targetProgress}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E2DAC6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#879B68] rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
