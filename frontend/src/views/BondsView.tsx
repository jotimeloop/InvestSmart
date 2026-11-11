import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Plus,
  ArrowRight,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Percent,
  Calendar,
  Lock
} from 'lucide-react';
import { BondItem } from '../types';
import { api } from '../services/api';

interface BondsViewProps {
  bonds: BondItem[];
  onOpenAddHolding: (bond: BondItem) => void;
}

export const BondsView: React.FC<BondsViewProps> = ({ bonds, onOpenAddHolding }) => {
  const [search, setSearch] = useState('');
  const [issuerFilter, setIssuerFilter] = useState('All');
  const [selectedBond, setSelectedBond] = useState<BondItem | null>(null);

  // Best Bond Finder Wizard States
  const [showWizard, setShowWizard] = useState(false);
  const [wizardHorizon, setWizardHorizon] = useState(3.0);
  const [wizardTaxSlab, setWizardTaxSlab] = useState(30.0);
  const [wizardRisk, setWizardRisk] = useState('moderate');
  const [wizardResults, setWizardResults] = useState<{
    top_recommendation: BondItem;
    recommendations: BondItem[];
  } | null>(null);
  const [isLoadingWizard, setIsLoadingWizard] = useState(false);

  const issuers = ['All', 'Sovereign', 'PSU Navratna', 'Corporate Bluechip', 'NBFC'];

  const filteredBonds = bonds.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.issuer.toLowerCase().includes(search.toLowerCase()) ||
      b.isin.toLowerCase().includes(search.toLowerCase());
    const matchesIssuer =
      issuerFilter === 'All' || b.issuer_type.toLowerCase().includes(issuerFilter.toLowerCase());
    return matchesSearch && matchesIssuer;
  });

  const handleRunBondFinder = async () => {
    setIsLoadingWizard(true);
    try {
      const res = await api.findBestBonds({
        investment_amount: 100000,
        horizon_years: wizardHorizon,
        tax_bracket_pct: wizardTaxSlab,
        risk_tolerance: wizardRisk,
      });
      setWizardResults(res);
    } catch (err) {
      console.error('Failed to run bond finder:', err);
    } finally {
      setIsLoadingWizard(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      {/* Header & Launch Wizard Button */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Government & Corporate Bonds</h2>
            <p className="text-xs text-slate-400">Sovereign G-Secs · 100% Tax-Free PSU Bonds · High-Yield AAA NCDs</p>
          </div>

          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Launch Best Bond Finder</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bond name, ISIN, or issuer (e.g. REC, GS 2034, SGB)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {issuers.map((iss) => (
            <button
              key={iss}
              onClick={() => setIssuerFilter(iss)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                issuerFilter === iss
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {iss}
            </button>
          ))}
        </div>
      </div>

      {/* Bonds List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredBonds.map((bond) => {
          return (
            <div
              key={bond.id}
              onClick={() => setSelectedBond(bond)}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all shadow-sm cursor-pointer group active:scale-[0.99] space-y-3"
            >
              {/* Header: Name, ISIN, Rating */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {bond.credit_rating}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {bond.issuer_type}
                    </span>
                    {bond.is_tax_free && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        100% Tax-Free
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
                    {bond.name}
                  </h3>
                  <div className="text-[11px] text-slate-400 truncate font-mono">ISIN: {bond.isin}</div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAddHolding(bond);
                  }}
                  className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition-all shrink-0"
                  title="Add to Portfolio"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Yield & Terms Row */}
              <div className="grid grid-cols-3 gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-center">
                <div>
                  <div className="text-[10px] text-slate-400">Coupon Rate</div>
                  <div className="text-xs font-black text-white">{bond.coupon_rate}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Yield to Maturity</div>
                  <div className="text-xs font-black text-emerald-400">{bond.ytm}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Maturity Date</div>
                  <div className="text-xs font-bold text-slate-300">{bond.maturity_date}</div>
                </div>
              </div>

              {/* Tax status & AI Score */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="truncate max-w-[200px]">{bond.taxability}</span>
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>AI Score: {bond.ai_score}/10</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Best Bond Finder Interactive Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-6 overflow-y-auto shadow-2xl relative space-y-5 animate-slideUp no-scrollbar">
            <button
              onClick={() => setShowWizard(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-black text-white">AI Best Bond Finder</h3>
              </div>
              <p className="text-xs text-slate-400">
                Discover bonds that beat fixed deposits based on your income tax slab.
              </p>
            </div>

            {/* Input Controls */}
            <div className="space-y-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              {/* Horizon */}
              <div>
                <label className="text-xs font-semibold text-slate-300 flex justify-between">
                  <span>Investment Horizon:</span>
                  <span className="text-emerald-400 font-bold">{wizardHorizon} Years</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={wizardHorizon}
                  onChange={(e) => setWizardHorizon(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-emerald-500"
                />
              </div>

              {/* Tax Slab */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Your Marginal Income Tax Slab:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 10, 20, 30].map((slab) => (
                    <button
                      key={slab}
                      type="button"
                      onClick={() => setWizardTaxSlab(slab)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        wizardTaxSlab === slab
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {slab}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Tolerance */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Risk Appetite:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: 'Low (G-Secs)' },
                    { id: 'moderate', label: 'Moderate (AAA)' },
                    { id: 'high', label: 'High (AA+ Yield)' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setWizardRisk(r.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                        wizardRisk === r.id
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleRunBondFinder}
                disabled={isLoadingWizard}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoadingWizard ? 'Calculating After-Tax Yields...' : 'Find Best Ranked Bonds'}</span>
              </button>
            </div>

            {/* Results Presentation */}
            {wizardResults && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Top Recommended Bonds
                </div>

                {wizardResults.recommendations.map((b, idx) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-slate-800/80 border border-emerald-500/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-extrabold">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-extrabold text-white">{b.name}</span>
                      </div>
                      <span className="text-xs font-black text-emerald-400">
                        {b.post_tax_yield}% Net Post-Tax
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-xl">
                      {b.recommendation_reason}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Rating: <strong className="text-white">{b.credit_rating}</strong></span>
                      <span>Maturity: <strong className="text-white">{b.tenure_years} Years</strong></span>
                      <button
                        onClick={() => {
                          setShowWizard(false);
                          onOpenAddHolding(b);
                        }}
                        className="text-xs font-bold text-emerald-400 hover:underline"
                      >
                        Add to Portfolio &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bond Detail Modal */}
      {selectedBond && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-6 overflow-y-auto shadow-2xl relative space-y-5 animate-slideUp no-scrollbar">
            <button
              onClick={() => setSelectedBond(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  {selectedBond.credit_rating}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                  {selectedBond.issuer_type}
                </span>
              </div>
              <h3 className="text-lg font-black text-white">{selectedBond.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">ISIN: {selectedBond.isin}</p>
            </div>

            {/* Yield Card */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] text-slate-400">Coupon Rate</div>
                <div className="text-xl font-black text-white mt-0.5">{selectedBond.coupon_rate}%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">YTM (Annual)</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{selectedBond.ytm}%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Market Price</div>
                <div className="text-xl font-black text-slate-200 mt-0.5">₹{selectedBond.market_price}</div>
              </div>
            </div>

            {/* Pros and Cons */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Key Advantages:</span>
                </div>
                {selectedBond.pros.map((p) => (
                  <div key={p} className="text-xs text-slate-300 flex items-start gap-2 pl-2">
                    <span className="text-emerald-400 mt-1">&bull;</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Important Considerations:</span>
                </div>
                {selectedBond.cons.map((c) => (
                  <div key={c} className="text-xs text-slate-300 flex items-start gap-2 pl-2">
                    <span className="text-amber-400 mt-1">&bull;</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add to Portfolio */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedBond(null);
                  onOpenAddHolding(selectedBond);
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
    </div>
  );
};

