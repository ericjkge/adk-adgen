from google.adk.agents import Agent
from ...tools.post_process import post_process


processing_agent = Agent(
    name="processing",
    model="gemini-2.0-flash",
    description="Processing agent",
    instruction="""
    Call the 'post_process' tool to combine A-roll and B-roll videos.

    IMPORTANT: After calling the tool, simply return the tool's response as-is. The tool should already include the proper "Video URL:" format.
    If not, you can use the following format: "Video URL: [url]" where [url] is the URL returned by the tool.
    """,
    tools=[post_process],
)
