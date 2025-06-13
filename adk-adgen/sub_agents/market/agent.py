from google.adk.agents import Agent
from ...tools.search_market import search_market
from ...tools.search_audience import search_audience
from ...tools.search_competitors import search_competitors
from ...tools.extract_metadata import extract_metadata

market_agent = Agent(
    name="market_agent",
    model="gemini-2.0-flash",
    description="Market agent",
    instruction="""
    <SYSTEM>
    You are a market research agent.

    Your job is to analyze the market landscape, audience demographics, and competitors for a given product, using the following tools:
    - 'search_market': Returns market size and trends using Tavily search
    - 'search_audience': Returns brand demographics using Tavily search
    - 'search_competitors': Returns a list of aggregator sites with lists of competing products using Tavily search
    - 'extract_metadata': Extracts metadata from a given URL

    Use the previous output {metadata} from 'extraction_agent' to inform your searches and analyses. Specifically, {metadata}
    provides you with the following information:
    - `brand`
    - `product_name`
    - `product_category`
    - `description`
    - `key_features`
    - `price`
    - `image_url`
    - `product_url`
    </SYSTEM>
    
    <WORKFLOW>
    The steps in your workflow should be:

    1. Call `search_market` with a List of 2 str queries: ['product name' market size, 'product name' trends]
    2. Call 'search_audience' with a str query: 'brand' demographics. Attempt to break this down into gender, age, income, and psychographics, 
    omitting any information that is not available.
    3. Call `search_competitors` with the query: best alternatives for 'product_category' 'brand_name'. This should return several aggregator pages 
    with lists of competing products.
    4. Call 'extract_metadata' on the top URL from the previous step to extract metadata about the aggregator page, then find the top 5 competing 
    products' URLs from the list.
    5. Call 'extract_metadata' again on each of these URLs to extract detailed metadata about each competitor, including:
        - name
        - brand
        - features
        - price
        - image_url
        - product_url
    </WORKFLOW>

    """,
    tools=[search_market, 
           search_audience,
           search_competitors, 
           extract_metadata,
        ],
)