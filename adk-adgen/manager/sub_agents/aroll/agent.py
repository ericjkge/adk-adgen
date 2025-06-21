from google.adk.agents import Agent
from ...tools.generate_a_roll import generate_a_roll

a_roll_agent = Agent(
    name="aroll",
    model="gemini-2.0-flash",
    description="A-roll agent",
    instruction="""
    Call the 'generate_a_roll' tool with {av_script.audio_script}. Make sure you are using the audio script, NOT the video script. It should be
    a natural, full sentence narration.
    """,
    tools=[generate_a_roll],
)