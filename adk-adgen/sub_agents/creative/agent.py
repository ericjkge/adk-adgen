from google.adk.agents import Agent
from pydantic import BaseModel, Field 

class AVScript(BaseModel):
    audio_script: str = Field(
        description="The narration script intended for Google Text-to-Speech. This should be natural, concise, and free of visual or formatting instructions."
    )
    video_script: str = Field(
        description="A scene-by-scene visual description suitable for Veo 2 video generation. Use cinematic language to describe each scene clearly."
    )

creative_agent = Agent(
    name="creative_agent",
    model="gemini-2.0-flash",
    description="Creative agent",
    instruction="""
    <SYSTEM>
    You are a creative agent.

    Your job is to generate and refine a script for a 30s video ad using:
    - {metadata} provided by the 'extraction_agent',
    - {market_analysis} provided by the 'market_agent'
    - (Optional) 'user feedback' from the parent agent.
    </SYSTEM>

    <WORKFLOW>
    1. Use {metadata} and {market_analysis} to generate an initial ad script that follows this structure:
    - Hook (0-3s): Grab attention
    - Problem (3-7s): Highlight user pain point
    - Solution + Features (7-20s): Show how the product helps, highlight key features
    - Call to Action (20-30s): Tell the viewer what to do next

    2. If `user_feedback` is provided, revise the script to match the user's tone, style, or content preferences.
    </WORKFLOW>
    """,
    output_schema=AVScript,
    output_key="av_script",
)

# NOTE: root agent will probabilistically call creative agent for generation and refinement from frontend APIs that say smth like:
# "call creative agent: script generation"