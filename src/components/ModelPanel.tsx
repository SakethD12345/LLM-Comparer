import { useState } from 'react';
import { AVAILABLE_MODELS, MODEL_INFO } from '@/lib/api';
import { LLMResponse } from '@/types/api';

interface ModelPanelProps {
  modelNumber: number;
  onResponse: (response: LLMResponse) => void;
  otherResponse?: LLMResponse | null;
}

export default function ModelPanel({ modelNumber, onResponse, otherResponse }: ModelPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<LLMResponse | null>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      const llmResponse: LLMResponse = {
        text: data.response || data.text || '', // Try both possible response formats
        model: selectedModel,
      };
      console.log('Formatted Response:', llmResponse); // Debug log
      
      setResponse(llmResponse);
      onResponse(llmResponse);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorResponse: LLMResponse = {
        text: '',
        model: selectedModel,
        error: 'Failed to generate response',
      };
      setResponse(errorResponse);
      onResponse(errorResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const modelInfo = MODEL_INFO[selectedModel];

  return (
    <div className="p-6 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Model {modelNumber}</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Model
        </label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          {AVAILABLE_MODELS.map((model) => (
            <option key={model} value={model}>
              {MODEL_INFO[model].name}
            </option>
          ))}
        </select>
      </div>

      {modelInfo && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{modelInfo.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{modelInfo.description}</p>
          <div className="mb-2">
            <span className="text-sm font-medium">Size: </span>
            <span className="text-sm text-gray-600">{modelInfo.size}</span>
          </div>
          <div>
            <span className="text-sm font-medium">Capabilities: </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {modelInfo.capabilities.map((capability) => (
                <span
                  key={capability}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full h-32 p-4 mb-4 border rounded-lg"
        placeholder="Enter your prompt here..."
      />

      <button
        onClick={handleSubmit}
        disabled={isLoading || !prompt.trim()}
        className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 mb-4"
      >
        {isLoading ? 'Generating...' : 'Generate Response'}
      </button>

      {response && (
        <div className="mt-4 p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Response:</h3>
          {response.error ? (
            <p className="text-red-500">{response.error}</p>
          ) : (
            <p className="whitespace-pre-wrap">{response.text}</p>
          )}
        </div>
      )}
    </div>
  );
} 