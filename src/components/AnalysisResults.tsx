import React from 'react';

interface AnalysisResultsProps {
  results: any;
  isLoading: boolean;
}

export default function AnalysisResults({ results, isLoading }: AnalysisResultsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-semibold text-gray-700">Analyzing responses...</span>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  // Handle error case
  if (results.error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Analysis Error</h3>
          <p className="text-gray-600">{results.error}</p>
        </div>
      </div>
    );
  }

  // Helper function to safely get percentage
  const getPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null) return 'N/A';
    return `${Math.round(value * 100)}%`;
  };

  // Helper function to safely get number with decimals
  const getNumber = (value: number | undefined | null, decimals: number = 1) => {
    if (value === undefined || value === null) return 'N/A';
    return value.toFixed(decimals);
  };

  // Helper function to safely get integer
  const getInteger = (value: number | undefined | null) => {
    if (value === undefined || value === null) return 'N/A';
    return value.toString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📊</span>
          Analysis Results
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Similarity Score */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-blue-500">🎯</span>
            Similarity Score
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Overall Similarity:</span>
              <span className="text-2xl font-bold text-blue-600">
                {getPercentage(results.similarity_score)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${results.similarity_score ? results.similarity_score * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Readability Metrics */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-green-500">📖</span>
              Response 1 Readability
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Avg. Sentence Length:</span>
                <span className="font-semibold text-gray-800">{getNumber(results.response1_metrics?.readability?.avg_sentence_length)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Word Count:</span>
                <span className="font-semibold text-gray-800">{getInteger(results.response1_metrics?.readability?.word_count)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Avg. Word Length:</span>
                <span className="font-semibold text-gray-800">{getNumber(results.response1_metrics?.readability?.avg_word_length)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Lexical Diversity:</span>
                <span className="font-semibold text-gray-800">{getNumber(results.response1_metrics?.readability?.lexical_diversity, 2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-purple-500">📖</span>
              Response 2 Readability
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Avg. Sentence Length:</span>
                <span className="font-semibold text-gray-800">{getNumber(results.response2_metrics?.readability?.avg_sentence_length)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Word Count:</span>
                <span className="font-semibold text-gray-800">{getInteger(results.response2_metrics?.readability?.word_count)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Avg. Word Length:</span>
                <span className="font-semibold text-gray-800">{getNumber(results.response2_metrics?.readability?.avg_word_length)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Lexical Diversity:</span>
                <span className="font-semibold text-gray-800">{getNumber(results.response2_metrics?.readability?.lexical_diversity, 2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-yellow-500">😊</span>
            Sentiment Analysis
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Response 1 Sentiment</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Positive:</span>
                  <span className="font-semibold text-green-600">{getPercentage(results.response1_metrics?.sentiment?.pos)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Neutral:</span>
                  <span className="font-semibold text-gray-600">{getPercentage(results.response1_metrics?.sentiment?.neu)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Negative:</span>
                  <span className="font-semibold text-red-600">{getPercentage(results.response1_metrics?.sentiment?.neg)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Compound:</span>
                  <span className="font-semibold text-blue-600">{getNumber(results.response1_metrics?.sentiment?.compound, 2)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Response 2 Sentiment</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Positive:</span>
                  <span className="font-semibold text-green-600">{getPercentage(results.response2_metrics?.sentiment?.pos)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Neutral:</span>
                  <span className="font-semibold text-gray-600">{getPercentage(results.response2_metrics?.sentiment?.neu)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Negative:</span>
                  <span className="font-semibold text-red-600">{getPercentage(results.response2_metrics?.sentiment?.neg)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Compound:</span>
                  <span className="font-semibold text-blue-600">{getNumber(results.response2_metrics?.sentiment?.compound, 2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Phrases */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-indigo-500">🔑</span>
            Key Phrases
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Response 1 Key Phrases</h4>
              <div className="flex flex-wrap gap-2">
                {results.response1_metrics?.key_phrases?.length > 0 ? (
                  results.response1_metrics.key_phrases.map((phrase: [string, number], index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                      title={`Score: ${phrase[1]?.toFixed(3) || 'N/A'}`}
                    >
                      {phrase[0]}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No key phrases detected</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Response 2 Key Phrases</h4>
              <div className="flex flex-wrap gap-2">
                {results.response2_metrics?.key_phrases?.length > 0 ? (
                  results.response2_metrics.key_phrases.map((phrase: [string, number], index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      title={`Score: ${phrase[1]?.toFixed(3) || 'N/A'}`}
                    >
                      {phrase[0]}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No key phrases detected</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 