import base64

import requests
from google.adk.tools import ToolContext


def save_image(url: str, tool_context: ToolContext) -> str:
    """
    Saves an image from a given URL and converts it to base64 format, saving the base64 result to state.

    Args:
        url (str): The image URL.
        tool_context: Tool context to save the base64 image to state.
    Returns:
       str: Status message
    """

    response = requests.get(url)
    if response.status_code != 200:
        return f"Failed to fetch image. Status code: {response.status_code}"

    # Convert to base64
    base64_bytes = base64.b64encode(response.content).decode("utf-8")

    # Infer MIME type from URL (default to JPEG)
    if ".png" in url.lower():
        mime_type = "image/png"
    else:
        mime_type = "image/jpeg"

    # Store result in tool state
    tool_context.state["base64_image"] = {
        "bytesBase64Encoded": base64_bytes,
        "mimeType": mime_type,
    }

    return "Image successfully downloaded, encoded, and saved as base64."
