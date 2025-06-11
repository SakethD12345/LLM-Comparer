'use client';

import { useState } from 'react';
import ModelPanel from '@/components/ModelPanel';
import { LLMResponse, ComparisonResult } from '@/types/api';

export default function Home() {
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);

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

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">LLM Comparer</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ModelPanel modelNumber={1} onResponse={(r) => handleResponse(1, r)} />
          <ModelPanel modelNumber={2} onResponse={(r) => handleResponse(2, r)} />
        </div>

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
    </main>
  );
} 