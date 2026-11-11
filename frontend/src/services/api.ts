import {
  MarketIndex,
  StockItem,
  MutualFundItem,
  BondItem,
  PortfolioSummary,
  PortfolioHolding,
  WatchlistItem,
  AlertItem,
  NotificationItem,
  UserProfile
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('investsmart_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('investsmart_token', token);
    } else {
      localStorage.removeItem('investsmart_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        let errMessage = `Error ${res.status}: ${res.statusText}`;
        try {
          const errData = await res.json();
          if (errData.detail) errMessage = errData.detail;
        } catch {
          // ignore
        }
        throw new Error(errMessage);
      }
      return await res.json();
    } catch (err: any) {
      // In case backend is not reached yet or offline, throw meaningful error
      console.warn(`API call failed for ${endpoint}:`, err);
      throw err;
    }
  }

  // Auth Endpoints
  async register(data: { email: string; password: string; full_name?: string }) {
    const res = await this.request<{ access_token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(data: { email: string; password: string }) {
    const res = await this.request<{ access_token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/me');
  }

  async updatePreferences(prefs: Partial<UserProfile['preferences']>) {
    return this.request<{ status: string; preferences: any }>('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  }

  logout() {
    this.setToken(null);
  }

  // Stocks
  async getIndices(): Promise<MarketIndex[]> {
    return this.request<MarketIndex[]>('/stocks/indices');
  }

  async listStocks(sector?: string, search?: string, sortBy?: string): Promise<StockItem[]> {
    const params = new URLSearchParams();
    if (sector) params.append('sector', sector);
    if (search) params.append('search', search);
    if (sortBy) params.append('sort_by', sortBy);
    return this.request<StockItem[]>(`/stocks?${params.toString()}`);
  }

  async getStockDetail(symbol: string): Promise<StockItem> {
    return this.request<StockItem>(`/stocks/${encodeURIComponent(symbol)}`);
  }

  // Mutual Funds
  async listMutualFunds(category?: string, search?: string): Promise<MutualFundItem[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return this.request<MutualFundItem[]>(`/funds?${params.toString()}`);
  }

  async compareMutualFunds(schemeCodes: number[]) {
    return this.request<{ funds: MutualFundItem[]; summary: any }>('/funds/compare', {
      method: 'POST',
      body: JSON.stringify({ scheme_codes: schemeCodes }),
    });
  }

  // Bonds
  async listBonds(issuerType?: string, search?: string): Promise<BondItem[]> {
    const params = new URLSearchParams();
    if (issuerType) params.append('issuer_type', issuerType);
    if (search) params.append('search', search);
    return this.request<BondItem[]>(`/bonds?${params.toString()}`);
  }

  async findBestBonds(data: { investment_amount: number; horizon_years: number; tax_bracket_pct: number; risk_tolerance: string }) {
    return this.request<{ user_profile: any; top_recommendation: BondItem; recommendations: BondItem[] }>('/bonds/best-finder', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Portfolio
  async getPortfolio(): Promise<{ summary: PortfolioSummary; holdings: PortfolioHolding[] }> {
    return this.request<{ summary: PortfolioSummary; holdings: PortfolioHolding[] }>('/portfolio');
  }

  async addHolding(data: {
    asset_type: string;
    symbol: string;
    name: string;
    exchange?: string;
    quantity: number;
    buy_price: number;
    buy_date?: string;
    notes?: string;
  }) {
    return this.request<{ status: string; holding_id: number; message: string }>('/portfolio/holdings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHolding(id: number, data: { quantity?: number; buy_price?: number; notes?: string }) {
    return this.request<{ status: string; message: string }>(`/portfolio/holdings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHolding(id: number) {
    return this.request<{ status: string; message: string }>(`/portfolio/holdings/${id}`, {
      method: 'DELETE',
    });
  }

  // Watchlist
  async getWatchlist(): Promise<WatchlistItem[]> {
    return this.request<WatchlistItem[]>('/watchlist');
  }

  async addToWatchlist(item: { asset_type: string; symbol: string; name: string; exchange?: string; sector?: string }) {
    return this.request<{ status: string; id?: number; message: string }>('/watchlist', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async removeFromWatchlist(id: number) {
    return this.request<{ status: string; message: string }>(`/watchlist/${id}`, {
      method: 'DELETE',
    });
  }

  // Calculators
  async calculateSIP(data: { monthly_investment: number; expected_annual_rate: number; duration_years: number; step_up_pct?: number }) {
    return this.request<any>('/calculators/sip', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateLumpSum(data: { principal: number; expected_annual_rate: number; duration_years: number }) {
    return this.request<any>('/calculators/lumpsum', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateFD(data: { principal: number; interest_rate: number; duration_years: number; compounding_frequency?: string; is_senior_citizen?: boolean }) {
    return this.request<any>('/calculators/fd', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateRD(data: { monthly_deposit: number; interest_rate: number; tenure_months: number }) {
    return this.request<any>('/calculators/rd', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculatePostTax(data: { asset_class: string; invested_amount: number; profit_amount: number; holding_period_months: number; tax_bracket_pct: number }) {
    return this.request<any>('/calculators/post-tax', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async compareAssets(data: { investment_amount: number; duration_years: number; tax_bracket_pct: number }) {
    return this.request<any[]>('/calculators/compare-assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI Assistant
  async chatWithAI(message: string, context?: any) {
    return this.request<{ category: string; title: string; content: string; suggested_actions: string[] }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  async getQuickPrompts() {
    return this.request<Array<{ id: string; text: string; icon: string }>>('/ai/quick-prompts');
  }

  // Alerts
  async getAlerts(): Promise<{ alerts: AlertItem[]; notifications: NotificationItem[] }> {
    return this.request<{ alerts: AlertItem[]; notifications: NotificationItem[] }>('/alerts');
  }

  async createAlert(data: { symbol: string; name: string; target_price: number; condition: string; asset_type?: string }) {
    return this.request<{ status: string; alert_id: number; message: string }>('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAlert(id: number) {
    return this.request<{ status: string; message: string }>(`/alerts/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();

