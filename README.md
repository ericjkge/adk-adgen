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

Create `.env` in root directory:

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

## Running

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
