import React from 'react';
import {
  Home,
  TrendingUp,
  Layers,
  ShieldCheck,
  PieChart,
  Calculator,
  Download,
  Sparkles,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { NavTab, MarketIndex } from '../../types';
import { usePWA } from '../../contexts/PWAContext';

interface DesktopSidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  indices: MarketIndex[];
  onOpenAI: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTab,
  onSelectTab,
  indices,
  onOpenAI,
}) => {
  const { isInstallable, isInstalled, installApp } = usePWA();

  const navItems = [
    { id: 'home' as NavTab, label: 'Dashboard Home', icon: Home, desc: 'Market overview & insights' },
    { id: 'stocks' as NavTab, label: 'Indian Stocks', icon: TrendingUp, desc: 'NSE & BSE Screener' },
    { id: 'funds' as NavTab, label: 'Mutual Funds', icon: Layers, desc: 'Top schemes & SIP returns' },
    { id: 'bonds' as NavTab, label: 'Bonds & G-Secs', icon: ShieldCheck, desc: 'Tax-Free & Sovereign debt' },
    { id: 'portfolio' as NavTab, label: 'My Portfolio', icon: PieChart, desc: 'Multi-asset synchronized tracker' },
    { id: 'calculators' as NavTab, label: 'Calculators', icon: Calculator, desc: 'SIP, FD, RD, Post-Tax' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-slate-800 bg-slate-900/60 p-5 space-y-6">
      {/* Brand logo & tagline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xl tracking-tight text-white">InvestSmart</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              PWA
            </span>
          </div>
          <p className="text-xs text-slate-400">Mobile-First Wealth Suite</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5">
        <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-emerald-400' : 'text-slate-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-none">{item.label}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* AI Assistant Quick Trigger */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white">AI Financial Advisor</span>
        </div>
        <p className="text-[11px] text-slate-300 mb-3">
          Instant answers on Indian tax laws, portfolio rebalancing, and best bond picks.
        </p>
        <button
          onClick={onOpenAI}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask AI Assistant</span>
        </button>
      </div>

      {/* Market Watch Indices ticker summary */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-1">
          Market Pulse
        </div>
        <div className="grid grid-cols-2 gap-2">
          {indices.slice(0, 4).map((idx) => (
            <div key={idx.symbol} className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-[11px] text-slate-400 truncate">{idx.name}</div>
              <div className="text-xs font-bold text-white">
                ₹{idx.value.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
              </div>
              <div
                className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                  idx.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {idx.change >= 0 ? '+' : ''}
                {idx.change_pct}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Install PWA Prompt on Desktop */}
      {isInstallable && !isInstalled && (
        <div className="mt-auto p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center">
          <Smartphone className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-white">Install as App</div>
          <p className="text-[10px] text-slate-400 mb-2">Access offline with dedicated window.</p>
          <button
            onClick={installApp}
            className="w-full py-1.5 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs flex items-center justify-center gap-1 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Install Web App</span>
          </button>
        </div>
      )}
    </aside>
  );
};

