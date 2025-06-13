import requests  

def extract_metadata(url: str) -> dict:
    """
    Extracts metadata from a given URL using Tavily's extract API.

    Args:
        url (str): The URL from which to extract metadata.
    Returns:
        dict: A dictionary containing the extracted metadata.
    """

    url = "https://api.tavily.com/extract"

    payload = {
        "urls": url,
        "include_images": False,
        "extract_depth": "basic",
        "format": "markdown"
    }
    headers = {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
    }

    response = requests.request("POST", url, json=payload, headers=headers)
    return response.json() 

    # api_key = "fc-92ea1defd9df4883ae3731fe5a6701e3"
    # endpoint = "https://api.firecrawl.dev/v1/scrape"

    # response = requests.post(  
    #     endpoint,  
    #     json={"url": url},  
    #     headers={"Authorization": f"Bearer {api_key}"}  
    # )  
    # response.raise_for_status()  
    # return response.json()