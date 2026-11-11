import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, stocks, mutual_funds, bonds, portfolio, calculators, ai, watchlist, alerts

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables exist
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="InvestSmart - Professional Investment Research & Portfolio Tracking API",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api/v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(stocks.router, prefix=settings.API_V1_STR)
app.include_router(mutual_funds.router, prefix=settings.API_V1_STR)
app.include_router(bonds.router, prefix=settings.API_V1_STR)
app.include_router(portfolio.router, prefix=settings.API_V1_STR)
app.include_router(calculators.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(watchlist.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)

@app.get("/health")
def health():
    return {"status": "healthy", "service": "InvestSmart Backend API"}

# Determine if frontend dist exists
current_dir = os.path.dirname(os.path.abspath(__file__))
# Check both potential paths: ../../frontend/dist (from backend/app) or ./frontend/dist (from workspace root)
dist_path = os.path.abspath(os.path.join(current_dir, "..", "..", "frontend", "dist"))
if not os.path.exists(dist_path):
    dist_path = os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist"))

if os.path.exists(dist_path):
    assets_path = os.path.join(dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/manifest.json")
    def get_manifest():
        return FileResponse(
            os.path.join(dist_path, "manifest.json"),
            media_type="application/manifest+json"
        )

    @app.get("/sw.js")
    def get_sw():
        return FileResponse(
            os.path.join(dist_path, "sw.js"),
            media_type="application/javascript",
            headers={"Service-Worker-Allowed": "/"}
        )

    @app.get("/favicon.svg")
    def get_favicon():
        return FileResponse(os.path.join(dist_path, "favicon.svg"), media_type="image/svg+xml")

    @app.get("/icon-192.png")
    def get_icon_192():
        return FileResponse(os.path.join(dist_path, "icon-192.png"), media_type="image/png")

    @app.get("/icon-512.png")
    def get_icon_512():
        return FileResponse(os.path.join(dist_path, "icon-512.png"), media_type="image/png")

    @app.get("/apple-touch-icon.png")
    def get_apple_icon():
        return FileResponse(os.path.join(dist_path, "apple-touch-icon.png"), media_type="image/png")

    # Serve index.html for SPA frontend routing
    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/") or full_path == "docs" or full_path == "openapi.json":
            return {"error": "Not Found"}
        file_path = os.path.join(dist_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_path, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "app": "InvestSmart",
            "description": "Installable Mobile-First Investment Web Application (PWA) Backend",
            "version": settings.VERSION,
            "docs_url": "/docs",
            "health": "OK"
        }
