import requests

def search_competitors(query: str) -> dict:
    """
    Searches for market size and trends using Tavily's search API.

    Args:
        query (str): The search query to .
    
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
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
    }

    response = requests.request("POST", url, json=payload, headers=headers)

    return response.json()
