import React from 'react';
import { Download, X, Share, PlusSquare, Smartphone, RefreshCw, CheckCircle2 } from 'lucide-react';
import { usePWA } from '../../contexts/PWAContext';

export const InstallBanner: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    showIOSGuide,
    setShowIOSGuide,
    installApp,
    updateAvailable,
    reloadApp,
  } = usePWA();

  const [dismissed, setDismissed] = React.useState(false);

  // 1. Update Notification Banner
  if (updateAvailable) {
    return (
      <div className="bg-emerald-600 text-slate-950 px-4 py-2.5 flex items-center justify-between text-xs font-semibold shadow-lg sticky top-0 z-50 animate-bounce">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>New InvestSmart update available with latest market features!</span>
        </div>
        <button
          onClick={reloadApp}
          className="bg-slate-950 text-emerald-400 px-3 py-1 rounded-md text-xs font-bold hover:bg-slate-900 transition-all active:scale-95"
        >
          Update Now
        </button>
      </div>
    );
  }

  // 2. Global Mobile Install Banner (if installable and not standalone and not dismissed)
  return (
    <>
      {isInstallable && !isInstalled && !dismissed && (
        <div className="bg-gradient-to-r from-emerald-900/90 via-slate-900/95 to-slate-900 border-b border-emerald-500/30 px-4 py-2.5 text-xs text-white flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="font-bold text-emerald-400">Install InvestSmart App:</span>{' '}
              <span className="text-slate-300">Run in standalone mode with offline access.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={installApp}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-400 hover:text-white"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. iOS Step-by-Step Add to Home Screen Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl relative space-y-5 animate-slideUp">
            {/* Close button */}
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Smartphone className="w-6 h-6 text-slate-950" />
              </div>
              <h3 className="font-extrabold text-lg text-white">Install on iPhone / iPad</h3>
              <p className="text-xs text-slate-400">
                Install InvestSmart to your iOS Home Screen in 3 quick taps:
              </p>
            </div>

            {/* Visual Steps */}
            <div className="space-y-3.5 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs text-slate-200">
                  Tap the <span className="font-bold text-emerald-400">Share button</span>{' '}
                  <Share className="w-3.5 h-3.5 inline mx-1 text-emerald-400" /> at the bottom or top of Safari.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs text-slate-200">
                  Scroll down the share sheet and select{' '}
                  <span className="font-bold text-white bg-slate-700 px-1.5 py-0.5 rounded">
                    Add to Home Screen
                  </span>{' '}
                  <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-400" />.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs text-slate-200">
                  Tap <span className="font-bold text-emerald-400">Add</span> in the top right corner. The InvestSmart icon will appear on your iPhone screen!
                </div>
              </div>
            </div>

            {/* Benefits badge */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full-screen app view · Offline caching · Fast startup</span>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all active:scale-95"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

