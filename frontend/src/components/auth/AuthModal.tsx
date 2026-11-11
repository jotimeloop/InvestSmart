import React, { useState } from 'react';
import { X, User, Lock, Mail, LogOut, Check, AlertCircle, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, login, register, logout, updatePreferences } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'LOGIN') {
        await login(email, password);
        setSuccessMsg('Successfully logged in! Your portfolio is synchronized.');
        setTimeout(onClose, 800);
      } else {
        await register(email, password, fullName);
        setSuccessMsg('Account created successfully! Welcome to InvestSmart.');
        setTimeout(onClose, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md max-h-[90vh] bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-6 overflow-y-auto shadow-2xl relative space-y-5 animate-slideUp no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {isAuthenticated && user ? (
          /* Profile & Cloud Sync View */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/30">
                {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">{user.full_name}</h3>
                <p className="text-xs text-slate-400">{user.email}</p>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <Check className="w-3 h-3" />
                  <span>Cloud Synchronized (PostgreSQL / Supabase Ready)</span>
                </span>
              </div>
            </div>

            {/* User Preferences */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Investment Preferences
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Risk Profile:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'moderate', 'high'].map((rp) => (
                    <button
                      key={rp}
                      onClick={() => updatePreferences({ risk_profile: rp as any })}
                      className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        user.preferences?.risk_profile === rp
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      {rp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Default Currency:</label>
                <div className="grid grid-cols-2 gap-2">
                  {['INR', 'USD'].map((c) => (
                    <button
                      key={c}
                      onClick={() => updatePreferences({ currency: c as any })}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        user.preferences?.currency === c
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      {c === 'INR' ? '₹ INR (Indian Rupee)' : '$ USD (Dollar)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        ) : (
          /* Sign In & Register Forms */
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-white">
                {mode === 'LOGIN' ? 'Sign In to InvestSmart' : 'Create Free Account'}
              </h3>
              <p className="text-xs text-slate-400">
                Synchronize your watchlist and investment portfolio across mobile and desktop.
              </p>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-800">
              <button
                type="button"
                onClick={() => setMode('LOGIN')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'LOGIN' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('REGISTER')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'REGISTER' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'REGISTER' && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all mt-2"
              >
                <span>{isSubmitting ? 'Authenticating...' : mode === 'LOGIN' ? 'Sign In' : 'Create Account'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
