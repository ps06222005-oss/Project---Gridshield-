import React from 'react';
import { X, Award, CheckCircle, Lock } from 'lucide-react';
import { Badge } from '../types';

interface BadgeDetailModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ badge, onClose }) => {
  if (!badge) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-title"
    >
      <div className="bg-[#FFF9EC] border border-[#E3DCBA] rounded-3xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
        {/* Close Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 text-[#55644C] transition-colors cursor-pointer"
            aria-label="Close badge modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Icon & Glow */}
        <div className="my-2 flex justify-center">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-md border-4 ${
              badge.isUnlocked
                ? 'bg-[#F0F3DF] border-[#879B68] text-[#28382B]'
                : 'bg-[#EDE7D5] border-[#D9D3BF] grayscale opacity-70'
            }`}
          >
            {badge.icon}
          </div>
        </div>

        {/* Title & Status */}
        <h2 id="badge-title" className="text-xl font-bold text-[#243428] mt-3">
          {badge.title}
        </h2>
        <p className="text-xs font-semibold text-[#76846B] mt-0.5 uppercase tracking-wider">
          {badge.category} • +{badge.bonusPoints} bonus pts
        </p>

        {/* Status Pill */}
        <div className="my-3 flex justify-center">
          {badge.isUnlocked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9E5C3] text-[#28382B] text-xs font-bold">
              <CheckCircle className="w-3.5 h-3.5 text-[#879B68]" />
              Unlocked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE6D4] text-[#63725A] text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              Locked
            </span>
          )}
        </div>

        {/* Requirement */}
        <div className="bg-white/80 border border-[#E8E1CE] rounded-2xl p-3.5 text-xs text-[#475742] leading-relaxed my-2">
          {badge.requirementDescription}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 text-left">
          <div className="flex justify-between text-xs font-bold text-[#55644C] mb-1.5">
            <span>Progress</span>
            <span>
              {badge.currentProgress} / {badge.targetProgress}
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#EAE3CE] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                badge.isUnlocked ? 'bg-[#879B68]' : 'bg-[#C4CEB5]'
              }`}
              style={{
                width: `${Math.min(100, (badge.currentProgress / badge.targetProgress) * 100)}%`,
              }}
            />
          </div>
        </div>

        {badge.unlockedAt && (
          <p className="text-[10px] text-[#8C9882] mt-4">
            Unlocked on {new Date(badge.unlockedAt).toLocaleDateString()}
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-full bg-[#879B68] hover:bg-[#788C5A] text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
