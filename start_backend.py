#!/usr/bin/env python3
"""
Startup script for ADK AdGen Backend Server
This script properly handles the Python path and starts the FastAPI server
"""

import sys
import os
from pathlib import Path

# Add the adk-adgen directory to Python path
current_dir = Path(__file__).parent
adk_adgen_dir = current_dir / "adk-adgen"
sys.path.insert(0, str(adk_adgen_dir))

# Now import and start the server
try:
    import uvicorn
    from web_server import app
    
    print("🚀 Starting ADK AdGen Backend Server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📖 API Documentation at: http://localhost:8000/docs")
    print("⏹️  Press Ctrl+C to stop the server")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
    
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("💡 Make sure you have installed the required dependencies:")
    print("   pip install fastapi uvicorn websockets python-multipart pydantic python-dotenv")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error starting server: {e}")
    sys.exit(1) 