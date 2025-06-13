from google.adk.agents import Agent
from . import prompt
from .sub_agents.analysis.agent import analysis_agent

root_agent = Agent(
    name="manager",
    model="gemini-2.0-flash",
    description="Manager agent",
    instruction= "Call analysis_agent to test URL extraction and market analysis.",
    
    #prompt.ROOT_PROMPT,
    sub_agents=[analysis_agent],
    # tools=[],
)