import React from 'react';
import { ArrowLeft, Award, TrendingUp, TrendingDown } from 'lucide-react';
import { ActivityLog } from '../types';

interface PointsHistoryScreenProps {
  currentPoints: number;
  activityLogs: ActivityLog[];
  onBack: () => void;
}

export const PointsHistoryScreen: React.FC<PointsHistoryScreenProps> = ({
  currentPoints,
  activityLogs,
  onBack,
}) => {
  const earnedTotal = activityLogs
    .filter((l) => l.pointsDelta > 0)
    .reduce((sum, l) => sum + l.pointsDelta, 0);

  const spentTotal = Math.abs(
    activityLogs
      .filter((l) => l.pointsDelta < 0)
      .reduce((sum, l) => sum + l.pointsDelta, 0)
  );

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-lg mx-auto space-y-4 text-[#344437]">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-black/5 text-[#55644C] transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#243428]">
            Points History
          </h1>
          <p className="text-xs text-[#627359]">
            Transparent ledger of your earned and redeemed green points.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-[#F0F3DF] border border-[#DFE5CC] text-center shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#647558] block">
            Current
          </span>
          <span className="text-base sm:text-lg font-extrabold text-[#243428] mt-0.5 block">
            {currentPoints}
          </span>
          <span className="text-[9px] text-[#718069]">Available</span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-[#EBE4D2] text-center shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#879B68] block">
            Earned
          </span>
          <span className="text-base sm:text-lg font-extrabold text-[#879B68] mt-0.5 block">
            +{earnedTotal}
          </span>
          <span className="text-[9px] text-[#718069]">From Habits</span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-[#EBE4D2] text-center shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#B85D19] block">
            Redeemed
          </span>
          <span className="text-base sm:text-lg font-extrabold text-[#B85D19] mt-0.5 block">
            -{spentTotal}
          </span>
          <span className="text-[9px] text-[#718069]">Impact Items</span>
        </div>
      </div>

      {/* Ledger list */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#697A5E] px-1">
          Transactions
        </h2>

        {activityLogs.length === 0 ? (
          <div className="py-10 text-center p-6 bg-white/70 rounded-3xl border border-[#EBE4D2]">
            <p className="text-xs text-[#6B7962]">No transactions recorded yet.</p>
          </div>
        ) : (
          activityLogs.map((log) => {
            const isEarned = log.pointsDelta > 0;
            return (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-white border border-[#EBE4D2] shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isEarned
                        ? 'bg-[#F0F3DF] text-[#879B68]'
                        : 'bg-[#FFF0E0] text-[#B85D19]'
                    }`}
                  >
                    {isEarned ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#243428] leading-tight">
                      {log.title}
                    </h3>
                    <span className="text-[10px] text-[#78886F] block mt-0.5">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs sm:text-sm font-extrabold ${
                      isEarned ? 'text-[#879B68]' : 'text-[#B85D19]'
                    }`}
                  >
                    {isEarned ? `+${log.pointsDelta}` : log.pointsDelta} pts
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
