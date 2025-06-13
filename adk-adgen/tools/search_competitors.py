import requests
import os
from dotenv import load_dotenv

load_dotenv()
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

def search_competitors(query: str) -> dict:
    """
    Searches for competitors using Tavily's search API.

    Args:
        query (str): The search query to find competitors.
    
    Returns:
        dict: A dictionary containing the search results.
    """

    url = "https://api.tavily.com/search"

    payload = {
        "query": query,
        "topic": "general",
        "search_depth": "basic",
        "chunks_per_source": 3,
        "max_results": 1,
        "time_range": None,
        "days": 7,
        "include_answer": True,
        "include_raw_content": True,
        "include_images": False,
        "include_image_descriptions": False,
        "include_domains": [],
        "exclude_domains": [],
        "country": None
    }
    headers = {
        "Authorization": f"Bearer {TAVILY_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.request("POST", url, json=payload, headers=headers)

    return response.json()
