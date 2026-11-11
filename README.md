# InvestSmart – Installable Mobile-First Investment Web Application (PWA)

InvestSmart is a comprehensive, production-ready Progressive Web Application (PWA) designed for Indian retail investors, wealth builders, and portfolio managers. It delivers genuine financial research across the Indian stock market (NSE & BSE), mutual funds, government securities (G-Secs), tax-free PSU bonds, and multi-asset synchronized portfolio tracking.

---

## 🚀 Key Highlights & Architecture

- **PWA First-Class Installation**: Installable directly on **Android, iOS, and Desktop** without visiting the Play Store or App Store. Runs in full-screen **standalone** mode with offline service worker caching and custom application icons.
- **Genuine Indian Financial Data**: Real market quotes for benchmark indices (NIFTY 50, SENSEX, BANK NIFTY, NIFTY IT), bluechip NSE/BSE stocks, AMFI mutual fund schemes, and RBI/CCIL G-Sec yields.
- **AI-Powered Bond Finder**: Custom optimization engine that ranks government, PSU, and corporate bonds by calculating **exact net post-tax yields** tailored to the investor's tax slab (10%, 20%, 30%) and investment horizon.
- **Indian Finance Act 2024 / 2026 Tax Engine**: Dedicated Post-Tax Return Calculator modeling the updated **12.5% Equity LTCG** above ₹1.25L, 20% STCG, Debt slab taxation, and Section 10(15)(iv)(h) 100% Tax-Free PSU bonds.
- **Floating AI Financial Advisor**: Built-in interactive financial assistant providing answers on Indian tax compliance, portfolio rebalancing, asset allocation, and bond vs FD comparisons.
- **Cloud Synchronization & Multi-Device Access**: JWT secure authentication with user-specific portfolios, synced watchlists, and price alerts backed by SQLAlchemy (PostgreSQL / Supabase / SQLite).
- **Responsive Adaptive Interface**: Mobile-first bottom navigation (Home, Stocks, Mutual Funds, Bonds, Portfolio) adapting into an expansive multi-column dashboard on desktop.

---

## 📱 PWA Features & Installation

### Android (Chrome, Brave, Edge, Samsung Internet)
1. Open the application URL in your mobile browser.
2. Tap the floating or header **"Install App"** button (or browser prompt *"Add InvestSmart to Home screen"*).
3. The application installs directly to your home screen with a custom icon, custom splash screen, and standalone navigation.

### iOS (iPhone & iPad Safari)
1. Open the application URL in **Safari**.
2. Tap the **Share** button (`ios_share`) at the bottom of the screen.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right corner. The InvestSmart icon will appear on your iOS Home Screen.

### Desktop (Chrome, Edge)
1. Open the application URL.
2. Click the install icon in the browser address bar or click **"Install Web App"** in the sidebar.
3. The app opens in an independent, window-frame standalone interface with zero browser URL bar distractions.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + TypeScript + Vite |
| **Styling & Design** | Tailwind CSS v4, Plus Jakarta Sans, JetBrains Mono |
| **Icons & Visuals** | Lucide React, High-Performance SVG Interactive Touch Charts |
| **PWA Engine** | Custom Service Worker (`sw.js`), Web App Manifest (`manifest.json`), Offline Caching |
| **Backend API** | Python 3.10+ FastAPI, Uvicorn, Pydantic |
| **Authentication** | OAuth2 / JWT (HS256 Bearer Tokens), Bcrypt Password Hashing |
| **Database ORM** | SQLAlchemy 2.0 (PostgreSQL, Supabase, SQLite) |
| **Financial Services** | `yfinance`, AMFI Mutual Fund API (`api.mfapi.in`), CCIL / RBI Bond Engine |
| **Containerization** | Docker Multi-Stage Build, Docker Compose |

---

## 📁 Project Structure

```
Tracker app/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py          # User registration, login, JWT session, preferences
│   │   │   ├── stocks.py        # NSE/BSE stock screener, technicals & fundamentals
│   │   │   ├── mutual_funds.py  # AMFI schemes, NAV history, comparison matrix
│   │   │   ├── bonds.py         # G-Secs, SGBs, T-Bills, AI Best Bond Finder
│   │   │   ├── portfolio.py     # Multi-asset portfolio CRUD & valuation
│   │   │   ├── calculators.py   # SIP, Lump Sum, FD, RD, Post-Tax returns
│   │   │   ├── ai.py            # AI financial advisor & prompt engine
│   │   │   ├── watchlist.py     # Synchronized user watchlist
│   │   │   └── alerts.py        # Target price alerts & notification feed
│   │   ├── core/
│   │   │   ├── config.py        # Application configuration & env settings
│   │   │   ├── security.py      # Bcrypt password hashing & JWT handling
│   │   │   └── database.py      # SQLAlchemy engine & session manager
│   │   ├── models/
│   │   │   └── models.py        # User, Portfolio, Holding, Watchlist, Alert models
│   │   ├── services/
│   │   │   ├── financial_data.py # Real Indian market data & resilient cache
│   │   │   └── ai_engine.py      # Financial math algorithms & AI reasoning
│   │   └── main.py              # FastAPI app & PWA static file server
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── public/
│   │   ├── manifest.json        # Web App Manifest
│   │   ├── sw.js                # Service Worker with offline caching
│   │   ├── icon-192.png         # PWA app icon (192x192)
│   │   ├── icon-512.png         # PWA app icon (512x512)
│   │   ├── icon-maskable-192.png# Maskable icon for Android adaptive icons
│   │   ├── icon-maskable-512.png# Maskable icon (512x512)
│   │   ├── apple-touch-icon.png # iOS Apple Touch icon (180x180)
│   │   └── favicon.svg          # Vector Favicon
│   ├── src/
│   │   ├── components/          # TopHeader, BottomNav, DesktopSidebar, InstallBanner, Modals
│   │   ├── contexts/            # AuthContext, ThemeContext, PWAContext
│   │   ├── services/            # Typed ApiService
│   │   ├── types/               # TypeScript interfaces
│   │   ├── views/               # HomeView, StocksView, MutualFundsView, BondsView, PortfolioView, CalculatorsView
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── Dockerfile                   # Multi-stage production Docker build
├── docker-compose.yml           # Unified app + PostgreSQL composition
├── render.yaml                  # 1-Click Render.com deployment manifest
├── run_app.py                   # Local launcher script
└── README.md
```

---

## 🏃 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+

### Option 1: Unified Server (Fastest)
Build the frontend and run the application in a single step:

```powershell
# 1. Build frontend
cd frontend
npm install
npm run build
cd ..

# 2. Run unified server
python run_app.py
```
Open **`http://localhost:8000`** in your browser.

---

### Option 2: Split Development (Hot Reloading)

**Terminal 1 (Backend API):**
```powershell
cd backend
python run.py
# Backend runs on http://localhost:8000
# Interactive Swagger docs available at http://localhost:8000/docs
```

**Terminal 2 (Frontend with Vite):**
```powershell
cd frontend
npm run dev
# Frontend runs on http://localhost:5173 with instant Hot Module Replacement (HMR)
```

---

## ☁️ Production Cloud Deployment

### 1. Render.com (Recommended for Free HTTPS + Managed PostgreSQL)
1. Push this repository to GitHub or GitLab.
2. In the Render Dashboard, click **New > Blueprint** and link your repository.
3. Render reads `render.yaml` automatically:
   - Sets up a free managed PostgreSQL database.
   - Builds the Docker container from `Dockerfile`.
   - Provisions an automatic **`https://investsmart.onrender.com`** URL with a free SSL/TLS certificate.
4. Set custom domain (e.g., `investsmart.app`) in the Render Custom Domain panel.

### 2. Railway.app
1. Create a new project on Railway from GitHub repo.
2. Add a PostgreSQL plugin.
3. Railway automatically detects `Dockerfile`, configures `DATABASE_URL`, and assigns a public HTTPS domain.

### 3. Supabase Integration
To connect with a managed Supabase database:
1. Copy the Database Connection String from your Supabase dashboard:
   `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
2. Set the environment variable on your backend host:
   ```bash
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
InvestSmart automatically creates all relational tables on startup (`users`, `portfolios`, `holdings`, `watchlists`, `alerts`).

---

## 🔐 Security & Data Integrity

- **Password Encryption**: Salted and hashed using `bcrypt` (12 rounds).
- **Session Tokens**: Signed JSON Web Tokens (JWT) with standard HS256 encryption.
- **Row-Level User Isolation**: Every portfolio holding, watchlist entry, and price alert is scoped strictly to the authenticated `user_id`.
- **Offline Resilient**: Critical shell assets and API cache are preserved via the Service Worker (`sw.js`), ensuring access even on poor network connectivity.
- **Data Authenticity**: Live market figures are sourced directly from verified financial providers (NSE/BSE, AMFI, CCIL, RBI official debt notifications).

---

## 📄 License
InvestSmart is released under the **MIT License**.

# InvestSmart
