from google.adk.agents import Agent
from ...tools.search_competitors import search_competitors
from ...tools.analyze_competitors import analyze_competitors
from ...tools.search_market import search_market
from ...tools.search_audience import search_audience

market_agent = Agent(
    name="market_agent",
    model="gemini-2.0-flash",
    description="Market agent",
    instruction="""
    <SYSTEM>
    You are a market research agent.

    Your task is to use the provided tools to gather and analyze market data. You will use the following tools:
    - `search_competitors`: Returns a list of top 5 competitors for the given product using Tavily search
    - `analyze_competitors`: Returns a detailed web crawl of each competitor's website using Firecrawl crawl
    - `search_market`: Returns market size and trends using Tavily search
    - `search_audience`: Returns related audience segments and demographics using Tavily search

    Use the previous output {metadata} from 'extraction_agent' to inform your searches and analyses. The steps in your workflow should be:

    1. Use `search_market` to gather market size and trends.
    2. Use `search_competitors` to find competitors for the product.
    3. Use `analyze_competitors` to get detailed information about each competitor.
    4. Use `search_audience` to find related audience segments and demographics.

    At the end of your analysis, return a structured JSON object with the following keys:
    - `market_overview`: A list of competitor names and their URLs.
    - 'competitors': A list of detailed competitor analyses.
    - 'positioning': A summary of how the product is positioned in the market.
    </SYSTEM>

    <EXAMPLE>

    

    </EXAMPLE>
    """,
    tools=[search_competitors, analyze_competitors, search_market, search_audience]
)