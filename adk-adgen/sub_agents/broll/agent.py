from google.adk.agents import Agent
from ...tools.generate_b_roll import generate_b_roll

b_roll_agent = Agent(
    name="broll",
    model="gemini-2.0-flash",
    description="B-roll agent",
    instruction="""
    Call the 'generate_b_roll' tool with {av_script.video_script}. Make sure you are using the video script, NOT the audio script. It should be
    a scene-by-scene visual description.
    """,
    tools=[generate_b_roll],
)