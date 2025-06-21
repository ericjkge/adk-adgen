from google.adk.agents import Agent
from ...tools.post_process import post_process


processing_agent = Agent(
    name="processing",
    model="gemini-2.0-flash",
    description="Processing agent",
    instruction="""
    Call the 'post_process' tool.
    """,
    tools=[post_process],
)