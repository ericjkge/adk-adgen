#!/usr/bin/env python3
"""
Simplified ADK AdGen Web Server
This provides a working API for the frontend while we work on the full ADK integration
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import asyncio
import json
import uuid
from datetime import datetime

app = FastAPI(title="ADK AdGen API (Simplified)", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
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

# In-memory storage for sessions
sessions: Dict[str, Dict[str, Any]] = {}

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

@app.get("/")
async def root():
    return {"message": "ADK AdGen API is running!", "status": "simplified_mode"}

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(session_id)

@app.post("/api/start-generation", response_model=GenerationResponse)
async def start_generation(request: VideoGenerationRequest):
    """Start the video generation process (simplified simulation)"""
    session_id = str(uuid.uuid4())
    
    # Initialize session
    sessions[session_id] = {
        "status": "started",
        "step": "extraction",
        "product_url": request.product_url,
        "avatar_id": request.avatar_id,
        "voice_id": request.voice_id,
        "width": request.width,
        "height": request.height,
        "created_at": datetime.now().isoformat(),
        "awaiting_feedback": False
    }
    
    # Start the simulation in background
    asyncio.create_task(simulate_generation_pipeline(session_id))
    
    return GenerationResponse(
        session_id=session_id,
        status="started",
        message="Video generation started (simulation mode)"
    )

@app.get("/api/session/{session_id}", response_model=GenerationResponse)
async def get_session_status(session_id: str):
    """Get current session status"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    return GenerationResponse(
        session_id=session_id,
        status=session["status"],
        message=f"Current step: {session['step']}",
        data=session
    )

@app.post("/api/script-feedback", response_model=GenerationResponse)
async def submit_script_feedback(feedback: ScriptFeedback):
    """Submit feedback for script revision"""
    if feedback.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[feedback.session_id]
    if not session.get("awaiting_feedback"):
        raise HTTPException(status_code=400, detail="Session not awaiting feedback")
    
    session["feedback"] = feedback.feedback
    session["awaiting_feedback"] = False
    session["status"] = "processing_feedback"
    
    # Continue the simulation with feedback
    asyncio.create_task(continue_simulation_with_feedback(feedback.session_id))
    
    return GenerationResponse(
        session_id=feedback.session_id,
        status="processing_feedback",
        message="Feedback received, updating script..."
    )

async def simulate_generation_pipeline(session_id: str):
    """Simulate the complete generation pipeline"""
    try:
        session = sessions[session_id]
        
        # Step 1: Extraction
        await update_session_status(session_id, "extraction", "Extracting product metadata...")
        await asyncio.sleep(2)
        
        # Step 2: Market Analysis
        await update_session_status(session_id, "market_analysis", "Performing market research...")
        await asyncio.sleep(3)
        
        # Step 3: Script Generation
        await update_session_status(session_id, "script_generation", "Generating ad script...")
        await asyncio.sleep(2)
        
        # Simulate script generation
        sample_script = {
            "audio_script": "Hey everyone! I've been using this amazing product and it's completely changed my daily routine. The quality is incredible and the results speak for themselves. You definitely need to check this out - link in my bio!",
            "video_script": "Close-up shot of the product on a clean white background. Slow zoom in on key features. Rotate the product to show different angles. Cut to product in use, highlighting main benefits."
        }
        
        session["script"] = sample_script
        session["awaiting_feedback"] = True
        session["status"] = "awaiting_feedback"
        
        await manager.send_update(session_id, {
            "status": "awaiting_feedback",
            "step": "script_review",
            "message": "Script generated. Please review and provide feedback.",
            "script": sample_script
        })
        
    except Exception as e:
        await update_session_status(session_id, "error", f"Simulation error: {str(e)}")

async def continue_simulation_with_feedback(session_id: str):
    """Continue simulation after feedback"""
    try:
        session = sessions[session_id]
        
        # Step 4: Video Generation
        await update_session_status(session_id, "video_generation", "Generating video content...")
        await asyncio.sleep(4)
        
        # Step 5: Processing
        await update_session_status(session_id, "processing", "Finalizing video...")
        await asyncio.sleep(2)
        
        # Complete
        session["status"] = "completed"
        session["final_video"] = "https://example.com/sample-video.mp4"  # Placeholder
        
        await manager.send_update(session_id, {
            "status": "completed",
            "step": "finished",
            "message": "Video generation completed! (This is a simulation)",
            "video_url": session["final_video"]
        })
        
    except Exception as e:
        await update_session_status(session_id, "error", f"Simulation error: {str(e)}")

async def update_session_status(session_id: str, step: str, message: str):
    """Update session status and notify via WebSocket"""
    if session_id in sessions:
        sessions[session_id]["step"] = step
        sessions[session_id]["status"] = "processing"
        
        await manager.send_update(session_id, {
            "status": "processing",
            "step": step,
            "message": message
        })

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting ADK AdGen Simplified Web Server...")
    print("📡 Server will be available at: http://localhost:8001")
    print("📖 API Documentation at: http://localhost:8001/docs")
    print("⚠️  Running in SIMULATION mode - real ADK integration pending")
    print("⏹️  Press Ctrl+C to stop the server")
    
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False) 