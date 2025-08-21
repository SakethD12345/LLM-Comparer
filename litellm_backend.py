from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
import litellm
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

litellm.drop_params = True
litellm.set_verbose = False

class Message(BaseModel):
    role: str
    content: str

class PromptRequest(BaseModel):
    prompt: str
    model: str = "gpt-3.5-turbo"
    conversation_history: Optional[List[Message]] = None
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = None
    stream: Optional[bool] = False

class ModelListResponse(BaseModel):
    models: List[Dict[str, Any]]

AVAILABLE_MODELS = {
    "openai": [
        "gpt-4-turbo-preview",
        "gpt-4",
        "gpt-3.5-turbo",
        "gpt-3.5-turbo-16k"
    ],
    "anthropic": [
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
        "claude-2.1",
        "claude-instant-1.2"
    ],
    "ollama": [
        "ollama/llama2",
        "ollama/llama2:13b",
        "ollama/llama2:70b",
        "ollama/mistral",
        "ollama/mixtral",
        "ollama/codellama",
        "ollama/phi"
    ],
    "google": [
        "gemini-pro",
        "gemini-pro-vision",
        "palm-2"
    ],
    "cohere": [
        "command",
        "command-light",
        "command-nightly"
    ],
    "huggingface": [
        "huggingface/meta-llama/Llama-2-7b-chat-hf",
        "huggingface/mistralai/Mistral-7B-Instruct-v0.1",
        "huggingface/google/flan-t5-xxl"
    ]
}

@app.get("/models")
def list_models() -> ModelListResponse:
    """List all available models organized by provider"""
    models_list = []
    
    for provider, models in AVAILABLE_MODELS.items():
        for model in models:
            models_list.append({
                "provider": provider,
                "model": model,
                "display_name": model.replace("ollama/", "").replace("huggingface/", ""),
                "requires_api_key": provider not in ["ollama"]
            })
    
    return ModelListResponse(models=models_list)

@app.post("/generate")
async def generate(req: PromptRequest):
    try:
        messages = []
        
        if req.conversation_history:
            messages = [{"role": msg.role, "content": msg.content} for msg in req.conversation_history]
        
        messages.append({"role": "user", "content": req.prompt})
        
        completion_params = {
            "model": req.model,
            "messages": messages,
            "temperature": req.temperature,
            "stream": req.stream
        }
        
        if req.max_tokens:
            completion_params["max_tokens"] = req.max_tokens
        
        if req.model.startswith("ollama/"):
            completion_params["api_base"] = "http://localhost:11434"
        
        response = litellm.completion(**completion_params)
        
        if req.stream:
            return {"error": "Streaming not yet implemented in this endpoint"}
        
        text = response.choices[0].message.content
        
        usage = {
            "prompt_tokens": response.usage.prompt_tokens if hasattr(response, 'usage') else None,
            "completion_tokens": response.usage.completion_tokens if hasattr(response, 'usage') else None,
            "total_tokens": response.usage.total_tokens if hasattr(response, 'usage') else None
        }
        
        return {
            "text": text,
            "model": req.model,
            "usage": usage,
            "error": None
        }
        
    except Exception as e:
        error_message = str(e)
        
        if "API key" in error_message or "authentication" in error_message.lower():
            error_message = f"Authentication error for {req.model}. Please check your API keys in the .env file."
        elif "model_not_found" in error_message:
            error_message = f"Model {req.model} not found. Please check available models."
        
        raise HTTPException(status_code=500, detail=error_message)

@app.get("/health")
def health_check():
    """Health check endpoint"""
    configured_providers = []
    
    if os.getenv("OPENAI_API_KEY"):
        configured_providers.append("openai")
    if os.getenv("ANTHROPIC_API_KEY"):
        configured_providers.append("anthropic")
    if os.getenv("GOOGLE_API_KEY"):
        configured_providers.append("google")
    if os.getenv("COHERE_API_KEY"):
        configured_providers.append("cohere")
    if os.getenv("HUGGINGFACE_API_KEY"):
        configured_providers.append("huggingface")
    
    configured_providers.append("ollama")
    
    return {
        "status": "healthy",
        "configured_providers": configured_providers,
        "litellm_version": litellm.__version__ if hasattr(litellm, '__version__') else "unknown"
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting LiteLLM backend server...")
    print("Available at: http://localhost:8001")
    print("\nConfigured providers:")
    
    health = health_check()
    for provider in health["configured_providers"]:
        print(f"  - {provider}")
    
    print("\nTo add more providers, set their API keys in your .env file:")
    print("  OPENAI_API_KEY=your_key_here")
    print("  ANTHROPIC_API_KEY=your_key_here")
    print("  GOOGLE_API_KEY=your_key_here")
    print("  COHERE_API_KEY=your_key_here")
    print("  HUGGINGFACE_API_KEY=your_key_here")
    
    uvicorn.run(app, host="0.0.0.0", port=8001)