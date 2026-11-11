import React, { useState } from 'react';
import { Search, X, TrendingUp, Layers, Shield, ArrowRight } from 'lucide-react';
import { StockItem, MutualFundItem, BondItem } from '../../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: StockItem[];
  funds: MutualFundItem[];
  bonds: BondItem[];
  onSelectStock: (stock: StockItem) => void;
  onSelectFund: (fund: MutualFundItem) => void;
  onSelectBond: (bond: BondItem) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  stocks,
  funds,
  bonds,
  onSelectStock,
  onSelectFund,
  onSelectBond,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedStocks = q ? stocks.filter((s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)).slice(0, 4) : [];
  const matchedFunds = q ? funds.filter((f) => f.name.toLowerCase().includes(q) || f.fund_house.toLowerCase().includes(q)).slice(0, 4) : [];
  const matchedBonds = q ? bonds.filter((b) => b.name.toLowerCase().includes(q) || b.issuer.toLowerCase().includes(q)).slice(0, 4) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 pt-16 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-4 shadow-2xl space-y-4 animate-slideDown">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all Indian stocks, mutual funds, or bonds..."
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-9 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto space-y-3 no-scrollbar text-xs">
          {!q && (
            <div className="py-8 text-center text-slate-500">
              Type to search across NSE/BSE stocks, AMFI mutual funds, and government bonds.
            </div>
          )}

          {matchedStocks.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Stocks ({matchedStocks.length})
              </div>
              {matchedStocks.map((s) => (
                <div
                  key={s.symbol}
                  onClick={() => {
                    onClose();
                    onSelectStock(s);
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-bold text-white">{s.code}</span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[180px]">{s.name}</span>
                  </div>
                  <span className="font-extrabold text-white">₹{s.price}</span>
                </div>
              ))}
            </div>
          )}

          {matchedFunds.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Mutual Funds ({matchedFunds.length})
              </div>
              {matchedFunds.map((f) => (
                <div
                  key={f.scheme_code}
                  onClick={() => {
                    onClose();
                    onSelectFund(f);
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-white truncate max-w-[220px]">{f.short_name}</span>
                  </div>
                  <span className="font-bold text-emerald-400">+{f.return_3y_cagr}% 3Y</span>
                </div>
              ))}
            </div>
          )}

          {matchedBonds.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Bonds ({matchedBonds.length})
              </div>
              {matchedBonds.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    onClose();
                    onSelectBond(b);
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-white truncate max-w-[220px]">{b.name}</span>
                  </div>
                  <span className="font-bold text-emerald-400">{b.ytm}% YTM</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

