# LiteLLM Setup Guide

LiteLLM has been added as an additional backend option alongside Ollama. This allows you to use multiple LLM providers through a unified interface.

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Add your API keys to the `.env` file for the providers you want to use:
```
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GOOGLE_API_KEY=your_google_key_here
COHERE_API_KEY=your_cohere_key_here
HUGGINGFACE_API_KEY=your_huggingface_key_here
```

## Running the Servers

You now have two backend options:

### Option 1: Ollama Backend (Default)
```bash
# Start Ollama (if not already running)
ollama serve

# Start the Ollama backend server
python ollama_backend.py
```

### Option 2: LiteLLM Backend
```bash
# Start the LiteLLM backend server
python litellm_backend.py
```

### Running Both Backends Simultaneously
You can run both backends at the same time:
- Ollama backend runs on port 8000
- LiteLLM backend runs on port 8001

```bash
# Terminal 1: Ollama backend
python ollama_backend.py

# Terminal 2: LiteLLM backend
python litellm_backend.py

# Terminal 3: Next.js frontend
npm run dev
```

## Using the Interface

1. Start the Next.js frontend:
```bash
npm run dev
```

2. Open http://localhost:3000 in your browser

3. In each model panel, you'll see a "Backend Provider" selector with two options:
   - **Ollama (Local)**: Uses local Ollama models
   - **LiteLLM (Multi-Provider)**: Uses LiteLLM with support for multiple providers

4. Select your backend and choose a model from the dropdown

## Supported Providers

LiteLLM supports the following providers:

- **OpenAI**: GPT-4, GPT-3.5-Turbo
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku), Claude 2
- **Google**: Gemini Pro, PaLM
- **Cohere**: Command models
- **Hugging Face**: Various open-source models
- **Ollama**: All local Ollama models (through LiteLLM interface)
- **Azure OpenAI**: Azure-hosted OpenAI models

## Troubleshooting

### LiteLLM backend not starting
- Check that you have installed all requirements: `pip install -r requirements.txt`
- Verify port 8001 is not in use

### Models not showing up
- Ensure the LiteLLM backend is running
- Check your API keys are correctly set in `.env`
- Look at the terminal output for any error messages

### API Key errors
- Make sure your API keys are valid and have the necessary permissions
- Some providers require specific setup (e.g., Azure needs endpoint and version)

### Ollama models through LiteLLM
- Ensure Ollama is running on port 11434
- LiteLLM can access Ollama models with the prefix `ollama/`

## Testing the Setup

You can test the LiteLLM backend directly:

```bash
# Check health and configured providers
curl http://localhost:8001/health

# List available models
curl http://localhost:8001/models

# Test generation (requires valid API key for the model)
curl -X POST http://localhost:8001/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, world!", "model": "gpt-3.5-turbo"}'
```