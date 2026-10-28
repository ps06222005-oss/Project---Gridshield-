import React, { useState } from 'react';
import { Gift, Award, Copy, Check, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { RewardItem, UserState, ClaimedVoucher } from '../types';

interface RewardsScreenProps {
  userState: UserState;
  rewards: RewardItem[];
  onRedeemReward: (reward: RewardItem) => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({
  userState,
  rewards,
  onRedeemReward,
}) => {
  const [tab, setTab] = useState<'catalog' | 'vouchers'>('catalog');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-lg mx-auto space-y-4 text-[#344437]">
      {/* Header & Balance Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#F0F3DF] border border-[#DFE5CC] shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#68795A] block">
            Rewards & Ecological Impact
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#243428] mt-0.5">
            {userState.points} <span className="text-sm font-semibold text-[#5B6D4F]">pts available</span>
          </h1>
          <p className="text-[11px] text-[#55644C] mt-1">
            Redeem points for verified reforestation, rural solar, or zero-waste gear.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/80 border border-[#D5DEBF] flex items-center justify-center text-2xl shadow-xs shrink-0">
          🎁
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[#F0ECE0] rounded-2xl border border-[#DFD8C4]">
        <button
          type="button"
          onClick={() => setTab('catalog')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === 'catalog'
              ? 'bg-white text-[#243428] shadow-xs'
              : 'text-[#63725A] hover:text-[#243428]'
          }`}
        >
          Impact Catalog ({rewards.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('vouchers')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === 'vouchers'
              ? 'bg-white text-[#243428] shadow-xs'
              : 'text-[#63725A] hover:text-[#243428]'
          }`}
        >
          My Vouchers ({userState.claimedVouchers.length})
        </button>
      </div>

      {/* Catalog View */}
      {tab === 'catalog' && (
        <div className="space-y-3">
          {rewards.map((reward) => {
            const canAfford = userState.points >= reward.costPoints;
            return (
              <div
                key={reward.id}
                className="p-4 rounded-3xl bg-white border border-[#EBE4D2] shadow-2xs hover:border-[#CCD8B8] transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#F0F3DF] border border-[#DFE5CC] flex items-center justify-center text-xl shadow-xs shrink-0">
                      {reward.imageEmoji}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#798870] block">
                        {reward.category} • {reward.organization}
                      </span>
                      <h3 className="text-sm font-bold text-[#243428] leading-snug">
                        {reward.title}
                      </h3>
                    </div>
                  </div>
                  <div className="shrink-0 px-2.5 py-1 rounded-full bg-[#FFF0E0] border border-[#F4DEC6] text-xs font-bold text-[#B85D19]">
                    {reward.costPoints} pts
                  </div>
                </div>

                <p className="text-xs text-[#52634A] leading-relaxed">
                  {reward.description}
                </p>

                <div className="p-2.5 rounded-xl bg-[#F7F3EA] border border-[#EAE3CE] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#3D4D36] text-[11px]">
                    🌱 {reward.impactMetric}
                  </span>
                  <span className="text-[10px] text-[#7C8B74]">
                    {reward.claimedCount} backers
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-[#697A5E]">
                    {canAfford ? (
                      <span className="text-[#879B68] font-bold">✓ Ready to redeem</span>
                    ) : (
                      <span>Need {reward.costPoints - userState.points} more pts</span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => onRedeemReward(reward)}
                    className="px-5 py-2 rounded-full bg-[#879B68] hover:bg-[#788C5A] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Redeem for {reward.costPoints} pts
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vouchers & Certificates View */}
      {tab === 'vouchers' && (
        <div className="space-y-3">
          {userState.claimedVouchers.length === 0 ? (
            <div className="py-12 text-center p-6 bg-white/70 rounded-3xl border border-[#EBE4D2] space-y-2">
              <span className="text-3xl block">🎟️</span>
              <h3 className="text-sm font-bold text-[#243428]">
                No vouchers claimed yet
              </h3>
              <p className="text-xs text-[#6B7962] max-w-xs mx-auto">
                Complete daily habits to collect points, then redeem them here for trees, solar lamps, or discounts!
              </p>
            </div>
          ) : (
            userState.claimedVouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="p-4 rounded-3xl bg-white border border-[#EBE4D2] shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#879B68] tracking-wider block">
                      Verified Green Voucher
                    </span>
                    <h3 className="text-sm font-bold text-[#243428]">
                      {voucher.rewardTitle}
                    </h3>
                    <span className="text-[11px] text-[#7B8B73]">
                      Claimed on {new Date(voucher.claimedAt).toLocaleDateString()} • {voucher.pointsSpent} pts
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#D9E5C3] text-[#28382B] text-[10px] font-bold">
                    Active
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F0F3DF] border border-[#DFE5CC] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#687A5B] block font-semibold">
                      Voucher Code:
                    </span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-[#233320]">
                      {voucher.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(voucher.id, voucher.code)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#EAEFD6] text-xs font-bold text-[#344437] transition-colors border border-[#D3DDC0] cursor-pointer shadow-2xs"
                  >
                    {copiedId === voucher.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#879B68]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
