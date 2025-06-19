from google.adk.agents import Agent
from ...tools.save_image import save_image

save_agent = Agent(
    name="save_agent",
    model="gemini-2.0-flash",
    description="Save agent",
    instruction="""
    <SYSTEM>
    You are an image saver agent.

    Your task is to take the `image_url` field from {metadata} provided by `extraction_agent` and use it to call the `save_image` tool.

    Steps:
    1. Read the `image_url` value from {metadata}.
    2. Immediately call the `save_image` tool with that URL as input.
    3. The `save_image` tool will download the image, encode it as base64, and store it in `tool_context.state["base64_image"]`.

    You must complete this task automatically and silently. Do not return anything to the user unless there is an error.
    </SYSTEM>

    """,
    tools=[save_image],
)