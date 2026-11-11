import React, { useState } from 'react';
import {
  Search,
  Filter,
  Layers,
  Star,
  Plus,
  ArrowRight,
  X,
  CheckSquare,
  Square,
  TrendingUp,
  Sparkles,
  PieChart
} from 'lucide-react';
import { MutualFundItem } from '../types';
import { api } from '../services/api';

interface MutualFundsViewProps {
  funds: MutualFundItem[];
  onOpenAddHolding: (fund: MutualFundItem) => void;
}

export const MutualFundsView: React.FC<MutualFundsViewProps> = ({ funds, onOpenAddHolding }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedFund, setSelectedFund] = useState<MutualFundItem | null>(null);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareData, setCompareData] = useState<{ funds: MutualFundItem[]; summary: any } | null>(null);

  const categories = ['All', 'Flexi Cap', 'Small Cap', 'Large Cap', 'Index', 'Hybrid', 'Debt'];

  const filtered = funds.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.fund_house.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || f.category.toLowerCase().includes(category.toLowerCase()) || f.type.toLowerCase().includes(category.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const toggleCompare = (code: number) => {
    if (compareList.includes(code)) {
      setCompareList(compareList.filter((c) => c !== code));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare up to 3 mutual funds at a time.');
        return;
      }
      setCompareList([...compareList, code]);
    }
  };

  const handleLaunchCompare = async () => {
    if (compareList.length < 2) return;
    try {
      const res = await api.compareMutualFunds(compareList);
      setCompareData(res);
      setShowCompareModal(true);
    } catch (err) {
      console.error('Failed to compare funds:', err);
    }
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Mutual Funds Discovery</h2>
            <p className="text-xs text-slate-400">Direct Plans · Low Expense Ratios · Consistent Wealth Creators</p>
          </div>

          {compareList.length >= 2 && (
            <button
              onClick={handleLaunchCompare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Compare ({compareList.length})</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by fund or AMC (e.g. Parag Parikh, Nippon, HDFC)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                category === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Funds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((fund) => {
          const isComparing = compareList.includes(fund.scheme_code);

          return (
            <div
              key={fund.scheme_code}
              onClick={() => setSelectedFund(fund)}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all shadow-sm cursor-pointer group active:scale-[0.99] space-y-3"
            >
              {/* Header: Name, AMC, Rating & Compare checkbox */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400">
                      {fund.category}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      Direct Plan
                    </span>
                    <div className="flex items-center text-amber-400 ml-1">
                      {Array.from({ length: fund.rating }).map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
                    {fund.short_name}
                  </h3>
                  <div className="text-[11px] text-slate-400 truncate">{fund.fund_house}</div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Compare toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompare(fund.scheme_code);
                    }}
                    className={`p-1.5 rounded-lg border transition-all text-xs font-semibold flex items-center gap-1 ${
                      isComparing
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    title="Select to compare"
                  >
                    {isComparing ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="text-[10px] hidden sm:inline">Compare</span>
                  </button>

                  {/* Add to Portfolio */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAddHolding(fund);
                    }}
                    className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition-all"
                    title="Add to Portfolio"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* NAV & Multi-Year Returns */}
              <div className="grid grid-cols-4 gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400">Current NAV</div>
                  <div className="text-xs font-black text-white">₹{fund.nav}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">1Y Return</div>
                  <div className="text-xs font-black text-emerald-400">+{fund.return_1y}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">3Y CAGR</div>
                  <div className="text-xs font-black text-emerald-400">+{fund.return_3y_cagr}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">5Y CAGR</div>
                  <div className="text-xs font-black text-emerald-400">+{fund.return_5y_cagr}%</div>
                </div>
              </div>

              {/* Fund Specs */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Expense Ratio: <strong className="text-slate-200">{fund.expense_ratio}%</strong></span>
                <span>AUM: <strong className="text-slate-200">₹{(fund.aum_cr / 1000).toFixed(1)}k Cr</strong></span>
                <span>Min SIP: <strong className="text-slate-200">₹{fund.min_sip}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mutual Fund Detail Modal */}
      {selectedFund && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-6 overflow-y-auto shadow-2xl relative space-y-5 animate-slideUp no-scrollbar">
            <button
              onClick={() => setSelectedFund(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Scheme Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  {selectedFund.category}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                  Direct Plan - Growth
                </span>
              </div>
              <h3 className="text-lg font-black text-white">{selectedFund.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedFund.fund_house}</p>
            </div>

            {/* NAV and Returns Banner */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] text-slate-400">Latest NAV ({selectedFund.nav_date})</div>
                <div className="text-xl font-black text-white mt-0.5">₹{selectedFund.nav}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">3-Year CAGR</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">+{selectedFund.return_3y_cagr}%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Expense Ratio</div>
                <div className="text-xl font-black text-slate-200 mt-0.5">{selectedFund.expense_ratio}%</div>
              </div>
            </div>

            {/* Top Holdings */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Top Portfolio Holdings</span>
                <span className="text-[10px] text-emerald-400">High Conviction</span>
              </div>
              <div className="space-y-1.5">
                {selectedFund.top_holdings.map((h, i) => (
                  <div
                    key={h}
                    className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span className="font-medium text-white">{h}</span>
                    </div>
                    <span className="text-emerald-400 font-bold">Portfolio Anchor</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheme Details Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheme Details</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex justify-between">
                  <span className="text-slate-400">AUM:</span>
                  <span className="font-bold text-white">₹{selectedFund.aum_cr.toLocaleString('en-IN')} Cr</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex justify-between">
                  <span className="text-slate-400">Riskometer:</span>
                  <span className="font-bold text-amber-400">{selectedFund.riskometer}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex justify-between">
                  <span className="text-slate-400">Min SIP:</span>
                  <span className="font-bold text-white">₹{selectedFund.min_sip}/month</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex justify-between">
                  <span className="text-slate-400">Exit Load:</span>
                  <span className="font-bold text-slate-300 truncate max-w-[100px]">{selectedFund.exit_load}</span>
                </div>
              </div>
            </div>

            {/* Add to Portfolio Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedFund(null);
                  onOpenAddHolding(selectedFund);
                }}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add to My Portfolio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && compareData && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-6 overflow-y-auto shadow-2xl relative space-y-5 animate-slideUp no-scrollbar">
            <button
              onClick={() => setShowCompareModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-lg font-black text-white">Mutual Funds Comparison Matrix</h3>
              <p className="text-xs text-slate-400">Direct head-to-head performance & cost analysis</p>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-2.5 pr-4 text-slate-400 font-semibold">Metric</th>
                    {compareData.funds.map((f) => (
                      <th key={f.scheme_code} className="py-2.5 px-3 text-white font-bold min-w-[140px]">
                        {f.short_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="py-2.5 pr-4 text-slate-400">Category</td>
                    {compareData.funds.map((f) => (
                      <td key={f.scheme_code} className="py-2.5 px-3 text-emerald-400 font-semibold">
                        {f.category}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-slate-400">Current NAV</td>
                    {compareData.funds.map((f) => (
                      <td key={f.scheme_code} className="py-2.5 px-3 text-white font-bold">
                        ₹{f.nav}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-slate-400">1-Year Return</td>
                    {compareData.funds.map((f) => (
                      <td key={f.scheme_code} className="py-2.5 px-3 font-bold text-emerald-400">
                        +{f.return_1y}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-slate-400">3-Year CAGR</td>
                    {compareData.funds.map((f) => (
                      <td key={f.scheme_code} className="py-2.5 px-3 font-bold text-emerald-400">
                        +{f.return_3y_cagr}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-slate-400">5-Year CAGR</td>
                    {compareData.funds.map((f) => (
                      <td key={f.scheme_code} className="py-2.5 px-3 font-bold text-emerald-400">
                        +{f.return_5y_cagr}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-slate-400">Expense Ratio</td>
                    {compareData.funds.map((f) => (
                      <td key={f.scheme_code} className="py-2.5 px-3 text-slate-200 font-bold">
                        {f.expense_ratio}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-slate-400">AUM (₹ Cr)</td>
                    {compareData.funds.map((f) => (
                      <td key={f.scheme_code} className="py-2.5 px-3 text-slate-300">
                        ₹{f.aum_cr.toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Verdict summary */}
            <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/30 space-y-1.5">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Comparison Verdict</span>
              </div>
              <p className="text-xs text-slate-300">
                <strong>{compareData.summary.highest_3y_cagr}</strong> leads on 3-year compounded returns, while{' '}
                <strong>{compareData.summary.lowest_expense_ratio}</strong> provides the lowest recurring management fee.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

