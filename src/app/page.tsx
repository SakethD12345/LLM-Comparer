'use client';

import { useState, useEffect } from 'react';
import ModelPanel from '@/components/ModelPanel';
import StorageTest from '@/components/StorageTest';
import { LLMResponse, ComparisonResult } from '@/types/api';
import { saveComparisonResults, loadComparisonResults } from '@/lib/storage';
import AnalysisResults from '@/components/AnalysisResults';

export default function Home() {
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [response1, setResponse1] = useState<LLMResponse | null>(null);
  const [response2, setResponse2] = useState<LLMResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

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
      const analysisResponse = await fetch('/api/analyze', {
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

  const clearHistory = () => {
    setComparisonResults([]);
    localStorage.removeItem('llm-comparer-history');
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">LLM Comparer</h1>
          {comparisonResults.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
            >
              Clear History
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

        {response1 && response2 && (
          <div className="flex justify-center mb-8">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300"
            >
              {isAnalyzing ? 'Analyzing...' : 'Compare Responses'}
            </button>
          </div>
        )}

        <AnalysisResults results={analysisResults} isLoading={isAnalyzing} />

        {comparisonResults.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Comparison History</h2>
            <div className="space-y-4">
              {comparisonResults.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(result.timestamp).toLocaleString()}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Model 1 ({result.model1.model})</h3>
                      <p className="whitespace-pre-wrap">{result.model1.text}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Model 2 ({result.model2.model})</h3>
                      <p className="whitespace-pre-wrap">{result.model2.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <StorageTest />
    </main>
  );
} 