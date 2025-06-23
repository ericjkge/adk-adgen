# Vibe - Multi-agent Ad Generation

Generate video advertisements from product URLs using Google's ADK framework, HeyGen avatars, and Veo 2.

## Features

- **Product Analysis** - Extracts metadata, pricing, features from URLs
- **Market Research** - Analyzes competitors and target audience  
- **AI Script Generation** - Creates audio/video scripts with user feedback
- **Video Creation** - HeyGen avatar A-roll + Veo 2 product B-roll
- **Auto Processing** - FFmpeg combination with transitions
- **Social Sharing** - Direct sharing to Reddit, Twitter, LinkedIn

## Prerequisites

- Python 3.9+, Node.js 18+, FFmpeg
- Google Cloud Project with Vertex AI enabled
- API Keys: Tavily, HeyGen

## Setup

### 1. Install Dependencies

```bash
git clone <repository-url>
cd adk-adgen

# Backend
pip install -r requirements.txt

# Frontend
cd frontend && npm install && npm run build
```

### 2. Configure Environment

Change `.env.example` into `.env` in adk-agent directory:

```env
GOOGLE_GENAI_USE_VERTEXAI=TRUE
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
OUTPUT_STORAGE_URI=gs://your-bucket-name/
TAVILY_API_KEY=your-tavily-api-key
HEYGEN_API_KEY=your-heygen-api-key
```

### 3. Google Cloud Setup

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project (or select an existing one)
- Install [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)
- Authenticate to Google Cloud by running:

```bash
gcloud auth login
gcloud auth application-default login
```

- Enable the [Vertex AI API](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com) (required for Veo 2 video generation)
- Go to [Google Cloud Storage](https://console.cloud.google.com/storage) and:
  - Click "Create Bucket"
  - Choose a globally unique bucket name (save this for your `.env` file)
  - Select "us-central1" region
  - After creation, go to bucket → Permissions → Add Principal → Enter "allUsers" → Role "Storage Object Viewer"

### 4. Get API Keys

- **Tavily**: Sign up at [tavily.com](https://www.tavily.com/)
- **HeyGen**: Get API key from [HeyGen](https://app.heygen.com/) settings

### 5. Configure Frontend API Routes

The video generation wizard supports three deployment modes. Edit `frontend/components/video-generation-wizard.tsx`:

#### **Local Development**
For running locally with Next.js API routes:
```javascript
// Uncomment LOCAL routes:
const sessionResponse = await fetch(`/api/adk/apps/manager/users/${USER_ID}/sessions`, {
const runResponse = await fetch("/api/adk/run", {

// Comment out CLOUD and DOCKER routes:
// CLOUD: const sessionResponse = await fetch(`https://vibe-backend-75799208947.us-central1.run.app/apps/manager/users/${USER_ID}/sessions`, {
// DOCKER: const sessionResponse = await fetch(`http://localhost:8080/apps/manager/users/${USER_ID}/sessions`, {
```

#### **Cloud Deployment (Default - Vercel + Cloud Run)**
For deploying frontend to Vercel with cloud backend:
```javascript
// Uncomment CLOUD routes:
const sessionResponse = await fetch(`https://vibe-backend-75799208947.us-central1.run.app/apps/manager/users/${USER_ID}/sessions`, {
const runResponse = await fetch("https://vibe-backend-75799208947.us-central1.run.app/run", {

// Comment out LOCAL and DOCKER routes:
// LOCAL: const sessionResponse = await fetch(`/api/adk/apps/manager/users/${USER_ID}/sessions`, {
// DOCKER: const sessionResponse = await fetch(`http://localhost:8080/apps/manager/users/${USER_ID}/sessions`, {
```

#### **Docker Development**
For running both frontend and backend in Docker:
```javascript
// Uncomment DOCKER routes:
const sessionResponse = await fetch(`http://localhost:8080/apps/manager/users/${USER_ID}/sessions`, {
const runResponse = await fetch("http://localhost:8080/run", {

// Comment out LOCAL and CLOUD routes:
// LOCAL: const sessionResponse = await fetch(`/api/adk/apps/manager/users/${USER_ID}/sessions`, {
// CLOUD: const sessionResponse = await fetch(`https://vibe-backend-75799208947.us-central1.run.app/run`, {
```

**Note**: Update all 8 fetch calls in the file (session creation + 7 agent runs) to match your chosen deployment mode.

## Running (Local Development)

Start both services:

```bash
# Terminal 1: Backend (adk-adgen folder)
adk api_server

# Terminal 2: Frontend (frontend folder)
npm run dev
```

Access at `http://localhost:3000`

## Architecture

- **Backend**: Python ADK agents (Manager → Analysis → Market → Script → A-roll → B-roll → Processing)
- **Frontend**: Next.js 6-step wizard interface
- **Storage**: Google Cloud Storage for video assets
