import { useState, useEffect } from 'react';
import { AVAILABLE_MODELS, MODEL_INFO } from '@/lib/api';
import { LLMResponse } from '@/types/api';

interface ModelPanelProps {
  modelNumber: number;
  onResponse: (response: LLMResponse) => void;
  otherResponse?: LLMResponse | null;
}

interface LiteLLMModel {
  provider: string;
  model: string;
  display_name: string;
  requires_api_key: boolean;
}

export default function ModelPanel({ modelNumber, onResponse, otherResponse }: ModelPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<LLMResponse | null>(null);
  const [backend, setBackend] = useState<'ollama' | 'litellm'>('ollama');
  const [litellmModels, setLitellmModels] = useState<LiteLLMModel[]>([]);
  const [selectedLiteLLMModel, setSelectedLiteLLMModel] = useState<string>('');

  useEffect(() => {
    if (backend === 'litellm') {
      fetchLiteLLMModels();
    }
  }, [backend]);

  const fetchLiteLLMModels = async () => {
    try {
      const response = await fetch('/api/generate');
      const data = await response.json();
      setLitellmModels(data.models || []);
      if (data.models && data.models.length > 0) {
        setSelectedLiteLLMModel(data.models[0].model);
      }
    } catch (error) {
      console.error('Failed to fetch LiteLLM models:', error);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const modelToUse = backend === 'litellm' ? selectedLiteLLMModel : selectedModel;
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: modelToUse,
          backend,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      const llmResponse: LLMResponse = {
        text: data.response || data.text || '', // Try both possible response formats
        model: modelToUse,
      };
      console.log('Formatted Response:', llmResponse); // Debug log
      
      setResponse(llmResponse);
      onResponse(llmResponse);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorResponse: LLMResponse = {
        text: '',
        model: backend === 'litellm' ? selectedLiteLLMModel : selectedModel,
        error: error instanceof Error ? error.message : 'Failed to generate response',
      };
      setResponse(errorResponse);
      onResponse(errorResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const modelInfo = backend === 'ollama' ? MODEL_INFO[selectedModel] : null;
  const currentLiteLLMModel = litellmModels.find(m => m.model === selectedLiteLLMModel);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-bold">
            {modelNumber}
          </div>
          Model {modelNumber}
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Backend Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            🔧 Backend Provider
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setBackend('ollama')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                backend === 'ollama'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ollama (Local)
            </button>
            <button
              onClick={() => setBackend('litellm')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                backend === 'litellm'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              LiteLLM (Multi-Provider)
            </button>
          </div>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            🤖 Select Model
          </label>
          {backend === 'ollama' ? (
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model} value={model}>
                  {MODEL_INFO[model].name}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedLiteLLMModel}
              onChange={(e) => setSelectedLiteLLMModel(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              disabled={litellmModels.length === 0}
            >
              {litellmModels.length === 0 ? (
                <option>Loading models...</option>
              ) : (
                litellmModels.map((model) => (
                  <option key={model.model} value={model.model}>
                    {model.display_name} ({model.provider})
                    {model.requires_api_key && ' - API Key Required'}
                  </option>
                ))
              )}
            </select>
          )}
        </div>

        {/* Model Info Card */}
        {backend === 'ollama' && modelInfo && (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-blue-500">📊</span>
              {modelInfo.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{modelInfo.description}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">📏 Size:</span>
                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-md">{modelInfo.size}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">🚀 Capabilities:</span>
                <div className="flex flex-wrap gap-2">
                  {modelInfo.capabilities.map((capability) => (
                    <span
                      key={capability}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {backend === 'litellm' && currentLiteLLMModel && (
          <div className="bg-gradient-to-br from-gray-50 to-purple-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-purple-500">🚀</span>
              {currentLiteLLMModel.display_name}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">🏢 Provider:</span>
                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-md capitalize">{currentLiteLLMModel.provider}</span>
              </div>
              {currentLiteLLMModel.requires_api_key && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">🔑 Status:</span>
                  <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded-md">API Key Required</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            💭 Enter Your Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            placeholder="Type your prompt here... (e.g., 'Explain quantum computing in simple terms')"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating Response...
            </div>
          ) : (
            '✨ Generate Response'
          )}
        </button>

        {/* Response Display */}
        {response && (
          <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <span className="text-green-500">💬</span>
              Response
            </h3>
            {response.error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-medium">❌ {response.error}</p>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{response.text}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 