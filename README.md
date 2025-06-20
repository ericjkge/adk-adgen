# Project Setup

Follow these steps to get started:

---

## 1. Install Dependencies

Ensure you're using **Python 3.9+**. Then install required packages:

```bash
pip install google-adk python-dotenv google-cloud-storage
```

Install ffmpeg.

---

## 2. Set Up Your `.env` File

In the root of your project, create a file named `.env` and add your API keys and config:

```env
GOOGLE_GENAI_USE_VERTEXAI=TRUE
FIRECRAWL_API_KEY=INSERT_YOUR_FIRECRAWL_API_KEY
TAVILY_API_KEY=INSERT_YOUR_TAVILY_API_KEY
HEYGEN_API_KEY=INSERT_YOUR_HEYGEN_API_KEY
GOOGLE_CLOUD_PROJECT=INSERT_YOUR_PROJECT_ID
GOOGLE_CLOUD_LOCATION=us-central1
OUTPUT_STORAGE_URI = INSERT_YOUR_GCS_URI
```

---

## 3. Get Your API Keys

### 🔹 Google Cloud Project Setup
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project (or use an existing one)
- Set up the [Google CLI](https://cloud.google.com/vertex-ai/generative-ai/docs/start/quickstarts/quickstart-multimodal#setup-local)
- Authenticate to Google cloud by running:

```bash
gcloud auth login
```
- Enable the [Vertex AI API](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com)
- Select the project in [Google Cloud Storage](https://cloud.google.com/storage?hl=en)

### 🔹 Tavily API Key
- Sign up at [tavily.com](https://www.tavily.com/)
- Copy your API key into `.env` under `TAVILY_API_KEY`

### 🔹 HeyGen API Key
- Log into [HeyGen](https://app.heygen.com/)
- Copy your API key into `.env` under `HEYGEN_API_KEY`

NOTE: Alternatively, just complete Steps 1 and 3 from the [ADK Quickstart Guide](https://google.github.io/adk-docs/get-started/quickstart/#set-up-the-model)

--

## 4. Running the code

For the backend, navigate to the adk-adgen root folder then run:

```bash
adk web
```

