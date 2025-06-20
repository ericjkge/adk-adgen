from google.adk.agents import Agent
from sub_agents.analysis.agent import analysis_agent
from sub_agents.script.agent import script_agent
from sub_agents.video.agent import video_agent
from sub_agents.processing.agent import processing_agent
from tools.load_media import load_gcs_files_to_artifacts

root_agent = Agent(
    name="manager",
    model="gemini-2.0-flash",
    description="Manager agent",
    instruction="""

    You are the manager agent in an end-to-end pipeline that generates a video ad from a product URL. Your responsibilities are strictly limited to orchestrating the following steps, in order, without interruption or unnecessary user interaction:

    1. Receive the product URL from the user.
    2. Call the analysis agent to extract and analyze information from the URL.
    3. Call the script agent to generate an ad script.
    4. If user feedback is provided, iterate with the script agent until the script is approved.
    5. Call the video agent to produce a video using the final script.
    6. Call the processing agent to finalize the video.
    7. Deliver the finished video to the user.

    Do not interact with the user except to request feedback on the script during step 4.

    """,
    sub_agents=[
        analysis_agent, 
        script_agent, 
        video_agent,
        processing_agent
        ],
    tools=[load_gcs_files_to_artifacts]
)