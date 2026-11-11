import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Shield,
  Layers,
  Coins,
  Building,
  CheckCircle,
  X,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { PortfolioSummary, PortfolioHolding } from '../types';

interface PortfolioViewProps {
  summary: PortfolioSummary | null;
  holdings: PortfolioHolding[];
  onOpenAddAsset: () => void;
  onDeleteHolding: (id: number) => void;
  onRefreshPortfolio: () => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  summary,
  holdings,
  onOpenAddAsset,
  onDeleteHolding,
  onRefreshPortfolio,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'STOCK' | 'MUTUAL_FUND' | 'BOND' | 'FD'>('ALL');

  const filteredHoldings = holdings.filter(
    (h) => activeFilter === 'ALL' || h.asset_type.toUpperCase() === activeFilter
  );

  const getAssetIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'STOCK':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'MUTUAL_FUND':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'BOND':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'FD':
        return <Building className="w-4 h-4 text-purple-400" />;
      default:
        return <Coins className="w-4 h-4 text-slate-400" />;
    }
  };

  const getAssetBadgeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'STOCK':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'MUTUAL_FUND':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'BOND':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'FD':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const alloc = summary?.asset_allocation || {};

  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      {/* 1. Portfolio Net Worth Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/20 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Total Net Worth
              </span>
              <button
                onClick={onRefreshPortfolio}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Refresh Portfolio Values"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
              ₹{summary?.total_portfolio_value.toLocaleString('en-IN') || '4,28,500.00'}
            </div>
          </div>

          <button
            onClick={onOpenAddAsset}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Asset</span>
          </button>
        </div>

        {/* 3 Metrics Row */}
        <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-slate-800">
          <div>
            <div className="text-[11px] text-slate-400">Total Invested</div>
            <div className="text-xs sm:text-sm font-bold text-slate-200">
              ₹{summary?.total_invested.toLocaleString('en-IN') || '3,45,000'}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400">Total Profit & Loss</div>
            <div className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                +₹{summary?.total_profit_loss.toLocaleString('en-IN')} (+{summary?.total_profit_loss_pct}%)
              </span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400">Today's P&L</div>
            <div className="text-xs sm:text-sm font-bold text-emerald-400">
              +₹{summary?.today_pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Multi-Asset Allocation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Asset Allocation & Balance
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Health: <strong className="text-emerald-400">{summary?.health_score || 92}/100</strong>
          </span>
        </div>

        {/* Multi-segment colored progress bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${alloc.STOCK || 35}%` }}
            className="h-full bg-blue-500"
            title={`Stocks: ${alloc.STOCK}%`}
          />
          <div
            style={{ width: `${alloc.MUTUAL_FUND || 30}%` }}
            className="h-full bg-emerald-500"
            title={`Mutual Funds: ${alloc.MUTUAL_FUND}%`}
          />
          <div
            style={{ width: `${alloc.BOND || 20}%` }}
            className="h-full bg-amber-500"
            title={`Bonds: ${alloc.BOND}%`}
          />
          <div
            style={{ width: `${alloc.FD || 15}%` }}
            className="h-full bg-purple-500"
            title={`Fixed Deposits: ${alloc.FD}%`}
          />
        </div>

        {/* Legend row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-300">Stocks: <strong>{alloc.STOCK || 0}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Mutual Funds: <strong>{alloc.MUTUAL_FUND || 0}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Bonds: <strong>{alloc.BOND || 0}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-slate-300">FDs: <strong>{alloc.FD || 0}%</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Holdings Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'ALL', label: `All (${holdings.length})` },
          { id: 'STOCK', label: 'Stocks' },
          { id: 'MUTUAL_FUND', label: 'Mutual Funds' },
          { id: 'BOND', label: 'Bonds' },
          { id: 'FD', label: 'Fixed Deposits' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
              activeFilter === tab.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Holdings List */}
      <div className="space-y-3">
        {filteredHoldings.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <Coins className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-sm font-bold text-white">No assets in this category</div>
            <p className="text-xs text-slate-400">Tap below to add an asset to your synchronized portfolio.</p>
            <button
              onClick={onOpenAddAsset}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              Add Asset Now
            </button>
          </div>
        ) : (
          filteredHoldings.map((h) => {
            const isPos = h.profit_loss >= 0;

            return (
              <div
                key={h.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 transition-all shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 mt-0.5">
                      {getAssetIcon(h.asset_type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white truncate">{h.symbol}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getAssetBadgeColor(
                            h.asset_type
                          )}`}
                        >
                          {h.asset_type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">{h.name}</div>
                    </div>
                  </div>

                  {/* Delete holding action */}
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${h.name} from portfolio?`)) {
                        onDeleteHolding(h.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete holding"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Values row */}
                <div className="grid grid-cols-3 gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400">Qty · Avg Price</div>
                    <div className="text-xs font-bold text-slate-200">
                      {h.quantity} @ ₹{h.buy_price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400">Current Value</div>
                    <div className="text-xs font-extrabold text-white">
                      ₹{h.current_value.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400">Profit / Loss</div>
                    <div
                      className={`text-xs font-black flex items-center justify-center gap-0.5 ${
                        isPos ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPos ? '+' : ''}₹{h.profit_loss.toLocaleString('en-IN')} ({isPos ? '+' : ''}
                      {h.profit_loss_pct}%)
                    </div>
                  </div>
                </div>

                {h.notes && (
                  <div className="text-[11px] text-slate-400 italic bg-slate-800/20 px-2 py-1 rounded">
                    &ldquo;{h.notes}&rdquo;
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
