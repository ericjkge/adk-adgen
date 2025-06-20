#!/usr/bin/env python3
"""
Startup script for ADK AdGen Web Application
"""
import subprocess
import sys
import os
import time
from pathlib import Path

def run_command(command, cwd=None, background=False):
    """Run a command with optional background execution"""
    print(f"Running: {command}")
    if background:
        return subprocess.Popen(command, shell=True, cwd=cwd)
    else:
        return subprocess.run(command, shell=True, cwd=cwd)

def main():
    print("🚀 Starting ADK AdGen Web Application...")
    
    # Check if we're in the right directory
    if not Path("adk-adgen").exists() or not Path("frontend").exists():
        print("❌ Error: Please run this script from the root directory containing 'adk-adgen' and 'frontend' folders")
        sys.exit(1)
    
    # Install backend dependencies
    print("\n📦 Installing backend dependencies...")
    run_command("pip install -r adk-adgen/requirements-web.txt")
    
    # Install frontend dependencies
    print("\n📦 Installing frontend dependencies...")
    run_command("npm install", cwd="frontend")
    
    print("\n🔧 Starting services...")
    
    # Start backend server in background
    print("Starting FastAPI backend on http://localhost:8000")
    backend_process = run_command(
        "python -m uvicorn adk_adgen.web_server:app --host 0.0.0.0 --port 8000 --reload",
        background=True
    )
    
    # Wait a moment for backend to start
    time.sleep(3)
    
    # Start frontend server in background
    print("Starting Next.js frontend on http://localhost:3000")
    frontend_process = run_command(
        "npm run dev",
        cwd="frontend",
        background=True
    )
    
    print("\n✅ Both services are starting up...")
    print("🌐 Frontend: http://localhost:3000")
    print("📡 Backend API: http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs")
    print("\n⏹️  Press Ctrl+C to stop both services")
    
    try:
        # Wait for both processes
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping services...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ Services stopped")

if __name__ == "__main__":
    main() 