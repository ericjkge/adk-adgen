from google.adk.agents import Agent
from . import prompt
from .sub_agents.analysis.agent import analysis_agent
from .sub_agents.creative.agent import creative_agent

root_agent = Agent(
    name="manager",
    model="gemini-2.0-flash",
    description="Manager agent",
    instruction= "Call analysis_agent to test URL extraction and market analysis, then call creative agent to generate script, waiting for user feedback and iterating as necessary",
    
    #prompt.ROOT_PROMPT,
    sub_agents=[analysis_agent, creative_agent],
    # tools=[],
)