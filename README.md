# Project Setup

Follow these steps to get started:

## 1. Install Dependencies

Make sure you have Python 3.9+ installed.

```bash
pip install google-adk
```

## 2. Create a `.env` File

In the root directory of your project, create a file named `.env` and add the following content:

```
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=INSERT_KEY_HERE
```

## 3. Get Your API Key

To get your `GOOGLE_API_KEY`, follow these steps:

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Generate and copy your API key into .env