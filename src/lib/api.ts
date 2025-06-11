import { LLMResponse } from '@/types/api';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';

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
export const AVAILABLE_MODELS = [
  'gpt2',
  'facebook/opt-125m',
  'EleutherAI/gpt-neo-125M',
] as const; 