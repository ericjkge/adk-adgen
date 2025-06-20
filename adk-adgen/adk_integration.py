"""
ADK Integration helper for programmatic agent calls
"""
import asyncio
import uuid
from typing import Dict, Any, Optional, AsyncGenerator
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.artifacts import InMemoryArtifactService
from google.adk.events import Event
from google.genai import types
from agent import root_agent

class ADKAgentRunner:
    """Helper class to run ADK agents programmatically"""
    
    def __init__(self):
        # Initialize services
        self.session_service = InMemorySessionService()
        self.artifact_service = InMemoryArtifactService()
        
        # Initialize runner with root agent
        self.runner = Runner(
            agent=root_agent,
            app_name="adk_adgen_web",
            session_service=self.session_service,
            artifact_service=self.artifact_service
        )
    
    async def run_full_pipeline(self, product_url: str, avatar_id: str, voice_id: str, 
                               width: int = 1280, height: int = 720, 
                               user_feedback: Optional[str] = None) -> Dict[str, Any]:
        """
        Run the complete ADK pipeline from product URL to final video
        """
        try:
            # Create a session for this pipeline run
            session_id = str(uuid.uuid4())
            user_id = "web_user"
            
            session = await self.session_service.create_session(
                app_name="adk_adgen_web",
                user_id=user_id,
                session_id=session_id
            )
            
            # Set initial state for the pipeline
            await self._update_session_state(session, {
                "product_url": product_url,
                "avatar_id": avatar_id,
                "voice_id": voice_id,
                "width": width,
                "height": height,
                "user_feedback": user_feedback
            })
            
            # Create initial message
            initial_message = types.Content(
                role="user",
                parts=[types.Part(text=f"Generate a video ad for this product: {product_url}")]
            )
            
            # Run the agent
            final_result = {}
            
            events_async = self.runner.run_async(
                session_id=session_id,
                user_id=user_id,
                new_message=initial_message
            )
            
            # Process events
            async for event in events_async:
                result = await self._process_event(event, session, user_feedback)
                if result:
                    final_result.update(result)
            
            return {
                "success": True,
                "session_id": session_id,
                "result": final_result
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def call_analysis_agent(self, product_url: str) -> Dict[str, Any]:
        """Call the analysis agent with a product URL"""
        try:
            session_id = str(uuid.uuid4())
            user_id = "web_user"
            
            session = await self.session_service.create_session(
                app_name="adk_adgen_web",
                user_id=user_id,
                session_id=session_id
            )
            
            # Set the product URL in session state
            await self._update_session_state(session, {"product_url": product_url})
            
            # Create message to trigger analysis
            message = types.Content(
                role="user",
                parts=[types.Part(text=f"Analyze this product: {product_url}")]
            )
            
            result = {}
            events_async = self.runner.run_async(
                session_id=session_id,
                user_id=user_id,
                new_message=message
            )
            
            async for event in events_async:
                # Extract analysis results from events
                if hasattr(event, 'data') and event.data:
                    if 'metadata' in event.data:
                        result['metadata'] = event.data['metadata']
                    if 'market_analysis' in event.data:
                        result['market_analysis'] = event.data['market_analysis']
            
            return {
                "success": True,
                "metadata": result.get('metadata'),
                "market_analysis": result.get('market_analysis')
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def call_script_agent(self, metadata: Dict, market_analysis: Dict, 
                               user_feedback: Optional[str] = None) -> Dict[str, Any]:
        """Call the script agent with metadata and market analysis"""
        try:
            session_id = str(uuid.uuid4())
            user_id = "web_user"
            
            session = await self.session_service.create_session(
                app_name="adk_adgen_web",
                user_id=user_id,
                session_id=session_id
            )
            
            # Set state for script generation
            state_data = {
                "metadata": metadata,
                "market_analysis": market_analysis
            }
            if user_feedback:
                state_data["user_feedback"] = user_feedback
            
            await self._update_session_state(session, state_data)
            
            # Create message to trigger script generation
            message_text = "Generate an ad script"
            if user_feedback:
                message_text += f" with this feedback: {user_feedback}"
                
            message = types.Content(
                role="user",
                parts=[types.Part(text=message_text)]
            )
            
            result = {}
            events_async = self.runner.run_async(
                session_id=session_id,
                user_id=user_id,
                new_message=message
            )
            
            async for event in events_async:
                # Extract script from events
                if hasattr(event, 'data') and event.data and 'av_script' in event.data:
                    result['av_script'] = event.data['av_script']
            
            return {
                "success": True,
                "av_script": result.get('av_script')
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def call_video_agent(self, av_script: Dict, video_state: Dict) -> Dict[str, Any]:
        """Call the video agent to generate A-roll and B-roll"""
        try:
            session_id = str(uuid.uuid4())
            user_id = "web_user"
            
            session = await self.session_service.create_session(
                app_name="adk_adgen_web",
                user_id=user_id,
                session_id=session_id
            )
            
            # Set state for video generation
            state_data = {
                "av_script": av_script,
                **video_state
            }
            
            await self._update_session_state(session, state_data)
            
            # Create message to trigger video generation
            message = types.Content(
                role="user",
                parts=[types.Part(text="Generate video content")]
            )
            
            result = {}
            events_async = self.runner.run_async(
                session_id=session_id,
                user_id=user_id,
                new_message=message
            )
            
            async for event in events_async:
                # Process video generation results
                if hasattr(event, 'data') and event.data:
                    result.update(event.data)
            
            return {
                "success": True,
                "result": result
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def call_processing_agent(self, session_id: str) -> Dict[str, Any]:
        """Call the processing agent for final video assembly"""
        try:
            # Create message to trigger processing
            message = types.Content(
                role="user",
                parts=[types.Part(text="Process and finalize the video")]
            )
            
            result = {}
            events_async = self.runner.run_async(
                session_id=session_id,
                user_id="web_user",
                new_message=message
            )
            
            async for event in events_async:
                # Extract final video URL from events
                if hasattr(event, 'data') and event.data and 'video_url' in event.data:
                    result['video_url'] = event.data['video_url']
            
            return {
                "success": True,
                "video_url": result.get('video_url')
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def _update_session_state(self, session, state_data: Dict[str, Any]):
        """Update session state with new data"""
        for key, value in state_data.items():
            session.state[key] = value
        
        # Create a system event to persist state changes
        system_event = Event(
            author="system",
            content=types.Content(
                role="system",
                parts=[types.Part(text=f"Updated session state: {list(state_data.keys())}")]
            ),
            tool_call_ids=[],
            long_running_tool_ids=[]
        )
        
        await self.session_service.append_event(session, system_event)
    
    async def _process_event(self, event: Event, session, user_feedback: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Process individual events from agent execution"""
        result = {}
        
        # Check if this is a script feedback request
        if (hasattr(event, 'content') and event.content and 
            hasattr(event.content, 'parts') and event.content.parts):
            
            for part in event.content.parts:
                if (hasattr(part, 'function_call') and part.function_call and 
                    part.function_call.name == "script_feedback_request"):
                    
                    # This would be where we handle script feedback in a real implementation
                    # For now, we'll assume feedback is provided via the user_feedback parameter
                    if user_feedback:
                        # Create feedback response
                        feedback_response = types.Content(
                            role="user",
                            parts=[types.Part(
                                function_response=types.FunctionResponse(
                                    id=part.function_call.id,
                                    name="script_feedback_response",
                                    response={"feedback": user_feedback}
                                )
                            )]
                        )
                        result["feedback_required"] = True
                        result["feedback_response"] = feedback_response
        
        # Extract other relevant data from events
        if hasattr(event, 'data') and event.data:
            result.update(event.data)
        
        return result if result else None

# Global instance
adk_runner = ADKAgentRunner() 