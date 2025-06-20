# ADK AdGen Web Application Setup

This guide will help you set up the complete web application that replaces the `adk web` chat interface with a proper web UI.

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐
│                 │ ◄──────────────────► │                 │
│  Next.js        │                      │  FastAPI        │
│  Frontend       │                      │  Backend        │
│  (Port 3000)    │                      │  (Port 8000)    │
│                 │                      │                 │
└─────────────────┘                      └─────────────────┘
                                                   │
                                                   ▼
                                         ┌─────────────────┐
                                         │                 │
                                         │  ADK Agents     │
                                         │  (Your existing │
                                         │   agent system) │
                                         │                 │
                                         └─────────────────┘
```

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd adk-adgen
pip install fastapi uvicorn websockets python-multipart pydantic python-dotenv
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Start Backend Server

```bash
cd adk-adgen
python -m uvicorn web_server:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Start Frontend Server

```bash
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Integration Steps

### Step 1: Complete ADK Integration

The `adk_integration.py` file needs to be completed with actual ADK agent calls. You'll need to:

1. **Research ADK's programmatic API**: Look for documentation on how to call ADK agents from Python code
2. **Replace placeholder calls**: Update the `_run_agent_async` method with real ADK integration
3. **Handle agent contexts**: Ensure proper context passing between agents

Example integration patterns to try:

```python
# Option 1: Direct agent execution
result = await agent.execute(input_data, context=context)

# Option 2: Through root agent
result = await root_agent.invoke_sub_agent(agent.name, input_data)

# Option 3: Using ADK's async runner
result = await adk.run_agent_async(agent, input_data, context)
```

### Step 2: Update Web Server

In `web_server.py`, you may need to:

1. **Handle file uploads** for product images
2. **Implement proper session management** (consider using Redis for production)
3. **Add error handling** for agent failures
4. **Implement artifact management** for generated videos

### Step 3: Frontend Enhancements

The Video Generator component provides:

- ✅ Product URL input
- ✅ Avatar/voice selection
- ✅ Real-time progress tracking
- ✅ Script review with feedback
- ✅ Video result display

You may want to add:

- **File upload** for product images
- **Campaign saving** to database
- **Video history** management
- **Export options** for different formats

## 🔄 Workflow Implementation

### Current Flow:
1. **Input**: User enters product URL
2. **Analysis**: Extract metadata + market research
3. **Script**: Generate A-roll and B-roll scripts
4. **Review**: User provides feedback (optional)
5. **Video**: Generate avatar video + product video
6. **Process**: Combine and finalize

### Key Integration Points:

#### 1. Analysis Agent
```python
# Extract product metadata
metadata = await extraction_agent.run(product_url)

# Perform market research  
market_analysis = await market_agent.run(metadata)
```

#### 2. Script Agent
```python
# Generate initial script
script = await script_agent.run(metadata, market_analysis)

# Handle feedback loop
if user_feedback:
    script = await script_agent.run(metadata, market_analysis, user_feedback)
```

#### 3. Video Agent (Parallel)
```python
# Generate A-roll (avatar) and B-roll (product video) simultaneously
a_roll_task = a_roll_agent.run(script.audio_script)
b_roll_task = b_roll_agent.run(script.video_script)

await asyncio.gather(a_roll_task, b_roll_task)
```

#### 4. Processing Agent
```python
# Combine A-roll and B-roll into final video
final_video = await processing_agent.run()
```

## 🐛 Troubleshooting

### Common Issues:

1. **ADK Import Errors**: Ensure ADK is properly installed and agents are importable
2. **WebSocket Connection Issues**: Check CORS settings and port availability
3. **Agent Context Issues**: Verify proper context passing between agents
4. **File Upload Issues**: Implement proper multipart form handling

### Debug Mode:

Run the backend with debug logging:

```bash
uvicorn web_server:app --host 0.0.0.0 --port 8000 --reload --log-level debug
```

## 🚀 Production Deployment

For production deployment:

1. **Use Redis** for session management
2. **Add authentication** and user management
3. **Implement rate limiting** for API endpoints
4. **Set up proper logging** and monitoring
5. **Use HTTPS** with proper SSL certificates
6. **Configure environment variables** for all API keys

## 📁 File Structure

```
adk-adgen/
├── web_server.py          # FastAPI server
├── adk_integration.py     # ADK agent wrapper
├── requirements-web.txt   # Backend dependencies
├── agent.py              # Your existing root agent
└── sub_agents/           # Your existing agents

frontend/
├── components/
│   └── video-generator.tsx  # Main video generation UI
├── app/
│   └── page.tsx            # Updated main page
└── package.json           # Frontend dependencies
```

## 🎯 Next Steps

1. **Complete ADK integration** in `adk_integration.py`
2. **Test the workflow** with a real product URL
3. **Add error handling** and user feedback
4. **Implement video download** functionality
5. **Add campaign management** features

## 🔗 Useful Commands

```bash
# Start everything (run from project root)
python start_web_app.py

# Start backend only
cd adk-adgen && python -m uvicorn web_server:app --reload

# Start frontend only
cd frontend && npm run dev

# Check API endpoints
curl http://localhost:8000/docs
```

This setup replaces your current `adk web` chat interface with a professional web application that provides the same functionality through a modern UI with buttons, forms, and real-time progress tracking! 