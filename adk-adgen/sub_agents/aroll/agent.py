from google.adk.agents import Agent
from ...tools.generate_a_roll import generate_a_roll

a_roll_agent = Agent(
    name="aroll",
    model="gemini-2.0-flash",
    description="A-roll agent",
    instruction="""
    Call the 'generate_a_roll' tool with {av_script.audio_script}.
    """,
    tools=[generate_a_roll],
)