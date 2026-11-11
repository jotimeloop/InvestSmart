import os
import sys
import subprocess
import uvicorn

def main():
    print("=" * 60)
    print("  InvestSmart - Mobile-First Investment PWA Server")
    print("=" * 60)
    
    # Check if frontend is built
    dist_dir = os.path.join(os.path.dirname(__file__), "frontend", "dist")
    if not os.path.exists(dist_dir):
        print("[*] Building frontend PWA assets...")
        subprocess.run(["npm", "run", "build"], cwd=os.path.join(os.path.dirname(__file__), "frontend"), shell=True)
    
    print("[+] Starting InvestSmart Unified PWA Server on http://localhost:8000")
    print("[+] Open your browser or mobile device to test installation")
    print("[+] Press Ctrl+C to stop server")
    print("=" * 60)
    
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
    from app.main import app
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

if __name__ == "__main__":
    main()

