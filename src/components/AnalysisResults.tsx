import React from 'react';

interface AnalysisResultsProps {
  results: any;
  isLoading: boolean;
}

export default function AnalysisResults({ results, isLoading }: AnalysisResultsProps) {
  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Analyzing responses...</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const { similarity_score, response1_metrics, response2_metrics, differences } = results;

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
      
      {/* Similarity Score */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Similarity Score</h4>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${similarity_score * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {Math.round(similarity_score * 100)}% similar
        </p>
      </div>

      {/* Readability Metrics */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Readability Metrics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium mb-1">Response 1</h5>
            <ul className="text-sm">
              <li>Avg. Sentence Length: {response1_metrics.readability.avg_sentence_length.toFixed(1)}</li>
              <li>Avg. Word Length: {response1_metrics.readability.avg_word_length.toFixed(1)}</li>
              <li>Lexical Diversity: {response1_metrics.readability.lexical_diversity.toFixed(2)}</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-medium mb-1">Response 2</h5>
            <ul className="text-sm">
              <li>Avg. Sentence Length: {response2_metrics.readability.avg_sentence_length.toFixed(1)}</li>
              <li>Avg. Word Length: {response2_metrics.readability.avg_word_length.toFixed(1)}</li>
              <li>Lexical Diversity: {response2_metrics.readability.lexical_diversity.toFixed(2)}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Sentiment Analysis</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium mb-1">Response 1</h5>
            <ul className="text-sm">
              <li>Positive: {response1_metrics.sentiment.pos.toFixed(2)}</li>
              <li>Neutral: {response1_metrics.sentiment.neu.toFixed(2)}</li>
              <li>Negative: {response1_metrics.sentiment.neg.toFixed(2)}</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-medium mb-1">Response 2</h5>
            <ul className="text-sm">
              <li>Positive: {response2_metrics.sentiment.pos.toFixed(2)}</li>
              <li>Neutral: {response2_metrics.sentiment.neu.toFixed(2)}</li>
              <li>Negative: {response2_metrics.sentiment.neg.toFixed(2)}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Key Phrases */}
      <div>
        <h4 className="font-medium mb-2">Key Phrases</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium mb-1">Response 1</h5>
            <ul className="text-sm">
              {response1_metrics.key_phrases.map(([phrase, score]: [string, number], index: number) => (
                <li key={index} className="flex justify-between">
                  <span>{phrase}</span>
                  <span className="text-gray-500">{score.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-medium mb-1">Response 2</h5>
            <ul className="text-sm">
              {response2_metrics.key_phrases.map(([phrase, score]: [string, number], index: number) => (
                <li key={index} className="flex justify-between">
                  <span>{phrase}</span>
                  <span className="text-gray-500">{score.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 