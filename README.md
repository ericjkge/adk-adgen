# Project Setup

Follow these steps to get started:

---

## 1. Install Dependencies

Ensure you're using **Python 3.9+**. Then install required packages:

```bash
pip install google-adk python-dotenv
```

---

## 2. Set Up Your `.env` File

In the root of your project, create a file named `.env` and add your API keys and config:

```env
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=INSERT_YOUR_GOOGLE_API_KEY
FIRECRAWL_API_KEY=INSERT_YOUR_FIRECRAWL_API_KEY
TAVILY_API_KEY=INSERT_YOUR_TAVILY_API_KEY
HEYGEN_API_KEY=INSERT_YOUR_HEYGEN_API_KEY
GOOGLE_PROJECT_ID=INSERT_YOUR_PROJECT_ID
```

---

## 3. Get Your API Keys

### 🔹 Google API Key (for Gemini via AI Studio)
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project (or use an existing one)
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Generate your API key and paste it into `.env` under `GOOGLE_API_KEY`

### 🔹 Tavily API Key
- Sign up at [tavily.com](https://www.tavily.com/)
- Copy your API key into `.env` under `TAVILY_API_KEY`

### 🔹 HeyGen API Key
- Log into [HeyGen](https://app.heygen.com/)
- Navigate to your API settings
- Paste your key into `.env` under `HEYGEN_API_KEY`
