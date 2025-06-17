from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
from vllm import LLM, SamplingParams

app = FastAPI()

# Initialize models
models = {
    'gpt2': LLM(model="gpt2"),
    'facebook/opt-125m': LLM(model="facebook/opt-125m"),
    'bigscience/bloom-560m': LLM(model="bigscience/bloom-560m"),
    'google/flan-t5-base': LLM(model="google/flan-t5-base")
}

class GenerateRequest(BaseModel):
    prompt: str
    model: str
    max_new_tokens: Optional[int] = 100
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.95
    do_sample: Optional[bool] = True

@app.post("/generate")
async def generate(request: GenerateRequest):
    if request.model not in models:
        raise HTTPException(status_code=404, detail=f"Model {request.model} not found")
    
    try:
        # Get the model
        llm = models[request.model]
        
        # Set up sampling parameters
        sampling_params = SamplingParams(
            max_tokens=request.max_new_tokens,
            temperature=request.temperature,
            top_p=request.top_p,
            use_beam_search=not request.do_sample
        )
        
        # Generate
        outputs = llm.generate(request.prompt, sampling_params)
        
        # Return the generated text
        return {
            "text": outputs[0].outputs[0].text,
            "model": request.model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 