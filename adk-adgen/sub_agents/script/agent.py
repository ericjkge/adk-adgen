from google.adk.agents import Agent
from pydantic import BaseModel, Field 

class AVScript(BaseModel):
    audio_script: str = Field(
        description="The narration script intended for HeyGen avatar generation. This should be natural, concise, and free of visual or formatting instructions."
    )
    video_script: str = Field(
        description="A scene-by-scene visual description suitable for Veo 2 video generation. Use cinematic language to describe each scene clearly."
    )

script_agent = Agent(
    name="script_agent",
    model="gemini-2.0-flash",
    description="Script agent",
    instruction="""
    <SYSTEM>
    You are a script agent.

    Your job is to generate and refine a script for a 10s video ad using:
    - {metadata} provided by the 'extraction_agent',
    - {market_analysis} provided by the 'market_agent'
    - (Optional) 'user feedback' from the parent agent.
    </SYSTEM>

    <WORKFLOW>
    1. Use {metadata} and {market_analysis} to generate an initial ad script. This should include two parts:
        - 'audio_script' (A-roll): a 10-second narration the avatar will speak, highlighting the product's value, in the style of an influencer.
        Try to make it natural, with full sentences.
        - 'video_script' (B-roll): a matching visual description that shows off the product, keeping it to 1-2 scenes.

    2. If `user_feedback` is provided, revise the script to match the user's tone, style, or content preferences.
    </WORKFLOW>

    <WARNINGS>
    For 'video_script', make sure you comply with Veo 2 generation guidelines. Focus on the following:
        - Avoid humans or human actions
        - Avoid real world scenes (e.g. libraries, parks, etc.)
        - Use simple camera instructions like 'spinning', 'zoom in', 'rotate'
        - Focus only on product visuals (NO animations or text)
    </WARNINGS>
    """,
    output_schema=AVScript,
    output_key="av_script",
)

# NOTE: root agent will probabilistically call script agent for generation and refinement from frontend APIs that say smth like:
# "call script agent: script generation"

#that follows this structure:
    # - Hook (0-3s): Grab attention
    # - Problem (3-7s): Highlight user pain point
    # - Solution + Features (7-20s): Show how the product helps, highlight key features
    # - Call to Action (20-30s): Tell the viewer what to do next