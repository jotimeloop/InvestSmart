import React, { useState } from 'react';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Heart,
  Plus,
  BarChart2,
  Shield,
  X,
  Info,
  Check,
  Zap
} from 'lucide-react';
import { StockItem } from '../types';
import { InteractiveChart } from '../components/common/InteractiveChart';

interface StocksViewProps {
  stocks: StockItem[];
  watchlistSymbols: Set<string>;
  onToggleWatchlist: (stock: StockItem) => void;
  onOpenAddHolding: (stock: StockItem) => void;
  selectedStock: StockItem | null;
  onSelectStock: (stock: StockItem | null) => void;
}

export const StocksView: React.FC<StocksViewProps> = ({
  stocks,
  watchlistSymbols,
  onToggleWatchlist,
  onOpenAddHolding,
  selectedStock,
  onSelectStock,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [sortBy, setSortBy] = useState<'market_cap' | 'price' | 'change' | 'pe'>('market_cap');

  const sectors = [
    'All',
    'Banking & Financials',
    'Information Technology',
    'FMCG',
    'Automobile',
    'Infrastructure',
    'Healthcare & Pharma',
    'Energy & Retail',
  ];

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.code.toLowerCase().includes(search.toLowerCase()) ||
      stock.name.toLowerCase().includes(search.toLowerCase()) ||
      stock.sector.toLowerCase().includes(search.toLowerCase());
    const matchesSector =
      selectedSector === 'All' || stock.sector.toLowerCase().includes(selectedSector.toLowerCase());
    return matchesSearch && matchesSector;
  });

  filteredStocks.sort((a, b) => {
    if (sortBy === 'price') return b.price - a.price;
    if (sortBy === 'change') return b.change_pct - a.change_pct;
    if (sortBy === 'pe') return a.pe - b.pe;
    return b.market_cap_cr - a.market_cap_cr;
  });

  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      {/* Header & Search */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Indian Stock Screener</h2>
            <p className="text-xs text-slate-400">NSE & BSE Premier Bluechips and Growth Leaders</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {filteredStocks.length} Stocks Listed
          </span>
        </div>

        {/* Search input & Sort bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by symbol (e.g. RELIANCE, TCS, INFY)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="market_cap">Largest Market Cap</option>
            <option value="change">Top % Gainers</option>
            <option value="price">Highest Price</option>
            <option value="pe">Lowest P/E (Value)</option>
          </select>
        </div>

        {/* Horizontal scrollable sector pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                selectedSector === sec
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Stocks Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredStocks.map((stock) => {
          const isPos = stock.change_pct >= 0;
          const isSaved = watchlistSymbols.has(stock.symbol);
          const rangePct =
            Math.max(
              0,
              Math.min(
                100,
                ((stock.price - stock.low_52w) / (stock.high_52w - stock.low_52w || 1)) * 100
              )
            );

          return (
            <div
              key={stock.symbol}
              onClick={() => onSelectStock(stock)}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all shadow-sm cursor-pointer group active:scale-[0.99] space-y-3"
            >
              {/* Header row: code, name, sector, watchlist heart */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
                      {stock.code}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {stock.exchange}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                      {stock.technicals.trend}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">{stock.name}</div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(stock);
                    }}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isSaved
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/50 hover:text-white'
                    }`}
                    title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-400' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAddHolding(stock);
                    }}
                    className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition-all"
                    title="Add to Portfolio"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Price & Change Row */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-lg font-black text-white tracking-tight">
                    ₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div
                    className={`text-xs font-bold flex items-center gap-0.5 ${
                      isPos ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>
                      {isPos ? '+' : ''}₹{stock.change.toFixed(2)} ({isPos ? '+' : ''}
                      {stock.change_pct}%)
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 space-y-0.5">
                  <div>
                    P/E: <span className="font-bold text-slate-200">{stock.pe}</span>
                  </div>
                  <div>
                    ROCE: <span className="font-bold text-emerald-400">{stock.roce}%</span>
                  </div>
                </div>
              </div>

              {/* 52-Week Range Bar */}
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>52W L: ₹{stock.low_52w}</span>
                  <span>52W H: ₹{stock.high_52w}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${rangePct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Detail Modal */}
      {selectedStock && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-6 overflow-y-auto shadow-2xl relative space-y-5 animate-slideUp no-scrollbar">
            {/* Close Button */}
            <button
              onClick={() => onSelectStock(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white">{selectedStock.code}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                  {selectedStock.exchange}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                  {selectedStock.sector}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{selectedStock.name}</p>
            </div>

            {/* Price & Trend Header */}
            <div className="flex items-baseline justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
              <div>
                <div className="text-2xl font-black text-white">
                  ₹{selectedStock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div
                  className={`text-xs font-bold flex items-center gap-1 ${
                    selectedStock.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedStock.change_pct >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>
                    {selectedStock.change_pct >= 0 ? '+' : ''}₹{selectedStock.change.toFixed(2)} ({selectedStock.change_pct}%)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Valuation:</div>
                <div className="text-xs font-bold text-emerald-400">{selectedStock.valuation || 'Fair Value'}</div>
              </div>
            </div>

            {/* Interactive Touch Chart */}
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Price Trend (Recent Sessions)</span>
                <span className="text-[10px] text-emerald-400">Touch/drag to inspect</span>
              </div>
              <InteractiveChart
                data={selectedStock.chart_data}
                height={140}
                isPositive={selectedStock.change_pct >= 0}
              />
            </div>

            {/* Technical Indicators */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Technical Momentum & Indicators
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">RSI (14-Day)</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {selectedStock.technicals.rsi_14}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    {selectedStock.technicals.rsi_14 > 60 ? 'Overbought' : (selectedStock.technicals.rsi_14 < 40 ? 'Oversold' : 'Neutral')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">MACD Signal</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {selectedStock.technicals.macd_signal}
                  </div>
                  <div className="text-[10px] text-slate-400">Momentum</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">Trend</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {selectedStock.technicals.trend}
                  </div>
                  <div className="text-[10px] text-slate-400">Moving Avg</div>
                </div>
              </div>
            </div>

            {/* Key Fundamentals Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Key Fundamentals
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex justify-between">
                  <span className="text-slate-400">Market Cap:</span>
                  <span className="font-bold text-white">₹{(selectedStock.market_cap_cr / 1000).toFixed(1)}k Cr</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex justify-between">
                  <span className="text-slate-400">P/E Ratio:</span>
                  <span className="font-bold text-white">{selectedStock.pe}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex justify-between">
                  <span className="text-slate-400">P/B Ratio:</span>
                  <span className="font-bold text-white">{selectedStock.pb}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex justify-between">
                  <span className="text-slate-400">ROCE:</span>
                  <span className="font-bold text-emerald-400">{selectedStock.roce}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex justify-between">
                  <span className="text-slate-400">ROE:</span>
                  <span className="font-bold text-emerald-400">{selectedStock.roe}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex justify-between">
                  <span className="text-slate-400">Dividend Yield:</span>
                  <span className="font-bold text-white">{selectedStock.dividend_yield}%</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  onToggleWatchlist(selectedStock);
                }}
                className={`flex-1 py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  watchlistSymbols.has(selectedStock.symbol)
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${watchlistSymbols.has(selectedStock.symbol) ? 'fill-rose-400' : ''}`} />
                <span>
                  {watchlistSymbols.has(selectedStock.symbol) ? 'In Watchlist' : 'Add to Watchlist'}
                </span>
              </button>

              <button
                onClick={() => {
                  onSelectStock(null);
                  onOpenAddHolding(selectedStock);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add to Portfolio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
