export interface LLMResponse {
  text: string;
  model: string;
  error?: string;
}

export interface ComparisonResult {
  model1: LLMResponse;
  model2: LLMResponse;
  timestamp: string;
} 