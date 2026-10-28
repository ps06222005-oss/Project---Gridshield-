import React, { useState } from 'react';
import { User, MapPin, Award, History, Settings, ChevronRight, RotateCcw, Sparkles, ExternalLink, Globe } from 'lucide-react';
import { UserState, ScreenType } from '../types';
import { calculateUserLevel } from '../utils/ecoLogic';

interface ProfileScreenProps {
  userState: UserState;
  onNavigate: (screen: ScreenType) => void;
  onUpdateLocation: (location: string) => void;
  onResetData: () => void;
  onOpenWelcome: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userState,
  onNavigate,
  onUpdateLocation,
  onResetData,
  onOpenWelcome,
}) => {
  const levelInfo = calculateUserLevel(userState.points);
  const [showLocationSelect, setShowLocationSelect] = useState(false);

  const indianCities = [
    'Bengaluru, India',
    'Delhi NCR, India',
    'Mumbai, India',
    'Pune, India',
    'Chennai, India',
    'Hyderabad, India',
    'Kolkata, India',
    'Jaipur, India',
    'Ahmedabad, India',
  ];

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-lg mx-auto space-y-4 text-[#344437]">
      {/* Header Profile Card */}
      <div className="p-5 rounded-3xl bg-white border border-[#EBE4D2] shadow-2xs space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-[#879B68] text-white text-xl font-bold flex items-center justify-center shadow-xs">
            {userState.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#243428] leading-tight">
              {userState.name}
            </h1>
            <button
              type="button"
              onClick={() => setShowLocationSelect(!showLocationSelect)}
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#6A7B62] hover:text-[#28382B] transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#879B68]" />
              <span>{userState.location}</span>
              <span className="text-[10px] text-[#879B68] underline">(Change)</span>
            </button>
          </div>
        </div>

        {/* Location Dropdown selector */}
        {showLocationSelect && (
          <div className="p-3 bg-[#F0F3DF] rounded-2xl border border-[#DFE5CC] space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#55644C] tracking-wider block">
              Choose Regional Grid Center:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {indianCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    onUpdateLocation(city);
                    setShowLocationSelect(false);
                  }}
                  className={`text-left px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    userState.location === city
                      ? 'bg-[#879B68] text-white font-bold'
                      : 'bg-white text-[#344437] hover:bg-[#E4ECD0]'
                  }`}
                >
                  {city.split(',')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Level Progression */}
        <div className="p-4 rounded-2xl bg-[#F0F3DF] border border-[#DFE5CC] space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#697B5D]">
                Level {levelInfo.level} Tier
              </span>
              <h3 className="text-sm font-bold text-[#243428]">
                {levelInfo.title}
              </h3>
            </div>
            <span className="text-xs font-bold text-[#879B68]">
              {userState.points} Green Points
            </span>
          </div>

          <div className="w-full h-2 bg-white/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#879B68] rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-[#6E7E65]">
            <span>{levelInfo.currentLevelPoints} pts in level</span>
            <span>Next level at {levelInfo.nextLevelPoints} pts</span>
          </div>
        </div>
      </div>

      {/* Navigation Links Group */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#697A5E] px-1">
          Activity & Preferences
        </h2>

        <div className="bg-white rounded-3xl border border-[#EBE4D2] overflow-hidden divide-y divide-[#F2ECE0] shadow-2xs">
          <button
            type="button"
            onClick={() => onNavigate('activity')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#FDF9F0] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#F0F3DF] text-[#879B68]">
                <History className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#243428] block">
                  Activity History
                </span>
                <span className="text-[11px] text-[#718069]">
                  {userState.activityLogs.length} logged actions & milestones
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9EA995]" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('points-history')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#FDF9F0] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#F0F3DF] text-[#879B68]">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#243428] block">
                  Points History
                </span>
                <span className="text-[11px] text-[#718069]">
                  Detailed ledger of points earned and spent
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9EA995]" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#FDF9F0] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#F0F3DF] text-[#879B68]">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#243428] block">
                  Settings
                </span>
                <span className="text-[11px] text-[#718069]">
                  Goals, regional grid, and notification preferences
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9EA995]" />
          </button>

          <button
            type="button"
            onClick={onOpenWelcome}
            className="w-full p-4 flex items-center justify-between hover:bg-[#FDF9F0] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#F0F3DF] text-[#879B68]">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#243428] block">
                  View Welcome Screen
                </span>
                <span className="text-[11px] text-[#718069]">
                  Revisit the reference globe presentation
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9EA995]" />
          </button>
        </div>
      </div>

      {/* Reset State Button */}
      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={onResetData}
          className="inline-flex items-center gap-1.5 text-xs text-[#879B68] hover:text-[#5B6F45] font-semibold py-2 px-3 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Demo Data</span>
        </button>
      </div>
    </div>
  );
};
