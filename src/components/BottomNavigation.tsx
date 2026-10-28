import React from 'react';
import { Home, CheckSquare, Gift, BookOpen, User } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  completedTasksCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const navItems = [
    { id: 'home' as ScreenType, label: 'Home', icon: Home },
    { id: 'tasks' as ScreenType, label: 'Tasks', icon: CheckSquare },
    { id: 'rewards' as ScreenType, label: 'Rewards', icon: Gift },
    { id: 'learn' as ScreenType, label: 'Learn', icon: BookOpen },
    { id: 'profile' as ScreenType, label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFF9EC]/95 backdrop-blur-md border-t border-[#E8E1CE] px-4 py-2 sm:py-2.5 max-w-[480px] mx-auto"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#28382B]'
                  : 'text-[#7D8A74] hover:text-[#425239]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#879B68] text-white shadow-xs'
                    : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-[#28382B]' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
