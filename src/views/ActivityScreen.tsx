import React from 'react';
import { ArrowLeft, CheckCircle2, Award, Gift, Sparkles, BookOpen } from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityScreenProps {
  activityLogs: ActivityLog[];
  onBack: () => void;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  activityLogs,
  onBack,
}) => {
  const getIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-[#879B68]" />;
      case 'quiz_completed':
        return <BookOpen className="w-4 h-4 text-[#668DA0]" />;
      case 'reward_claimed':
        return <Gift className="w-4 h-4 text-[#B85D19]" />;
      case 'badge_unlocked':
        return <Award className="w-4 h-4 text-[#E5C453]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#879B68]" />;
    }
  };

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
            Activity History
          </h1>
          <p className="text-xs text-[#627359]">
            Chronological record of your environmental actions and milestones.
          </p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-2.5">
        {activityLogs.length === 0 ? (
          <div className="py-12 text-center p-6 bg-white/70 rounded-3xl border border-[#EBE4D2]">
            <span className="text-3xl block mb-2">📜</span>
            <h3 className="text-sm font-bold text-[#243428]">No activity recorded yet</h3>
            <p className="text-xs text-[#6B7962] mt-1">Complete your first daily habit to begin your log.</p>
          </div>
        ) : (
          activityLogs.map((log) => {
            const isPositive = log.pointsDelta > 0;
            return (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-white border border-[#EBE4D2] shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F0F3DF] border border-[#DFE5CC] flex items-center justify-center shrink-0">
                    {getIcon(log.type)}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#243428] leading-tight">
                      {log.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-[#78886F] mt-0.5">
                      <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      {log.impactDetails && <span>• {log.impactDetails}</span>}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`text-xs sm:text-sm font-extrabold ${
                      isPositive ? 'text-[#879B68]' : 'text-[#B85D19]'
                    }`}
                  >
                    {isPositive ? `+${log.pointsDelta}` : log.pointsDelta} pts
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
