from google.adk.agents import SequentialAgent
from ..extraction.agent import extraction_agent
from ..save.agent import save_agent
from ..market.agent import market_agent

analysis_agent = SequentialAgent(
    name="analysis_agent",
    description="Analysis agent",
    sub_agents=[
        extraction_agent,
        save_agent,
        market_agent,
    ],
)
