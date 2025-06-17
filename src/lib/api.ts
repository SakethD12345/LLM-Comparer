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
  'gpt2': {
    id: 'gpt2',
    name: 'GPT-2',
    description: 'A smaller, more accessible model for testing',
    capabilities: ['Text Generation', 'Basic Language Tasks'],
    size: '117M parameters'
  },
  'facebook/opt-125m': {
    id: 'facebook/opt-125m',
    name: 'OPT 125M',
    description: 'Small OPT model hosted for testing purposes',
    capabilities: ['Text Generation', 'Basic Language Tasks'],
    size: '125M parameters'
  },
  'bigscience/bloom-560m': {
    id: 'bigscience/bloom-560m',
    name: 'BLOOM 560M',
    description: 'Multilingual autoregressive model from BigScience',
    capabilities: ['Text Generation', 'Multilingual Support'],
    size: '560M parameters'
  },
  'google/flan-t5-base': {
    id: 'google/flan-t5-base',
    name: 'FLAN-T5 Base',
    description: 'Google\'s instruction-tuned encoder-decoder model',
    capabilities: ['Text Generation', 'Instruction Following', 'Q&A'],
    size: '250M parameters'
  }
};

export const AVAILABLE_MODELS = Object.keys(MODEL_INFO) as Array<keyof typeof MODEL_INFO>;

export async function queryModel(
  prompt: string,
  model: string,
  apiKey: string // We'll keep this parameter for compatibility but won't use it
): Promise<LLMResponse> {
  try {
    const url = `${VLLM_API_URL}/generate`;
    console.log('Making request to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
        max_new_tokens: 100,
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error response:', errorData);
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}${
          errorData ? ` - ${JSON.stringify(errorData)}` : ''
        }`
      );
    }

    const data = await response.json();
    console.log('Success response:', data);

    return {
      text: data.text,
      model,
    };
  } catch (error) {
    console.error('Error in queryModel:', error);
    return {
      text: '',
      model,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
