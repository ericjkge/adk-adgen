from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import asyncio
import json
from datetime import datetime
import uuid

# Import your existing ADK agent and integration helper
from agent import root_agent
from adk_integration import adk_runner

app = FastAPI(title="ADK AdGen API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
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

# In-memory storage for session states (use Redis in production)
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

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(session_id)

@app.post("/api/start-generation", response_model=GenerationResponse)
async def start_generation(request: VideoGenerationRequest):
    """Start the video generation process"""
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
        "metadata": None,
        "market_analysis": None,
        "script": None,
        "awaiting_feedback": False
    }
    
    # Start the generation process in background
    asyncio.create_task(run_generation_pipeline(session_id))
    
    return GenerationResponse(
        session_id=session_id,
        status="started",
        message="Video generation started"
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
    
    # Continue the pipeline with feedback
    asyncio.create_task(continue_with_feedback(feedback.session_id))
    
    return GenerationResponse(
        session_id=feedback.session_id,
        status="processing_feedback",
        message="Feedback received, updating script..."
    )

async def run_generation_pipeline(session_id: str):
    """Run the complete generation pipeline using ADK"""
    try:
        session = sessions[session_id]
        
        # Prepare data for the full pipeline
        pipeline_data = {
            "product_url": session["product_url"],
            "avatar_id": session["avatar_id"],
            "voice_id": session["voice_id"],
            "width": session["width"],
            "height": session["height"]
        }
        
        # Step 1: Start analysis
        await update_session_status(session_id, "extraction", "Starting product analysis...")
        
        # Run analysis first to get script
        analysis_result = await call_agent_async("analysis_agent", {
            "product_url": session["product_url"]
        })
        
        if not analysis_result.get("success"):
            raise Exception(f"Analysis failed: {analysis_result.get('error')}")
        
        session["metadata"] = analysis_result.get("metadata")
        session["market_analysis"] = analysis_result.get("market_analysis")
        
        # Step 2: Script Generation
        await update_session_status(session_id, "script_generation", "Generating ad script...")
        
        script_result = await call_agent_async("script_agent", {
            "metadata": session["metadata"],
            "market_analysis": session["market_analysis"]
        })
        
        if not script_result.get("success"):
            raise Exception(f"Script generation failed: {script_result.get('error')}")
        
        session["script"] = script_result.get("av_script")
        session["awaiting_feedback"] = True
        session["status"] = "awaiting_feedback"
        
        await manager.send_update(session_id, {
            "status": "awaiting_feedback",
            "step": "script_review",
            "message": "Script generated. Please review and provide feedback.",
            "script": session["script"]
        })
        
        # Wait for feedback (pipeline will continue via feedback endpoint)
        
    except Exception as e:
        await update_session_status(session_id, "error", f"Error: {str(e)}")

async def continue_with_feedback(session_id: str):
    """Continue pipeline after receiving feedback"""
    try:
        session = sessions[session_id]
        
        # Regenerate script with feedback if provided
        if session.get("feedback"):
            await update_session_status(session_id, "script_revision", "Revising script with feedback...")
            
            script_result = await call_agent_async("script_agent", {
                "metadata": session["metadata"],
                "market_analysis": session["market_analysis"],
                "user_feedback": session["feedback"]
            })
            
            session["script"] = script_result.get("av_script")
        
        # Step 3: Video Generation (A-roll + B-roll in parallel)
        await update_session_status(session_id, "video_generation", "Generating video content...")
        
        # Set state for video generation
        video_state = {
            "avatar_id": session["avatar_id"],
            "voice_id": session["voice_id"],
            "width": session["width"],
            "height": session["height"],
            "av_script": session["script"],
            "base64_image": session["metadata"].get("image_url")  # You may need to convert this
        }
        
        video_result = await call_agent_async("video_agent", video_state)
        
        # Step 4: Post-processing
        await update_session_status(session_id, "processing", "Finalizing video...")
        
        final_result = await call_agent_async("processing_agent", {})
        
        # Complete
        session["status"] = "completed"
        session["final_video"] = final_result.get("video_url")
        
        await manager.send_update(session_id, {
            "status": "completed",
            "step": "finished",
            "message": "Video generation completed!",
            "video_url": session["final_video"]
        })
        
    except Exception as e:
        await update_session_status(session_id, "error", f"Error: {str(e)}")

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

async def run_full_pipeline_async(data: Dict[str, Any]) -> Dict[str, Any]:
    """Run the complete ADK pipeline using the new integration"""
    try:
        result = await adk_runner.run_full_pipeline(
            product_url=data.get("product_url", ""),
            avatar_id=data.get("avatar_id", "Raul_sitting_casualsofawithipad_front"),
            voice_id=data.get("voice_id", "beaa640abaa24c32bea33b280d2f5ea3"),
            width=data.get("width", 1280),
            height=data.get("height", 720),
            user_feedback=data.get("user_feedback")
        )
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

async def call_agent_async(agent_name: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Call individual ADK agents asynchronously (fallback method)"""
    try:
        if agent_name == "analysis_agent":
            return await adk_runner.call_analysis_agent(data.get("product_url", ""))
        elif agent_name == "script_agent":
            return await adk_runner.call_script_agent(
                data.get("metadata", {}), 
                data.get("market_analysis", {}),
                data.get("user_feedback")
            )
        elif agent_name == "video_agent":
            video_state = {
                "avatar_id": data.get("avatar_id", ""),
                "voice_id": data.get("voice_id", ""),
                "width": data.get("width", 1280),
                "height": data.get("height", 720),
                "base64_image": data.get("base64_image", "")
            }
            return await adk_runner.call_video_agent(data.get("av_script", {}), video_state)
        elif agent_name == "processing_agent":
            return await adk_runner.call_processing_agent(data.get("session_id", ""))
        else:
            return {"success": False, "error": f"Unknown agent: {agent_name}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 