from google.adk.agents import Agent
from google.adk.tools import LongRunningFunctionTool
from ...tools.generate_a_roll import generate_a_roll
from ...tools.generate_b_roll import generate_b_roll

video_agent = Agent(
    name="video",
    model="gemini-2.0-flash",
    description="Video agent",
    instruction="""
    Call the generate_b_roll tool with the prompt: 'show the uploaded image spinning out'. Print out whatever is returned. Only attempt to generate video once.
    """,
    tools=[LongRunningFunctionTool(generate_a_roll), LongRunningFunctionTool(generate_b_roll)],
)