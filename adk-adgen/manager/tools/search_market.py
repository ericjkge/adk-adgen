from typing import Dict, List
import requests
import os
from dotenv import load_dotenv

load_dotenv()
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")


def search_market(queries: List[str]) -> Dict[str, dict]:
    """
    Searches for market size and trends using Tavily's search API.

    Args:
        queries (List[str]): A list of 2 queries (market size and trends).

    Returns:
        Dict[str, dict]: A mapping from each query to its search result.
    """

    url = "https://api.tavily.com/search"

    headers = {
        "Authorization": f"Bearer {TAVILY_API_KEY}",
        "Content-Type": "application/json",
    }

    results = {}

    for query in queries:
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
            "country": None,
        }

        response = requests.request("POST", url, json=payload, headers=headers)
        results[query] = response.json()

    return results
