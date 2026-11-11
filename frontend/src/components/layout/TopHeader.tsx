import React from 'react';
import { Download, Sun, Moon, Bell, User as UserIcon, Shield, Search } from 'lucide-react';
import { usePWA } from '../../contexts/PWAContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface TopHeaderProps {
  onOpenAuth: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenAuth,
  onOpenNotifications,
  onOpenSearch,
}) => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 pt-safe transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                InvestSmart
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none hidden sm:block">
              NSE · BSE · Mutual Funds · Bonds
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-all active:scale-95"
            title="Search Assets"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* PWA Install Button (Prominent when available) */}
          {isInstallable && !isInstalled && (
            <button
              onClick={installApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all animate-pulse"
              title="Install App to Home Screen"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="font-bold">Install App</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-all active:scale-95"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-all active:scale-95"
            title="Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
          </button>

          {/* Profile / Account */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-all active:scale-95 text-xs font-medium"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
              {isAuthenticated && user?.full_name ? user.full_name[0].toUpperCase() : <UserIcon className="w-3 h-3" />}
            </div>
            <span className="hidden sm:inline">
              {isAuthenticated ? user?.full_name?.split(' ')[0] : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
