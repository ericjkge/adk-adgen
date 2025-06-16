from google.adk.agents import Agent
from . import prompt
from .sub_agents.analysis.agent import analysis_agent
from .sub_agents.script.agent import script_agent
from .sub_agents.video.agent import video_agent

root_agent = Agent(
    name="manager",
    model="gemini-2.0-flash",
    description="Manager agent",
    instruction= "call analysis agent, telling the user if the base64 image saved successfully.",
    
    #"Call analysis_agent to test URL extraction and market analysis, then call script agent to generate script, waiting for user feedback and iterating as necessary",
    
    #prompt.ROOT_PROMPT,
    sub_agents=[analysis_agent, script_agent, video_agent],
    # tools=[],
)