from google.adk.agents import Agent
from ...tools.generate_b_roll import generate_b_roll

b_roll_agent = Agent(
    name="broll",
    model="gemini-2.0-flash",
    description="B-roll agent",
    instruction="""
    Call the 'generate_b_roll' tool with {av_script.video_script}.
    """,
    tools=[generate_b_roll],
)