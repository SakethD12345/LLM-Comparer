'use client';

import { useState, useEffect } from 'react';
import { saveComparisonResults, loadComparisonResults } from '@/lib/storage';
import { ComparisonResult } from '@/types/api';

export default function StorageTest() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = () => {
    const results: string[] = [];
    
    // Test 1: Save and load
    try {
      const testData: ComparisonResult[] = [{
        model1: { text: 'Test 1', model: 'gpt2' },
        model2: { text: 'Test 2', model: 'opt-125m' },
        timestamp: new Date().toISOString(),
      }];
      
      saveComparisonResults(testData);
      const loaded = loadComparisonResults();
      
      if (JSON.stringify(loaded) === JSON.stringify(testData)) {
        results.push('✅ Save and load test passed');
      } else {
        results.push('❌ Save and load test failed');
      }
    } catch (error) {
      results.push(`❌ Save and load test error: ${error}`);
    }

    // Test 2: Clear storage
    try {
      localStorage.removeItem('llm-comparer-history');
      const loaded = loadComparisonResults();
      if (loaded.length === 0) {
        results.push('✅ Clear storage test passed');
      } else {
        results.push('❌ Clear storage test failed');
      }
    } catch (error) {
      results.push(`❌ Clear storage test error: ${error}`);
    }

    // Test 3: Invalid data handling
    try {
      localStorage.setItem('llm-comparer-history', 'invalid-json');
      const loaded = loadComparisonResults();
      if (loaded.length === 0) {
        results.push('✅ Invalid data handling test passed');
      } else {
        results.push('❌ Invalid data handling test failed');
      }
    } catch (error) {
      results.push(`❌ Invalid data handling test error: ${error}`);
    }

    setTestResults(results);
  };

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white border rounded-lg shadow-lg">
      <button
        onClick={runTests}
        className="mb-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Run Storage Tests
      </button>
      {testResults.length > 0 && (
        <div className="mt-2">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <ul className="space-y-1">
            {testResults.map((result, index) => (
              <li key={index} className="text-sm">{result}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 