import { LLMResponse } from '@/types/api';

const VLLM_API_URL = 'http://localhost:8000';

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  size: string;
}

export const MODEL_INFO: Record<string, ModelInfo> = {
  'llama2': {
    id: 'llama2',
    name: 'Llama 2',
    description: 'Meta\'s Llama 2 model, available via Ollama.',
    capabilities: ['Text Generation', 'General Purpose'],
    size: '7B/13B/70B parameters (varies by Ollama model)'
  },
  'llama3': {
    id: 'llama3',
    name: 'Llama 3',
    description: 'Meta\'s latest Llama 3 model, available via Ollama.',
    capabilities: ['Text Generation', 'General Purpose'],
    size: '8B/70B parameters'
  },
  'mistral': {
    id: 'mistral',
    name: 'Mistral',
    description: 'Mistral 7B model, available via Ollama.',
    capabilities: ['Text Generation', 'General Purpose'],
    size: '7B parameters'
  },
  'phi3': {
    id: 'phi3',
    name: 'Phi-3',
    description: 'Microsoft\'s Phi-3 model, available via Ollama.',
    capabilities: ['Text Generation', 'General Purpose'],
    size: '3.8B/14B parameters'
  },
  'qwen2': {
    id: 'qwen2',
    name: 'Qwen2',
    description: 'Alibaba\'s Qwen2 model, available via Ollama.',
    capabilities: ['Text Generation', 'Multilingual'],
    size: '0.5B/1.5B/7B/72B parameters'
  },
  'gemma': {
    id: 'gemma',
    name: 'Gemma',
    description: 'Google DeepMind\'s Gemma model, available via Ollama.',
    capabilities: ['Text Generation', 'General Purpose'],
    size: '2B/7B parameters'
  },
  'deepseek-coder': {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    description: 'DeepSeek Coder model, available via Ollama.',
    capabilities: ['Text Generation', 'Reasoning', 'Coding'],
    size: '7B/67B parameters'
  },
  'dolphin-mistral': {
    id: 'dolphin-mistral',
    name: 'Dolphin Mistral',
    description: 'Uncensored Dolphin model based on Mistral.',
    capabilities: ['Text Generation', 'General Purpose'],
    size: '7B parameters'
  },
  'llava': {
    id: 'llava',
    name: 'LLaVA',
    description: 'Large Language and Vision Assistant (multimodal).',
    capabilities: ['Text Generation', 'Vision'],
    size: '7B/13B/34B parameters'
  }
};

export const AVAILABLE_MODELS = Object.keys(MODEL_INFO) as Array<keyof typeof MODEL_INFO>;

export async function queryModel(prompt: string, model: string = "llama2") {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    text: data.text,
    model: model,
    error: null
  };
}
