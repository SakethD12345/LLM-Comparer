import { LLMResponse } from '@/types/api';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  size: string;
}

export const MODEL_INFO: Record<string, ModelInfo> = {
  'mistralai/Mistral-7B-v0.1': {
    id: 'mistralai/Mistral-7B-v0.1',
    name: 'Mistral 7B',
    description: 'A high-performance 7B parameter model known for its strong reasoning capabilities',
    capabilities: ['Text Generation', 'Reasoning', 'Code Generation', 'Instruction Following'],
    size: '7B parameters'
  },
  'tiiuae/falcon-7b': {
    id: 'tiiuae/falcon-7b',
    name: 'Falcon 7B',
    description: 'A powerful language model trained on a diverse dataset',
    capabilities: ['Text Generation', 'Question Answering', 'Summarization'],
    size: '7B parameters'
  },
  'stabilityai/stablelm-base-alpha-7b': {
    id: 'stabilityai/stablelm-base-alpha-7b',
    name: 'StableLM 7B',
    description: 'Stability AI\'s base language model with strong general capabilities',
    capabilities: ['Text Generation', 'Conversation', 'General Knowledge'],
    size: '7B parameters'
  },
  'deepseek-ai/deepseek-llm-7b-base': {
    id: 'deepseek-ai/deepseek-llm-7b-base',
    name: 'DeepSeek LLM 7B',
    description: 'A general-purpose language model with strong reasoning abilities',
    capabilities: ['Text Generation', 'Reasoning', 'Knowledge Tasks'],
    size: '7B parameters'
  },
  'deepseek-ai/deepseek-coder-33b-base': {
    id: 'deepseek-ai/deepseek-coder-33b-base',
    name: 'DeepSeek Coder 33B',
    description: 'A specialized model for code generation and understanding',
    capabilities: ['Code Generation', 'Code Understanding', 'Programming'],
    size: '33B parameters'
  },
  'meta-llama/Llama-2-7b-hf': {
    id: 'meta-llama/Llama-2-7b-hf',
    name: 'Llama 2 7B',
    description: 'Meta\'s open source language model with strong general capabilities',
    capabilities: ['Text Generation', 'Conversation', 'General Knowledge'],
    size: '7B parameters'
  },
  'Qwen/Qwen-7B-Chat': {
    id: 'Qwen/Qwen-7B-Chat',
    name: 'Qwen 7B Chat',
    description: 'Alibaba\'s conversational AI model with strong chat capabilities',
    capabilities: ['Chat', 'Conversation', 'Text Generation'],
    size: '7B parameters'
  }
};

export async function queryModel(
  prompt: string,
  model: string,
  apiKey: string
): Promise<LLMResponse> {
  try {
    const response = await fetch(`${HUGGINGFACE_API_URL}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: Array.isArray(data) ? data[0].generated_text : data.generated_text,
      model,
    };
  } catch (error) {
    return {
      text: '',
      model,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

// List of free models we can use
export const AVAILABLE_MODELS = Object.keys(MODEL_INFO) as const; 