import requests  
import os
from dotenv import load_dotenv

load_dotenv()
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

def extract_metadata(url: str) -> dict:
    """
    Extracts metadata from a given URL using Tavily's extract API.

    Args:
        url (str): The URL from which to extract metadata.
    Returns:
        dict: A dictionary containing the extracted metadata.
    """

    endpoint = "https://api.tavily.com/extract"

    payload = {
        "urls": url,
        "include_images": False,
        "extract_depth": "basic",
        "format": "markdown"
    }
    headers = {
        "Authorization": f"Bearer {TAVILY_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.request("POST", endpoint, json=payload, headers=headers)
    return response.json()