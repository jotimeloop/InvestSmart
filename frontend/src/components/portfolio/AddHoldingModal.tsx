import React, { useState } from 'react';
import { X, Plus, TrendingUp, Layers, Shield, Building, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefill?: {
    asset_type?: string;
    symbol?: string;
    name?: string;
    buy_price?: number;
    exchange?: string;
  } | null;
}

export const AddHoldingModal: React.FC<AddHoldingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  prefill,
}) => {
  const [assetType, setAssetType] = useState(prefill?.asset_type || 'STOCK');
  const [symbol, setSymbol] = useState(prefill?.symbol || '');
  const [name, setName] = useState(prefill?.name || '');
  const [exchange, setExchange] = useState(prefill?.exchange || 'NSE');
  const [quantity, setQuantity] = useState(1);
  const [buyPrice, setBuyPrice] = useState(prefill?.buy_price || 100);
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (prefill) {
      if (prefill.asset_type) setAssetType(prefill.asset_type);
      if (prefill.symbol) setSymbol(prefill.symbol);
      if (prefill.name) setName(prefill.name);
      if (prefill.buy_price) setBuyPrice(prefill.buy_price);
      if (prefill.exchange) setExchange(prefill.exchange);
    }
  }, [prefill]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!symbol.trim() || !name.trim()) {
      setError('Please provide asset symbol and name.');
      return;
    }
    if (quantity <= 0 || buyPrice <= 0) {
      setError('Quantity and purchase price must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.addHolding({
        asset_type: assetType.toUpperCase(),
        symbol: symbol.trim(),
        name: name.trim(),
        exchange,
        quantity,
        buy_price: buyPrice,
        buy_date: buyDate,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add holding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md max-h-[90vh] bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-6 overflow-y-auto shadow-2xl relative space-y-4 animate-slideUp no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <h3 className="text-lg font-black text-white">Add Asset to Portfolio</h3>
          <p className="text-xs text-slate-400">Track real-time valuations & calculate XIRR returns</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Asset Type Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Asset Class</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'STOCK', label: 'Stock', icon: TrendingUp },
                { id: 'MUTUAL_FUND', label: 'MF', icon: Layers },
                { id: 'BOND', label: 'Bond', icon: Shield },
                { id: 'FD', label: 'FD', icon: Building },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAssetType(t.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    assetType === t.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Symbol & Exchange */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Ticker / Symbol</label>
              <input
                type="text"
                required
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. RELIANCE, TCS"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Exchange</label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
                <option value="AMFI">AMFI</option>
                <option value="RBI">RBI</option>
                <option value="BANK">Bank</option>
              </select>
            </div>
          </div>

          {/* Asset Name */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Asset Name / Scheme</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Reliance Industries Ltd"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Quantity & Buy Price */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Quantity</label>
              <input
                type="number"
                step="any"
                min="0.001"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Buy Price (₹)</label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={buyPrice}
                onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Purchase Date</label>
              <input
                type="date"
                value={buyDate}
                onChange={(e) => setBuyDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Total Cost Basis</label>
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400">
                ₹{(quantity * buyPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Core long-term holding"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all mt-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? 'Saving Holding...' : 'Save to Portfolio'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

