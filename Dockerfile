# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the ADK application
COPY adk-adgen/ ./adk-adgen/

# Set working directory to the ADK app
WORKDIR /app/adk-adgen

# Expose port
EXPOSE 8080

# Set environment variable for ADK
ENV PORT=8080

# Start the ADK API server
CMD ["adk", "api_server", "--port", "8080", "--host", "0.0.0.0", "--allow_origins", "*", "."]