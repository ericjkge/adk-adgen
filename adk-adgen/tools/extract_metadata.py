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

    # load_dotenv()
    # FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")
    # 
    # endpoint = "https://api.firecrawl.dev/v1/scrape"
    #
    # response = requests.post(  
    #     endpoint,  
    #     json={"url": url},  
    #     headers={"Authorization": f"Bearer {FIRECRAWL_API_KEY}"}  
    # )  
    # response.raise_for_status()  
    # return response.json()