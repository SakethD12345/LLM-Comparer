import { useState } from 'react';
import { AVAILABLE_MODELS, MODEL_INFO } from '@/lib/api';
import { LLMResponse } from '@/types/api';
import AnalysisResults from './AnalysisResults';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

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

  const handleAnalyze = async () => {
    if (!response || !otherResponse) return;

    setIsAnalyzing(true);
    try {
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response1: response.text,
          response2: otherResponse.text,
          model1: response.model,
          model2: otherResponse.model,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze responses');
      }

      const data = await analysisResponse.json();
      setAnalysisResults(data);
    } catch (error) {
      console.error('Error analyzing responses:', error);
    } finally {
      setIsAnalyzing(false);
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

      {response && otherResponse && (
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full p-2 mt-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300"
        >
          {isAnalyzing ? 'Analyzing...' : 'Compare Responses'}
        </button>
      )}

      <AnalysisResults results={analysisResults} isLoading={isAnalyzing} />
    </div>
  );
} 