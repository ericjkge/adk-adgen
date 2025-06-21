from google.adk.agents import Agent
from .sub_agents.analysis.agent import analysis_agent
from .sub_agents.market.agent import market_agent
from .sub_agents.script.agent import script_agent
from .sub_agents.aroll.agent import a_roll_agent
from .sub_agents.broll.agent import b_roll_agent
from .sub_agents.processing.agent import processing_agent
# from .tools.load_media import load_gcs_files_to_artifacts

root_agent = Agent(
    name="manager",
    model="gemini-2.0-flash",
    description="Manager agent",
    instruction="""

    You are the manager agent in an end-to-end pipeline that generates a video ad from a product URL. 

    You will receive prompts from a "wizard" frontend telling you which subagents to call.
    
    Below is the general flow of the wizard. You will be given a prompt at each step telling you when and which subagents to call:

    1. Receive the product URL from the user.
    2. Analysis agent sequentially runs two agents:
        - Extraction agent extracts and analyzes metadata from the URL.
        - Save agent saves the product image from the URL.
    3. Market agent searches for market trends, audience demographics, and competitor information.
    4. Script agent generates an ad script. If user feedback is provided, script agent iterates until the script is approved.
    5. A-roll agent generates an avatar video and audio using HeyGen.
    6. B-roll agent generates a product video using Veo 2.
    6. Processing agent finalizes the video.

    NOTE: You MUST respond with the exact output of the subagent you are calling. Do NOT interact additionally with the user, as your responses will be
    fed back to the wizard frontend, which has strict regex rules about how to handle your responses.
    """,
    sub_agents=[
        analysis_agent, 
        market_agent,
        script_agent, 
        a_roll_agent,
        b_roll_agent,
        processing_agent
        ],
    # tools=[load_gcs_files_to_artifacts]
)