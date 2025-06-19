from google.adk.agents import ParallelAgent
from ..aroll.agent import a_roll_agent
from ..broll.agent import b_roll_agent

video_agent = ParallelAgent(
    name="video_agent",
    description="Video agent",
    sub_agents=[a_roll_agent, b_roll_agent]
)