import React, { useState, useEffect } from 'react';
import { Sparkles, Download } from 'lucide-react';
import { NavTab, MarketIndex, StockItem, MutualFundItem, BondItem, PortfolioSummary, PortfolioHolding } from './types';
import { api } from './services/api';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PWAProvider, usePWA } from './contexts/PWAContext';

import { TopHeader } from './components/layout/TopHeader';
import { BottomNav } from './components/layout/BottomNav';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { InstallBanner } from './components/layout/InstallBanner';

import { HomeView } from './views/HomeView';
import { StocksView } from './views/StocksView';
import { MutualFundsView } from './views/MutualFundsView';
import { BondsView } from './views/BondsView';
import { PortfolioView } from './views/PortfolioView';
import { CalculatorsView } from './views/CalculatorsView';

import { AIAssistantModal } from './components/ai/AIAssistantModal';
import { AddHoldingModal } from './components/portfolio/AddHoldingModal';
import { AuthModal } from './components/auth/AuthModal';
import { NotificationsModal } from './components/notifications/NotificationsModal';
import { QuickSearchModal } from './components/search/QuickSearchModal';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  // Core Data States
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [funds, setFunds] = useState<MutualFundItem[]>([]);
  const [bonds, setBonds] = useState<BondItem[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [watchlistSymbols, setWatchlistSymbols] = useState<Set<string>>(new Set());

  // Modal Dialog States
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Selected Items for deep analysis
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [prefillHolding, setPrefillHolding] = useState<any>(null);

  // Load initial datasets
  const loadData = async () => {
    try {
      const [idxData, stocksData, fundsData, bondsData, portData, watchData] = await Promise.allSettled([
        api.getIndices(),
        api.listStocks(),
        api.listMutualFunds(),
        api.listBonds(),
        api.getPortfolio(),
        api.getWatchlist(),
      ]);

      if (idxData.status === 'fulfilled') setIndices(idxData.value);
      if (stocksData.status === 'fulfilled') setStocks(stocksData.value);
      if (fundsData.status === 'fulfilled') setFunds(fundsData.value);
      if (bondsData.status === 'fulfilled') setBonds(bondsData.value);
      if (portData.status === 'fulfilled') {
        setPortfolioSummary(portData.value.summary);
        setHoldings(portData.value.holdings);
      }
      if (watchData.status === 'fulfilled') {
        setWatchlistSymbols(new Set(watchData.value.map((w) => w.symbol)));
      }
    } catch (err) {
      console.warn('Initial data load completed with fallback:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Hotkey for search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRefreshPortfolio = async () => {
    try {
      const port = await api.getPortfolio();
      setPortfolioSummary(port.summary);
      setHoldings(port.holdings);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleWatchlist = async (stock: StockItem) => {
    if (watchlistSymbols.has(stock.symbol)) {
      const next = new Set(watchlistSymbols);
      next.delete(stock.symbol);
      setWatchlistSymbols(next);
      try {
        const list = await api.getWatchlist();
        const item = list.find((w) => w.symbol === stock.symbol);
        if (item) await api.removeFromWatchlist(item.id);
      } catch (e) {
        console.error(e);
      }
    } else {
      const next = new Set(watchlistSymbols);
      next.add(stock.symbol);
      setWatchlistSymbols(next);
      try {
        await api.addToWatchlist({
          asset_type: 'STOCK',
          symbol: stock.symbol,
          name: stock.name,
          exchange: stock.exchange,
          sector: stock.sector,
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDeleteHolding = async (id: number) => {
    try {
      await api.deleteHolding(id);
      handleRefreshPortfolio();
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAddHoldingWithPrefill = (item: any) => {
    if ('code' in item) {
      // Stock
      setPrefillHolding({
        asset_type: 'STOCK',
        symbol: item.symbol,
        name: item.name,
        buy_price: item.price,
        exchange: item.exchange,
      });
    } else if ('scheme_code' in item) {
      // Mutual Fund
      setPrefillHolding({
        asset_type: 'MUTUAL_FUND',
        symbol: String(item.scheme_code),
        name: item.name,
        buy_price: item.nav,
        exchange: 'AMFI',
      });
    } else if ('isin' in item) {
      // Bond
      setPrefillHolding({
        asset_type: 'BOND',
        symbol: item.id || item.isin,
        name: item.name,
        buy_price: item.market_price,
        exchange: 'NSE',
      });
    }
    setIsAddAssetOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      {/* PWA Install Banner */}
      <InstallBanner />

      {/* Top Header */}
      <TopHeader
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Container: Adapts dynamically from single-column mobile view to desktop dashboard */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar (hidden on mobile) */}
        <DesktopSidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          indices={indices}
          onOpenAI={() => setIsAIModalOpen(true)}
        />

        {/* Core Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {currentTab === 'home' && (
            <HomeView
              indices={indices}
              portfolioSummary={portfolioSummary}
              stocks={stocks}
              onSelectTab={setCurrentTab}
              onOpenAddAsset={() => {
                setPrefillHolding(null);
                setIsAddAssetOpen(true);
              }}
              onOpenStockDetail={(s) => setSelectedStock(s)}
              onOpenAI={() => setIsAIModalOpen(true)}
            />
          )}

          {currentTab === 'stocks' && (
            <StocksView
              stocks={stocks}
              watchlistSymbols={watchlistSymbols}
              onToggleWatchlist={handleToggleWatchlist}
              onOpenAddHolding={handleOpenAddHoldingWithPrefill}
              selectedStock={selectedStock}
              onSelectStock={setSelectedStock}
            />
          )}

          {currentTab === 'funds' && (
            <MutualFundsView
              funds={funds}
              onOpenAddHolding={handleOpenAddHoldingWithPrefill}
            />
          )}

          {currentTab === 'bonds' && (
            <BondsView
              bonds={bonds}
              onOpenAddHolding={handleOpenAddHoldingWithPrefill}
            />
          )}

          {currentTab === 'portfolio' && (
            <PortfolioView
              summary={portfolioSummary}
              holdings={holdings}
              onOpenAddAsset={() => {
                setPrefillHolding(null);
                setIsAddAssetOpen(true);
              }}
              onDeleteHolding={handleDeleteHolding}
              onRefreshPortfolio={handleRefreshPortfolio}
            />
          )}

          {currentTab === 'calculators' && <CalculatorsView />}
        </main>
      </div>

      {/* Floating AI Assistant Button (Accessible from every view) */}
      <button
        onClick={() => setIsAIModalOpen(true)}
        className="fixed bottom-20 lg:bottom-8 right-5 z-40 p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 font-bold shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all group flex items-center gap-2"
        title="Open AI Investment Advisor"
      >
        <Sparkles className="w-5 h-5 text-slate-950 animate-spin-slow" />
        <span className="text-xs font-black tracking-tight hidden sm:inline">Ask AI</span>
      </button>

      {/* Mobile Bottom Navigation Bar (5 tabs) */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Modals */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      <AddHoldingModal
        isOpen={isAddAssetOpen}
        onClose={() => {
          setIsAddAssetOpen(false);
          setPrefillHolding(null);
        }}
        onSuccess={handleRefreshPortfolio}
        prefill={prefillHolding}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        stocks={stocks}
        funds={funds}
        bonds={bonds}
        onSelectStock={(s) => {
          setSelectedStock(s);
          setCurrentTab('stocks');
        }}
        onSelectFund={() => setCurrentTab('funds')}
        onSelectBond={() => setCurrentTab('bonds')}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PWAProvider>
          <AppContent />
        </PWAProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
