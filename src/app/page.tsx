'use client';

import { useState, useEffect } from 'react';
import ModelPanel from '@/components/ModelPanel';
import StorageTest from '@/components/StorageTest';
import { LLMResponse, ComparisonResult } from '@/types/api';
import { saveComparisonResults, loadComparisonResults } from '@/lib/storage';
import AnalysisResults from '@/components/AnalysisResults';
import AdvancedAnalysisResults from '@/components/AdvancedAnalysisResults';

export default function Home() {
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [response1, setResponse1] = useState<LLMResponse | null>(null);
  const [response2, setResponse2] = useState<LLMResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [useAdvancedAnalysis, setUseAdvancedAnalysis] = useState(false);

  // Load saved results on component mount
  useEffect(() => {
    const savedResults = loadComparisonResults();
    if (savedResults.length > 0) {
      setComparisonResults(savedResults);
    }
  }, []);

  // Save results whenever they change
  useEffect(() => {
    if (comparisonResults.length > 0) {
      saveComparisonResults(comparisonResults);
    }
  }, [comparisonResults]);

  const handleResponse = (modelNumber: number, response: LLMResponse) => {
    setComparisonResults((prev) => {
      const newResults = [...prev];
      const currentResult = newResults[newResults.length - 1] || {
        model1: { text: '', model: '' },
        model2: { text: '', model: '' },
        timestamp: new Date().toISOString(),
      };

      if (modelNumber === 1) {
        currentResult.model1 = response;
      } else {
        currentResult.model2 = response;
      }

      if (newResults.length === 0) {
        newResults.push(currentResult);
      } else {
        newResults[newResults.length - 1] = currentResult;
      }

      return newResults;
    });
  };

  const handleAnalyze = async () => {
    if (!response1 || !response2) return;

    setIsAnalyzing(true);
    try {
      const endpoint = useAdvancedAnalysis ? '/api/advanced-analyze' : '/api/analyze';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response1: response1.text,
          response2: response2.text,
          model1: response1.model,
          model2: response2.model,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const results = await response.json();
      setAnalysisResults(results);
    } catch (error) {
      console.error('Error analyzing responses:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearHistory = () => {
    setComparisonResults([]);
    localStorage.removeItem('llm-comparer-history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            LLM Comparer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Compare responses from different language models side by side. 
            Generate responses, analyze similarities, and gain insights into model performance.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <ModelPanel 
            modelNumber={1} 
            onResponse={setResponse1}
            otherResponse={response2}
          />
          <ModelPanel 
            modelNumber={2} 
            onResponse={setResponse2}
            otherResponse={response1}
          />
        </div>

        {/* Analysis Controls */}
        {response1 && response2 && (
          <div className="flex flex-col items-center mb-8 space-y-4">
            {/* Analysis Type Toggle */}
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Analysis Type:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setUseAdvancedAnalysis(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      !useAdvancedAnalysis
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Basic
                  </button>
                  <button
                    onClick={() => setUseAdvancedAnalysis(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      useAdvancedAnalysis
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Advanced
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {useAdvancedAnalysis 
                  ? 'Advanced analysis includes NER, topic modeling, and semantic similarity'
                  : 'Basic analysis includes sentiment, readability, and key phrases'
                }
              </p>
            </div>

            {/* Compare Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`px-8 py-4 text-white rounded-xl font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                useAdvancedAnalysis
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
              }`}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white">
                    {useAdvancedAnalysis ? 'Performing Advanced Analysis...' : 'Analyzing...'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{useAdvancedAnalysis ? '🧠' : '🔍'}</span>
                  <span className="text-white">
                    {useAdvancedAnalysis ? 'Advanced Analysis' : 'Compare Responses'}
                  </span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResults && (
          <div className="max-w-6xl mx-auto">
            {useAdvancedAnalysis ? (
              <AdvancedAnalysisResults results={analysisResults} isLoading={isAnalyzing} />
            ) : (
              <AnalysisResults results={analysisResults} isLoading={isAnalyzing} />
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500">
            Built with Next.js, FastAPI, and Ollama • 
            <a href="https://github.com/SakethD12345/LLM-Comparer" className="text-blue-500 hover:text-blue-600 ml-1">
              View on GitHub
            </a>
          </p>
        </div>
      </div>
      <StorageTest />
    </div>
  );
} 