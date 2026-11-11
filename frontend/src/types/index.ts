export type NavTab = 'home' | 'stocks' | 'funds' | 'bonds' | 'portfolio' | 'calculators';

export interface UserPreferences {
  theme: 'dark' | 'light';
  currency: 'INR' | 'USD';
  notifications: boolean;
  risk_profile: 'low' | 'moderate' | 'high';
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  preferences: UserPreferences;
  is_active: boolean;
  created_at: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  change_pct: number;
  status: string;
}

export interface StockTechnicals {
  rsi_14: number;
  trend: string;
  sma_50: number;
  sma_200: number;
  macd_signal: string;
}

export interface StockItem {
  symbol: string;
  code: string;
  name: string;
  exchange: string;
  sector: string;
  price: number;
  change: number;
  change_pct: number;
  high_52w: number;
  low_52w: number;
  market_cap_cr: number;
  pe: number;
  pb: number;
  dividend_yield: number;
  roce: number;
  roe: number;
  eps: number;
  beta: number;
  technicals: StockTechnicals;
  chart_data: number[];
  fundamental_score?: number;
  valuation?: string;
}

export interface MutualFundItem {
  scheme_code: number;
  name: string;
  short_name: string;
  fund_house: string;
  category: string;
  type: string;
  nav: number;
  nav_date: string;
  return_1y: number;
  return_3y_cagr: number;
  return_5y_cagr: number;
  expense_ratio: number;
  aum_cr: number;
  riskometer: string;
  rating: number;
  top_holdings: string[];
  min_sip: number;
  exit_load: string;
}

export interface BondItem {
  id: string;
  isin: string;
  name: string;
  issuer: string;
  issuer_type: string;
  credit_rating: string;
  rating_agency: string;
  coupon_rate: number;
  ytm: number;
  face_value: number;
  market_price: number;
  maturity_date: string;
  tenure_years: number;
  payment_frequency: string;
  taxability: string;
  is_tax_free: boolean;
  liquidity: string;
  min_investment: number;
  ai_score: number;
  pros: string[];
  cons: string[];
  post_tax_yield?: number;
  effective_pre_tax_yield?: number;
  ai_suitability_score?: number;
  recommendation_reason?: string;
}

export interface PortfolioHolding {
  id: number;
  asset_type: 'STOCK' | 'MUTUAL_FUND' | 'BOND' | 'FD';
  symbol: string;
  name: string;
  exchange: string;
  quantity: number;
  buy_price: number;
  current_price: number;
  invested_amount: number;
  current_value: number;
  profit_loss: number;
  profit_loss_pct: number;
  day_change_pct: number;
  buy_date?: string;
  notes?: string;
}

export interface PortfolioSummary {
  total_portfolio_value: number;
  total_invested: number;
  total_profit_loss: number;
  total_profit_loss_pct: number;
  today_pnl: number;
  today_pnl_pct: number;
  health_score: number;
  health_verdict: string;
  asset_allocation: {
    STOCK?: number;
    MUTUAL_FUND?: number;
    BOND?: number;
    FD?: number;
  };
  holdings_count: number;
}

export interface WatchlistItem {
  id: number;
  asset_type: string;
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  price: number;
  change_pct: number;
  added_at: string;
}

export interface AlertItem {
  id: number;
  symbol: string;
  name: string;
  target_price: number;
  condition: string;
  is_triggered: boolean;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'info' | 'neutral';
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  category?: string;
  suggested_actions?: string[];
  timestamp: string;
}

