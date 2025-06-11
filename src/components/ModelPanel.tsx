import { useState } from 'react';
import { AVAILABLE_MODELS } from '@/lib/api';
import { LLMResponse } from '@/types/api';

interface ModelPanelProps {
  modelNumber: number;
  onResponse: (response: LLMResponse) => void;
}

export default function ModelPanel({ modelNumber, onResponse }: ModelPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<LLMResponse | null>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
      if (!apiKey) {
        throw new Error('API key not found');
      }

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

      const data = await response.json();
      setResponse(data);
      onResponse(data);
    } catch (error) {
      console.error('Error generating response:', error);
      setResponse({
        text: '',
        model: selectedModel,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Model {modelNumber}</h2>
      
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="w-full p-2 mb-4 border rounded-lg"
      >
        {AVAILABLE_MODELS.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full h-32 p-4 mb-4 border rounded-lg"
        placeholder="Enter your prompt here..."
      />

      <button
        onClick={handleSubmit}
        disabled={isLoading || !prompt.trim()}
        className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
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