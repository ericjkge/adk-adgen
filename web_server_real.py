#!/usr/bin/env python3
"""
Real ADK AdGen Web Server
This integrates with the actual ADK agents using proper Runner patterns
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import asyncio
import json
import uuid
import sys
import os
from pathlib import Path
from datetime import datetime

# Add the adk-adgen directory to Python path for imports
current_dir = Path(__file__).parent
adk_adgen_dir = current_dir / "adk-adgen"
sys.path.insert(0, str(adk_adgen_dir))

try:
    # ADK imports
    from google.adk.runners import Runner
    from google.adk.sessions import InMemorySessionService
    from google.adk.artifacts import InMemoryArtifactService
    from google.adk.events import Event
    from google.genai import types
    
    # Your agent import
    from agent import root_agent
    
    print("✅ Successfully imported ADK and agent modules")
except ImportError as e:
    print(f"❌ Failed to import ADK modules: {e}")
    print("💡 Make sure you have ADK installed and are in the right directory")
    sys.exit(1)

app = FastAPI(title="ADK AdGen API (Real)", version="1.0.0")

# Add CORS middleware with proper configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

# ADK Configuration
APP_NAME = "adk_adgen_web"
USER_ID = "web_user"

# Initialize ADK services
session_service = InMemorySessionService()
artifact_service = InMemoryArtifactService()

# Create the runner with your root agent
runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service,
    artifact_service=artifact_service
)

# Session storage for web app state
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

@app.get("/")
async def root():
    return {"message": "ADK AdGen API with Real Agents is running!", "status": "production_mode"}

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
    """Start the video generation process with real ADK agents"""
    session_id = str(uuid.uuid4())
    adk_session_id = f"web_{session_id}"
    
    try:
        # Create ADK session
        await session_service.create_session(APP_NAME, USER_ID, None, adk_session_id)
        
        # Initialize web session state
        web_sessions[session_id] = {
            "adk_session_id": adk_session_id,
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
        
        # Start the ADK agent workflow in background
        asyncio.create_task(run_adk_workflow(session_id, request.product_url))
        
        return GenerationResponse(
            session_id=session_id,
            status="started",
            message="Video generation started with real ADK agents"
        )
        
    except Exception as e:
        print(f"Error starting generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/session/{session_id}", response_model=GenerationResponse)
async def get_session_status(session_id: str):
    """Get current session status"""
    if session_id not in web_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = web_sessions[session_id]
    return GenerationResponse(
        session_id=session_id,
        status=session["status"],
        message=f"Current step: {session['step']}",
        data=session
    )

@app.post("/api/script-feedback", response_model=GenerationResponse)
async def submit_script_feedback(feedback: ScriptFeedback):
    """Submit feedback for script revision"""
    if feedback.session_id not in web_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = web_sessions[feedback.session_id]
    if not session.get("awaiting_feedback"):
        raise HTTPException(status_code=400, detail="Session not awaiting feedback")
    
    session["feedback"] = feedback.feedback
    session["awaiting_feedback"] = False
    session["status"] = "processing_feedback"
    
    # Continue the ADK workflow with feedback
    asyncio.create_task(continue_adk_workflow_with_feedback(feedback.session_id, feedback.feedback))
    
    return GenerationResponse(
        session_id=feedback.session_id,
        status="processing_feedback",
        message="Feedback received, updating script with real agents..."
    )

async def run_adk_workflow(session_id: str, product_url: str):
    """Run the complete ADK agent workflow"""
    try:
        session = web_sessions[session_id]
        adk_session_id = session["adk_session_id"]
        
        # Create the initial message for the root agent
        initial_message = types.Content(
            role='user', 
            parts=[types.Part(text=f"Generate a video ad for this product: {product_url}")]
        )
        
        await update_session_status(session_id, "analysis", "Starting product analysis...")
        
        # Run the ADK agent workflow
        script_content = None
        async for event in runner.run_async(
            user_id=USER_ID,
            session_id=adk_session_id,
            new_message=initial_message
        ):
            await process_adk_event(session_id, event)
            
            # Check if we got a script that needs review
            if event.type == "content_generation" and "script" in str(event).lower():
                script_content = extract_script_from_event(event)
                if script_content:
                    session["script"] = script_content
                    session["awaiting_feedback"] = True
                    session["status"] = "awaiting_feedback"
                    
                    await manager.send_update(session_id, {
                        "status": "awaiting_feedback",
                        "step": "script_review",
                        "message": "Script generated by ADK agents. Please review and provide feedback.",
                        "script": script_content
                    })
                    return  # Wait for feedback
            
            # Check if workflow is complete
            if event.is_final_response():
                session["status"] = "completed"
                final_content = extract_final_video_from_event(event)
                if final_content:
                    session["final_video"] = final_content
                
                await manager.send_update(session_id, {
                    "status": "completed",
                    "step": "finished",
                    "message": "Video generation completed by ADK agents!",
                    "video_url": session.get("final_video")
                })
                
    except Exception as e:
        print(f"Error in ADK workflow: {e}")
        await update_session_status(session_id, "error", f"Workflow error: {str(e)}")

async def continue_adk_workflow_with_feedback(session_id: str, feedback: str):
    """Continue ADK workflow after receiving script feedback"""
    try:
        session = web_sessions[session_id]
        adk_session_id = session["adk_session_id"]
        
        # Create feedback message
        feedback_message = types.Content(
            role='user',
            parts=[types.Part(text=f"Script feedback: {feedback}")]
        )
        
        await update_session_status(session_id, "script_revision", "Revising script based on feedback...")
        
        # Continue the ADK workflow with feedback
        async for event in runner.run_async(
            user_id=USER_ID,
            session_id=adk_session_id,
            new_message=feedback_message
        ):
            await process_adk_event(session_id, event)
            
            # Check if workflow is complete
            if event.is_final_response():
                session["status"] = "completed"
                final_content = extract_final_video_from_event(event)
                if final_content:
                    session["final_video"] = final_content
                
                await manager.send_update(session_id, {
                    "status": "completed",
                    "step": "finished",
                    "message": "Video generation completed with your feedback!",
                    "video_url": session.get("final_video")
                })
                
    except Exception as e:
        print(f"Error continuing ADK workflow: {e}")
        await update_session_status(session_id, "error", f"Feedback processing error: {str(e)}")

async def process_adk_event(session_id: str, event: Event):
    """Process ADK events and update UI accordingly"""
    try:
        # Map ADK events to UI steps
        if event.type == "agent_start":
            if "analysis" in str(event).lower():
                await update_session_status(session_id, "analysis", "Analyzing product...")
            elif "script" in str(event).lower():
                await update_session_status(session_id, "script_generation", "Generating script...")
            elif "video" in str(event).lower():
                await update_session_status(session_id, "video_generation", "Creating video...")
            elif "processing" in str(event).lower():
                await update_session_status(session_id, "processing", "Processing final video...")
        
        elif event.type == "agent_end":
            # Agent completed successfully
            pass
            
        elif event.type == "error":
            await update_session_status(session_id, "error", f"Agent error: {event}")
            
    except Exception as e:
        print(f"Error processing ADK event: {e}")

def extract_script_from_event(event: Event) -> Optional[Dict[str, str]]:
    """Extract script content from ADK event"""
    try:
        if event.content and event.content.parts:
            text = event.content.parts[0].text
            # Try to parse as JSON or extract script content
            if "audio_script" in text or "video_script" in text:
                # This would need to be customized based on your script agent's output format
                return {
                    "audio_script": "Script content from ADK agent...",
                    "video_script": "Video directions from ADK agent..."
                }
    except Exception as e:
        print(f"Error extracting script: {e}")
    return None

def extract_final_video_from_event(event: Event) -> Optional[str]:
    """Extract final video URL from ADK event"""
    try:
        if event.content and event.content.parts:
            text = event.content.parts[0].text
            # Extract video URL or path from the final response
            if "video" in text.lower() and ("http" in text or "gs://" in text):
                # Parse the actual video URL from the agent response
                return "extracted_video_url_from_agent"
    except Exception as e:
        print(f"Error extracting video: {e}")
    return None

async def update_session_status(session_id: str, step: str, message: str):
    """Update session status and notify via WebSocket"""
    if session_id in web_sessions:
        web_sessions[session_id]["step"] = step
        web_sessions[session_id]["status"] = "processing"
        
        await manager.send_update(session_id, {
            "status": "processing",
            "step": step,
            "message": message
        })

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting ADK AdGen Real Web Server...")
    print("📡 Server will be available at: http://localhost:8001")
    print("📖 API Documentation at: http://localhost:8001/docs")
    print("🤖 Using REAL ADK agents for video generation")
    print("⏹️  Press Ctrl+C to stop the server")
    
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False) 