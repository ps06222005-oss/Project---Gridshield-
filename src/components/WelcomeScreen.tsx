import React, { useState } from 'react';
import { ArrowRight, Globe, Loader2 } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onExplore: () => void;
  isLoading?: boolean;
  authError?: string | null;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onExplore,
  isLoading = false,
  authError = null,
}) => {
  const [selectedRegion, setSelectedRegion] = useState('India (Active)');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFF9EC] text-[#344437] flex flex-col items-center justify-between px-6 py-6 sm:py-8 select-none max-w-md mx-auto">
      {/* Top Brand Badge */}
      <header className="w-full flex justify-center pt-2 sm:pt-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRegionDropdown(!showRegionDropdown)}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#EFF3E1] border border-[#DEE5CC] text-[#344437] text-xs font-semibold tracking-wide hover:bg-[#E5EBD0] transition-colors shadow-2xs"
            aria-label="GRIDSHIELD AI brand badge and region menu"
            aria-expanded={showRegionDropdown}
          >
            {/* Green icon circle */}
            <span className="w-4 h-4 rounded-full bg-[#879B68] flex items-center justify-center text-white shrink-0">
              <Globe className="w-2.5 h-2.5" />
            </span>
            <span className="font-extrabold tracking-wider text-[11px] text-[#28382B]">GRIDSHIELD AI</span>
            {/* Subtle indicator dot/dropdown */}
            <span className="w-1.5 h-1.5 rounded-full bg-[#879B68] opacity-80"></span>
          </button>

          {/* Region selector dropdown */}
          {showRegionDropdown && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 bg-white border border-[#DFE5CC] rounded-2xl shadow-lg py-1.5 z-30 text-xs">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#879B68] tracking-wider border-b border-[#F0F3DF]">
                Active Grid Node
              </div>
              {['India (Active)', 'South Asia Regional', 'Global Demo Hub'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setSelectedRegion(r);
                    setShowRegionDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-[#F0F3DF] transition-colors flex items-center justify-between ${
                    selectedRegion === r ? 'font-bold text-[#28382B]' : 'text-[#576247]'
                  }`}
                >
                  <span>{r}</span>
                  {selectedRegion === r && <span className="w-2 h-2 rounded-full bg-[#879B68]"></span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full flex flex-col items-center justify-center my-auto py-2">
        {/* Globe Container with Impact Pill */}
        <div className="relative flex flex-col items-center">
          {/* Hero Illustration directly from reference screenshot crop */}
          <div className="w-56 h-56 sm:w-60 sm:h-60 rounded-full flex items-center justify-center relative">
            <img
              src="/assets/earth_hero_clean.png"
              alt="Earth globe showing continents with India highlighted in soft amber"
              className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(50,70,50,0.06)]"
              loading="eager"
            />
          </div>

          {/* Impact indicator pill badge positioned overlapping below the globe */}
          <div className="-mt-3 z-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#E3DCBA] shadow-[0_2px_8px_rgba(52,68,55,0.08)] text-[11px] sm:text-xs font-semibold text-[#28382B]">
              <span className="w-2 h-2 rounded-full bg-[#526437] animate-pulse"></span>
              <span>Local Impact: Active ({selectedRegion.split(' ')[0]})</span>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="mt-7 text-center px-4 max-w-[320px]">
          <h1 className="text-[30px] sm:text-[34px] font-extrabold text-[#243428] leading-[1.18] tracking-tight">
            Small Actions.<br />Greener Future.
          </h1>
          <p className="mt-3 text-xs sm:text-[13px] text-[#55644C] leading-relaxed font-normal">
            Build simple daily habits that help protect our planet and earn rewarding green achievements.
          </p>
        </div>

        {/* Optional Auth Warning Banner */}
        {authError && (
          <div className="w-full max-w-[280px] mt-4 p-2.5 rounded-2xl bg-[#FFF0E0] border border-[#F4DEC6] text-[#B85D19] text-xs text-center font-medium leading-relaxed">
            {authError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onGetStarted}
            className="w-full max-w-[280px] py-3.5 px-6 rounded-full bg-[#556E40] hover:bg-[#485E36] active:scale-[0.98] disabled:opacity-60 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(85,110,64,0.38)] transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Get Started with Google</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onExplore}
            className="text-xs sm:text-sm font-semibold text-[#344437] hover:text-[#1F2C22] hover:underline transition-colors py-1 cursor-pointer disabled:opacity-50"
          >
            Explore the App (Guest Mode)
          </button>
        </div>
      </main>

      {/* Subtle footer */}
      <footer className="w-full text-center pb-2 text-[10px] text-[#5A6652] tracking-wider uppercase">
        GRIDSHIELD AI • Organic Habit Architecture
      </footer>
    </div>
  );
};
