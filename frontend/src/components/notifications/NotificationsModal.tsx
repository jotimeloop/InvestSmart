import React, { useState, useEffect } from 'react';
import { X, Bell, Plus, Trash2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { AlertItem, NotificationItem } from '../../types';
import { api } from '../../services/api';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [targetPrice, setTargetPrice] = useState(100);
  const [condition, setCondition] = useState('ABOVE');

  const loadAlerts = async () => {
    try {
      const res = await api.getAlerts();
      setAlerts(res.alerts);
      setNotifications(res.notifications);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAlert({
        symbol: symbol.toUpperCase(),
        name: name || symbol.toUpperCase(),
        target_price: targetPrice,
        condition,
      });
      setShowAddAlert(false);
      setSymbol('');
      setName('');
      loadAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await api.deleteAlert(id);
      loadAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md max-h-[90vh] bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-6 overflow-y-auto shadow-2xl relative space-y-5 animate-slideUp no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-black text-white">Alerts & Notifications</h3>
          </div>
          <button
            onClick={() => setShowAddAlert(!showAddAlert)}
            className="text-xs font-bold text-emerald-400 flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Set Price Alert</span>
          </button>
        </div>

        {/* Create Price Alert Form */}
        {showAddAlert && (
          <form onSubmit={handleCreateAlert} className="p-3.5 rounded-2xl bg-slate-800/80 border border-emerald-500/30 space-y-2.5 text-xs">
            <div className="font-bold text-white">Create Target Price Alert</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Symbol (e.g. RELIANCE)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
              />
              <input
                type="number"
                required
                placeholder="Target Price (₹)"
                value={targetPrice}
                onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-slate-300"
              >
                <option value="ABOVE">Price Goes Above</option>
                <option value="BELOW">Price Drops Below</option>
              </select>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold"
              >
                Save Alert
              </button>
            </div>
          </form>
        )}

        {/* Live Notifications Feed */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Recent Market Updates
          </div>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-start gap-3"
              >
                <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white">{n.title}</div>
                  <div className="text-[11px] text-slate-300">{n.message}</div>
                  <div className="text-[9px] text-slate-500 mt-1">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Price Alerts */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Price Alerts ({alerts.length})
          </div>
          <div className="space-y-2">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{a.symbol}</div>
                  <div className="text-[11px] text-slate-400">
                    Alert when price is {a.condition.toLowerCase()} ₹{a.target_price}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAlert(a.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
