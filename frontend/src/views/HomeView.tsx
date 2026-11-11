import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  ShieldCheck,
  Calculator,
  ArrowRight,
  PieChart,
  Plus,
  Sparkles,
  Zap,
  CheckCircle,
  Clock
} from 'lucide-react';
import { MarketIndex, PortfolioSummary, StockItem, NavTab } from '../types';

interface HomeViewProps {
  indices: MarketIndex[];
  portfolioSummary: PortfolioSummary | null;
  stocks: StockItem[];
  onSelectTab: (tab: NavTab) => void;
  onOpenAddAsset: () => void;
  onOpenStockDetail: (stock: StockItem) => void;
  onOpenAI: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  indices,
  portfolioSummary,
  stocks,
  onSelectTab,
  onOpenAddAsset,
  onOpenStockDetail,
  onOpenAI,
}) => {
  // Top gainers and losers
  const sortedByChange = [...stocks].sort((a, b) => b.change_pct - a.change_pct);
  const topGainers = sortedByChange.slice(0, 4);
  const topLosers = [...stocks].sort((a, b) => a.change_pct - b.change_pct).slice(0, 4);

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* 1. Indian Market Benchmark Indices Carousel / Bar */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Indian Market Indices
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">NSE & BSE Live</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {indices.map((idx) => {
            const isPos = idx.change >= 0;
            return (
              <div
                key={idx.symbol}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300">{idx.name}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isPos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {idx.status}
                  </span>
                </div>
                <div className="text-base font-extrabold text-white tracking-tight">
                  ₹{idx.value.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </div>
                <div
                  className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${
                    isPos ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>
                    {isPos ? '+' : ''}
                    {idx.change.toFixed(1)} ({isPos ? '+' : ''}
                    {idx.change_pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Portfolio Snapshot Card */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/20 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">
                Net Portfolio Value
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                ₹{portfolioSummary?.total_portfolio_value.toLocaleString('en-IN') || '4,28,500.00'}
              </div>
            </div>

            <button
              onClick={onOpenAddAsset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Asset</span>
            </button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
            <div>
              <div className="text-[11px] text-slate-400">Total Invested</div>
              <div className="text-xs sm:text-sm font-bold text-slate-200">
                ₹{portfolioSummary?.total_invested.toLocaleString('en-IN') || '3,45,000'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Overall Returns</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>+₹{portfolioSummary?.total_profit_loss.toLocaleString('en-IN') || '83,500'}</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Today's P&L</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-400">
                +₹{portfolioSummary?.today_pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '2,750'}
              </div>
            </div>
          </div>

          {/* Quick Portfolio navigation button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Health Score: {portfolioSummary?.health_score || 92}/100 ({portfolioSummary?.health_verdict || 'Well-Balanced'})</span>
            </span>
            <button
              onClick={() => onSelectTab('portfolio')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Quick Action Feature Launchpad */}
      <section className="space-y-2.5">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Explore Investment Engines
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => onSelectTab('stocks')}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all text-left group active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white leading-none">Stock Screener</div>
            <div className="text-[10px] text-slate-400 mt-1">NSE & BSE Fundamentals</div>
          </button>

          <button
            onClick={() => onSelectTab('funds')}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all text-left group active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white leading-none">Mutual Funds</div>
            <div className="text-[10px] text-slate-400 mt-1">Direct Plans & Top CAGR</div>
          </button>

          <button
            onClick={() => onSelectTab('bonds')}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all text-left group active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white leading-none">AI Bond Finder</div>
            <div className="text-[10px] text-slate-400 mt-1">Tax-Free & G-Sec Yields</div>
          </button>

          <button
            onClick={() => onSelectTab('calculators')}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all text-left group active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white leading-none">Calculators</div>
            <div className="text-[10px] text-slate-400 mt-1">SIP, FD & Post-Tax</div>
          </button>
        </div>
      </section>

      {/* 4. Market Movers: Top Gainers & Trending Stocks */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Today's Market Movers
          </div>
          <button
            onClick={() => onSelectTab('stocks')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Top Gainers */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>Top Gainers (NSE)</span>
            </div>
            <div className="divide-y divide-slate-800/60">
              {topGainers.map((s) => (
                <div
                  key={s.symbol}
                  onClick={() => onOpenStockDetail(s)}
                  className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <div className="font-bold text-xs text-white">{s.code}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{s.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-xs text-white">
                      ₹{s.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-400">
                      +{s.change_pct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Value / Dip Opportunities */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Zap className="w-4 h-4" />
              <span>Value Opportunities (Low PE)</span>
            </div>
            <div className="divide-y divide-slate-800/60">
              {topLosers.map((s) => (
                <div
                  key={s.symbol}
                  onClick={() => onOpenStockDetail(s)}
                  className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <div className="font-bold text-xs text-white">{s.code}</div>
                    <div className="text-[10px] text-slate-400">P/E: {s.pe} · ROCE: {s.roce}%</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-xs text-white">
                      ₹{s.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                    <div className={`text-[11px] font-bold ${s.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {s.change_pct >= 0 ? '+' : ''}{s.change_pct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI Advisor Spotlight Banner */}
      <section className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/30 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">
              Optimize for 2026 Tax Changes
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Learn how the ₹1.25L LTCG exemption and 100% Tax-Free Bonds protect your portfolio returns.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenAI}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask Advisor</span>
        </button>
      </section>
    </div>
  );
};

