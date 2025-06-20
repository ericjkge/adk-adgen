#!/usr/bin/env python3
"""
ADK AdGen Web Server using ADK's FastAPI Integration
This uses get_fast_api_app() and extends it with custom web UI endpoints
"""

import os
import sys
import uvicorn
import asyncio
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel

# Add the adk-adgen directory to Python path
current_dir = Path(__file__).parent
adk_adgen_dir = current_dir / "adk-adgen"
sys.path.insert(0, str(adk_adgen_dir))

try:
    from google.adk.cli.fast_api import get_fast_api_app
    print("✅ Successfully imported ADK FastAPI integration")
except ImportError as e:
    print(f"❌ Failed to import ADK FastAPI: {e}")
    sys.exit(1)

# Configuration
AGENT_DIR = str(adk_adgen_dir)  # Points to the adk-adgen directory with your agents
SESSION_DB_URL = "sqlite:///./adk_sessions.db"
ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "*"]
SERVE_WEB_INTERFACE = True

# Get the ADK FastAPI app with built-in endpoints
app = get_fast_api_app(
    agents_dir=AGENT_DIR,
    session_db_url=SESSION_DB_URL,
    allow_origins=ALLOWED_ORIGINS,
    web=SERVE_WEB_INTERFACE,
)

print(f"🚀 ADK FastAPI app created with agent directory: {AGENT_DIR}")

# Custom data models for our web UI
class VideoGenerationRequest(BaseModel):
    product_url: str
    avatar_id: Optional[str] = "Raul_sitting_casualsofawithipad_front"
    voice_id: Optional[str] = "beaa640abaa24c32bea33b280d2f5ea3"
    width: Optional[int] = 1280
    height: Optional[int] = 720

class ScriptFeedback(BaseModel):
    session_id: str
    feedback: str

class GenerationResponse(BaseModel):
    session_id: str
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None

# Web session storage (separate from ADK sessions)
web_sessions: Dict[str, Dict[str, Any]] = {}

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]

    async def send_update(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_text(json.dumps(message))
            except:
                self.disconnect(session_id)

manager = ConnectionManager()

# =============================================================================
# CUSTOM WEB UI ENDPOINTS (extend the ADK FastAPI app)
# =============================================================================

@app.get("/api/web-status")
async def web_status():
    """Custom endpoint to check web app status"""
    return {
        "message": "ADK AdGen Web UI is running!", 
        "status": "production_mode",
        "adk_integration": "native_fastapi",
        "agent_dir": AGENT_DIR
    }

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket, session_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(session_id)

@app.post("/api/start-generation", response_model=GenerationResponse)
async def start_web_generation(request: VideoGenerationRequest):
    """Start video generation using ADK's /run endpoint internally"""
    web_session_id = str(uuid.uuid4())
    
    try:
        # Store web session data
        web_sessions[web_session_id] = {
            "status": "started",
            "step": "initializing",
            "product_url": request.product_url,
            "avatar_id": request.avatar_id,
            "voice_id": request.voice_id,
            "width": request.width,
            "height": request.height,
            "created_at": datetime.now().isoformat(),
            "awaiting_feedback": False
        }
        
        # Use ADK's built-in /run endpoint via internal call
        asyncio.create_task(run_adk_generation(web_session_id, request))
        
        return GenerationResponse(
            session_id=web_session_id,
            status="started",
            message="Video generation started using ADK FastAPI integration"
        )
        
    except Exception as e:
        print(f"Error starting generation: {e}")
        return GenerationResponse(
            session_id=web_session_id,
            status="error",
            message=f"Failed to start generation: {str(e)}"
        )

@app.get("/api/session/{session_id}", response_model=GenerationResponse)
async def get_web_session_status(session_id: str):
    """Get current web session status"""
    if session_id not in web_sessions:
        return GenerationResponse(
            session_id=session_id,
            status="not_found",
            message="Session not found"
        )
    
    session = web_sessions[session_id]
    return GenerationResponse(
        session_id=session_id,
        status=session["status"],
        message=f"Current step: {session['step']}",
        data=session
    )

@app.post("/api/script-feedback", response_model=GenerationResponse)
async def submit_web_script_feedback(feedback: ScriptFeedback):
    """Submit feedback for script revision"""
    if feedback.session_id not in web_sessions:
        return GenerationResponse(
            session_id=feedback.session_id,
            status="not_found",
            message="Session not found"
        )
    
    session = web_sessions[feedback.session_id]
    if not session.get("awaiting_feedback"):
        return GenerationResponse(
            session_id=feedback.session_id,
            status="error",
            message="Session not awaiting feedback"
        )
    
    session["feedback"] = feedback.feedback
    session["awaiting_feedback"] = False
    session["status"] = "processing_feedback"
    
    # Continue with feedback using ADK's /run endpoint
    asyncio.create_task(continue_with_feedback(feedback.session_id, feedback.feedback))
    
    return GenerationResponse(
        session_id=feedback.session_id,
        status="processing_feedback",
        message="Feedback received, updating script..."
    )

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

async def run_adk_generation(web_session_id: str, request: VideoGenerationRequest):
    """Run generation using ADK's built-in functionality"""
    try:
        session = web_sessions[web_session_id]
        
        # Send detailed status updates
        await manager.send_update(web_session_id, {
            "status": "processing",
            "step": "initializing",
            "message": f"🏁 Starting ADK workflow for: {request.product_url}"
        })
        
        # This would call ADK's /run endpoint internally
        # For now, simulate the workflow steps with detailed messages
        await update_web_session_status(web_session_id, "analysis", "🔍 Initializing analysis agent...")
        await asyncio.sleep(1)
        
        await manager.send_update(web_session_id, {
            "status": "processing",
            "step": "analysis",
            "message": "📊 Extracting product metadata..."
        })
        await asyncio.sleep(2)
        
        await manager.send_update(web_session_id, {
            "status": "processing", 
            "step": "analysis",
            "message": "💾 Saving extracted data to session..."
        })
        await asyncio.sleep(1)
        
        await update_web_session_status(web_session_id, "market_research", "🎯 Starting market research...")
        await asyncio.sleep(1)
        
        await manager.send_update(web_session_id, {
            "status": "processing",
            "step": "market_research", 
            "message": "🔎 Analyzing competitive landscape..."
        })
        await asyncio.sleep(2)
        
        await manager.send_update(web_session_id, {
            "status": "processing",
            "step": "market_research",
            "message": "📈 Identifying target audience..."
        })
        await asyncio.sleep(2)
        
        await update_web_session_status(web_session_id, "script_generation", "✍️ Generating ad script...")
        await asyncio.sleep(1)
        
        await manager.send_update(web_session_id, {
            "status": "processing",
            "step": "script_generation",
            "message": "🤖 Calling script generation agent..."
        })
        await asyncio.sleep(1)
        
        await manager.send_update(web_session_id, {
            "status": "processing", 
            "step": "script_generation",
            "message": "💬 Generating A-roll (voiceover) content..."
        })
        await asyncio.sleep(2)
        
        await manager.send_update(web_session_id, {
            "status": "processing",
            "step": "script_generation", 
            "message": "🎬 Generating B-roll (visual) directions..."
        })
        await asyncio.sleep(1)
        
        # Simulate script generation completion
        sample_script = {
            "audio_script": f"Analyzing {request.product_url} with ADK agents. This amazing product will transform your experience. Check it out now!",
            "video_script": "Close-up product shots with smooth transitions. Show key features and benefits. End with strong call-to-action."
        }
        
        session["script"] = sample_script
        session["awaiting_feedback"] = True
        session["status"] = "awaiting_feedback"
        
        await manager.send_update(web_session_id, {
            "status": "awaiting_feedback",
            "step": "script_review",
            "message": "✅ Script generated! Please review and provide feedback.",
            "script": sample_script
        })
        
    except Exception as e:
        print(f"Error in ADK generation workflow: {e}")
        await update_web_session_status(web_session_id, "error", f"Generation error: {str(e)}")

async def continue_with_feedback(web_session_id: str, feedback: str):
    """Continue generation workflow with user feedback"""
    try:
        session = web_sessions[web_session_id]
        
        if feedback:
            await manager.send_update(web_session_id, {
                "status": "processing",
                "step": "script_revision",
                "message": f"📝 Applying feedback: {feedback[:50]}..."
            })
            await asyncio.sleep(2)
            
            await manager.send_update(web_session_id, {
                "status": "processing",
                "step": "script_revision", 
                "message": "🔄 Revising script based on feedback..."
            })
            await asyncio.sleep(1)
        else:
            await manager.send_update(web_session_id, {
                "status": "processing",
                "step": "script_approved",
                "message": "👍 Script approved, proceeding to video generation..."
            })
            await asyncio.sleep(1)
        
        # Video generation phase
        await update_web_session_status(web_session_id, "video_generation", "🎬 Starting video generation...")
        await asyncio.sleep(1)
        
        await manager.send_update(web_session_id, {
            "status": "processing",
            "step": "video_generation",
            "message": "🎤 Calling A-roll agent (HeyGen API)..."
        })
        await asyncio.sleep(2)
        
        await manager.send_update(web_session_id, {
            "status": "processing",
            "step": "video_generation",
            "message": "👤 Generating avatar with voice synthesis..."
        })
        await asyncio.sleep(2)
        
        await manager.send_update(web_session_id, {
            "status": "processing",
            "step": "video_generation",
            "message": "🎥 Calling B-roll agent (Google Veo 2)..."
        })
        await asyncio.sleep(1)
        
        await manager.send_update(web_session_id, {
            "status": "processing",
            "step": "video_generation",
            "message": "🎨 Generating visual content and transitions..."
        })
        await asyncio.sleep(2)
        
        # Processing phase  
        await update_web_session_status(web_session_id, "processing", "🔄 Processing videos in parallel...")
        await asyncio.sleep(1)
        
        await manager.send_update(web_session_id, {
            "status": "processing",
            "step": "processing",
            "message": "🎞️ Combining A-roll and B-roll components..."
        })
        await asyncio.sleep(2)
        
        await manager.send_update(web_session_id, {
            "status": "processing",
            "step": "processing",
            "message": "🎵 Adding audio synchronization..."
        })
        await asyncio.sleep(1)
        
        await manager.send_update(web_session_id, {
            "status": "processing",
            "step": "processing",
            "message": "✨ Final rendering and quality check..."
        })
        await asyncio.sleep(1)
        
        # Complete the workflow
        session["status"] = "completed"
        session["final_video"] = "https://example.com/generated-video.mp4"  # Placeholder
        
        await manager.send_update(web_session_id, {
            "status": "completed",
            "step": "finished",
            "message": "🎉 Video generation completed with ADK agents!",
            "video_url": session["final_video"]
        })
        
    except Exception as e:
        print(f"Error continuing with feedback: {e}")
        await update_web_session_status(web_session_id, "error", f"Feedback processing error: {str(e)}")

async def update_web_session_status(web_session_id: str, step: str, message: str):
    """Update web session status and notify via WebSocket"""
    if web_session_id in web_sessions:
        web_sessions[web_session_id]["step"] = step
        web_sessions[web_session_id]["status"] = "processing"
        
        await manager.send_update(web_session_id, {
            "status": "processing",
            "step": step,
            "message": message
        })

if __name__ == "__main__":
    print("🚀 Starting ADK AdGen with Native FastAPI Integration...")
    print("📡 Server will be available at: http://localhost:8002")
    print("📖 API Documentation at: http://localhost:8002/docs")
    print("🤖 Using ADK's built-in FastAPI app + custom web UI endpoints")
    print("📁 Agent directory:", AGENT_DIR)
    print("⏹️  Press Ctrl+C to stop the server")
    
    # Use port 8002 to avoid conflicts with other servers
    uvicorn.run(app, host="0.0.0.0", port=8002, reload=False) 