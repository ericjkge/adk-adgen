from google.adk.agents import Agent
from . import prompt
from .sub_agents.extraction.agent import extraction_agent

root_agent = Agent(
    name="manager",
    model="gemini-2.0-flash",
    description="Manager agent",
    instruction= "Call extraction_agent to test URL extraction.",
    
    #prompt.ROOT_PROMPT,
    sub_agents=[extraction_agent],
    # tools=[],
)