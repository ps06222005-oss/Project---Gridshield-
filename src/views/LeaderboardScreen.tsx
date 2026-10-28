import React, { useState } from 'react';
import { Trophy, Award, Users, Info, ArrowLeft } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardScreenProps {
  entries: LeaderboardEntry[];
  onBack?: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  entries,
  onBack,
}) => {
  const [scope, setScope] = useState<'local' | 'global'>('local');

  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-lg mx-auto space-y-4 text-[#344437]">
      {/* Header */}
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
              Community Leaderboard
            </h1>
            <p className="text-xs text-[#627359]">
              Weekly collective habit momentum across participating regions.
            </p>
          </div>
        </div>
      </div>

      {/* Sample Data Disclaimer Callout */}
      <div className="p-3 rounded-2xl bg-[#F0F3DF] border border-[#DFE5CC] text-[11px] text-[#4A5D44] flex items-start gap-2">
        <Info className="w-4 h-4 text-[#879B68] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold">Sample Community Data:</span> Standings reflect simulated community metrics and self-reported habit logs.
        </p>
      </div>

      {/* Scope Toggle */}
      <div className="flex p-1 bg-[#F0ECE0] rounded-2xl border border-[#DFD8C4]">
        <button
          type="button"
          onClick={() => setScope('local')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            scope === 'local'
              ? 'bg-white text-[#243428] shadow-xs'
              : 'text-[#63725A] hover:text-[#243428]'
          }`}
        >
          Local Grid Circle (India)
        </button>
        <button
          type="button"
          onClick={() => setScope('global')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            scope === 'global'
              ? 'bg-white text-[#243428] shadow-xs'
              : 'text-[#63725A] hover:text-[#243428]'
          }`}
        >
          Global Eco Hub
        </button>
      </div>

      {/* Top 3 Podium */}
      <div className="pt-2 pb-1 grid grid-cols-3 gap-2 items-end">
        {/* Rank 2 */}
        {topThree[1] && (
          <div className="p-3 rounded-2xl bg-white border border-[#EBE4D2] text-center flex flex-col items-center shadow-2xs">
            <span className="w-6 h-6 rounded-full bg-[#D9E5C3] text-[#28382B] text-xs font-extrabold flex items-center justify-center mb-1">
              2
            </span>
            <div className="w-10 h-10 rounded-full bg-[#EBF0DE] border border-[#CAD8B4] flex items-center justify-center text-xs font-bold text-[#344437] my-1">
              {topThree[1].name.charAt(0)}
            </div>
            <span className="text-xs font-bold text-[#243428] truncate w-full">
              {topThree[1].name}
            </span>
            <span className="text-[11px] font-bold text-[#879B68] mt-0.5">
              {topThree[1].points} pts
            </span>
          </div>
        )}

        {/* Rank 1 (Gold/Butter Yellow) */}
        {topThree[0] && (
          <div className="p-3.5 rounded-2xl bg-[#FFF9E6] border-2 border-[#F5D875] text-center flex flex-col items-center shadow-xs -mt-3">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#916B0B] bg-[#F5D875]/40 px-2 py-0.5 rounded-full mb-1">
              <Trophy className="w-3 h-3 text-[#B08412]" />
              <span>1st Place</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#F5D875]/30 border-2 border-[#E5C453] flex items-center justify-center text-sm font-extrabold text-[#2E3C26] my-1">
              {topThree[0].name.charAt(0)}
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#243428] truncate w-full">
              {topThree[0].name}
            </span>
            <span className="text-xs font-extrabold text-[#879B68] mt-0.5">
              {topThree[0].points} pts
            </span>
          </div>
        )}

        {/* Rank 3 */}
        {topThree[2] && (
          <div className="p-3 rounded-2xl bg-white border border-[#EBE4D2] text-center flex flex-col items-center shadow-2xs">
            <span className="w-6 h-6 rounded-full bg-[#F0F3DF] text-[#47573E] text-xs font-extrabold flex items-center justify-center mb-1">
              3
            </span>
            <div className="w-10 h-10 rounded-full bg-[#EBF0DE] border border-[#CAD8B4] flex items-center justify-center text-xs font-bold text-[#344437] my-1">
              {topThree[2].name.charAt(0)}
            </div>
            <span className="text-xs font-bold text-[#243428] truncate w-full">
              {topThree[2].name}
            </span>
            <span className="text-[11px] font-bold text-[#879B68] mt-0.5">
              {topThree[2].points} pts
            </span>
          </div>
        )}
      </div>

      {/* Rankings List */}
      <div className="space-y-2">
        {remaining.map((entry) => (
          <div
            key={entry.rank}
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              entry.isCurrentUser
                ? 'bg-[#F0F3DF] border-[#879B68] shadow-xs'
                : 'bg-white border-[#EBE4D2] shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-6 text-center text-xs font-bold ${
                entry.isCurrentUser ? 'text-[#879B68]' : 'text-[#7A8A72]'
              }`}>
                #{entry.rank}
              </span>
              <div className="w-9 h-9 rounded-full bg-[#ECE7D6] flex items-center justify-center text-xs font-bold text-[#344437]">
                {entry.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs sm:text-sm font-bold ${
                    entry.isCurrentUser ? 'text-[#1D2B1F]' : 'text-[#28382B]'
                  }`}>
                    {entry.name}
                  </span>
                  {entry.isCurrentUser && (
                    <span className="px-1.5 py-0.2 rounded-md bg-[#879B68] text-white text-[9px] font-bold">
                      YOU
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#788870] block">
                  {entry.location} • {entry.badgesCount} badges
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs sm:text-sm font-extrabold text-[#28382B] block">
                {entry.points} pts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
