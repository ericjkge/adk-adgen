from google.adk.agents import SequentialAgent
from extraction.agent import extraction_agent

# from market.market_agent import market_agent

analysis_agent = SequentialAgent(
    name="analysis_agent",
    description="Analysis agent",
    sub_agents=[
        extraction_agent,
        # market_agent,
    ],
)
