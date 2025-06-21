import React, { useState } from 'react';

interface AdvancedAnalysisResultsProps {
  results: any;
  isLoading: boolean;
}

// Tooltip component for explanations
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 w-64 p-3 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-full ml-2">
          {content}
          <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

// Clickable term component with modal
const TermWithModal = ({ term, description, children }: { 
  term: string; 
  description: string; 
  children: React.ReactNode;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-blue-600 hover:text-blue-800 underline decoration-dotted"
      >
        {children}
      </button>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800">{term}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 leading-relaxed">{description}</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default function AdvancedAnalysisResults({ results, isLoading }: AdvancedAnalysisResultsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-semibold text-gray-700">Performing advanced analysis...</span>
        </div>
      </div>
    );
  }

  if (!results || results.error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Advanced Analysis Error</h3>
          <p className="text-gray-600">{results?.error || 'No results available'}</p>
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

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🧠</span>
          Advanced Analysis Results
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Semantic Similarity */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-blue-500">🔗</span>
            <Tooltip content="Measures how similar two texts are in meaning, not just word overlap. Higher scores indicate more similar content.">
              <span>Semantic Similarity Analysis</span>
            </Tooltip>
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  <TermWithModal 
                    term="TF-IDF Similarity" 
                    description="Term Frequency-Inverse Document Frequency similarity measures how important words are in both texts. It considers word frequency and rarity across documents, providing a statistical measure of text similarity."
                  >
                    TF-IDF Similarity:
                  </TermWithModal>
                </span>
                <span className="font-semibold text-gray-800">
                  {getPercentage(results.similarity_scores?.tfidf_similarity)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${results.similarity_scores?.tfidf_similarity ? results.similarity_scores.tfidf_similarity * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  <TermWithModal 
                    term="LSI Similarity" 
                    description="Latent Semantic Indexing similarity uses dimensionality reduction to capture hidden semantic relationships between words. It can identify similar meanings even when different words are used."
                  >
                    LSI Similarity:
                  </TermWithModal>
                </span>
                <span className="font-semibold text-gray-800">
                  {getPercentage(results.similarity_scores?.lsi_similarity)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${results.similarity_scores?.lsi_similarity ? results.similarity_scores.lsi_similarity * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Average Similarity:</span>
              <span className="text-2xl font-bold text-blue-600">
                {getPercentage(results.similarity_scores?.average_similarity)}
              </span>
            </div>
          </div>
        </div>

        {/* Named Entity Recognition */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-green-500">🏷️</span>
            <Tooltip content="Identifies and categorizes named entities like people, organizations, locations, and dates in the text.">
              <span>Named Entity Recognition</span>
            </Tooltip>
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Response 1 Entities</h4>
              {results.named_entities?.text1 && Object.keys(results.named_entities.text1).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(results.named_entities.text1).map(([entityType, entities]) => (
                    <div key={entityType} className="bg-white p-3 rounded-lg border">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        <TermWithModal 
                          term={entityType} 
                          description={`${entityType} entities are specific named instances of this category found in the text. For example, PERSON includes names of people, ORG includes company names, etc.`}
                        >
                          {entityType}
                        </TermWithModal>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(entities as string[]).map((entity, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                          >
                            {entity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No named entities detected</p>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Response 2 Entities</h4>
              {results.named_entities?.text2 && Object.keys(results.named_entities.text2).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(results.named_entities.text2).map(([entityType, entities]) => (
                    <div key={entityType} className="bg-white p-3 rounded-lg border">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        <TermWithModal 
                          term={entityType} 
                          description={`${entityType} entities are specific named instances of this category found in the text. For example, PERSON includes names of people, ORG includes company names, etc.`}
                        >
                          {entityType}
                        </TermWithModal>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(entities as string[]).map((entity, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                          >
                            {entity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No named entities detected</p>
              )}
            </div>
          </div>
          {results.named_entities?.overlap_analysis?.common_entities?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2">Common Entities</h4>
              <div className="flex flex-wrap gap-2">
                {results.named_entities.overlap_analysis.common_entities.map((entity: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Topic Modeling */}
        {results.topic_modeling?.topics && (
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-orange-500">📊</span>
              <Tooltip content="Identifies the main themes or topics present in the text using machine learning algorithms.">
                <span>Topic Modeling Analysis</span>
              </Tooltip>
            </h3>
            <div className="space-y-4">
              {results.topic_modeling.topics.map((topic: any) => (
                <div key={topic.topic_id} className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-700 mb-2">Topic {topic.topic_id + 1}</h4>
                  <div className="flex flex-wrap gap-2">
                    {topic.top_words?.slice(0, 8).map((word: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs"
                        title={`Weight: ${topic.word_weights?.[idx]?.toFixed(3) || 'N/A'}`}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {results.topic_modeling.topic_distributions?.length >= 2 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Response 1 Topic Distribution</h4>
                    <div className="space-y-1">
                      {results.topic_modeling.topic_distributions[0].topic_distribution.map((weight: number, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>Topic {idx + 1}:</span>
                          <span className="font-medium">{getPercentage(weight)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Response 2 Topic Distribution</h4>
                    <div className="space-y-1">
                      {results.topic_modeling.topic_distributions[1].topic_distribution.map((weight: number, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>Topic {idx + 1}:</span>
                          <span className="font-medium">{getPercentage(weight)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text Complexity Comparison */}
        {results.text_complexity && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-indigo-500">📈</span>
              <Tooltip content="Analyzes the complexity and readability of the text using various linguistic metrics.">
                <span>Text Complexity Analysis</span>
              </Tooltip>
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Response 1 Complexity</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      <TermWithModal 
                        term="Flesch Reading Ease Score" 
                        description="A readability metric that scores text on a scale of 0-100. Higher scores (60-70) indicate easier reading, while lower scores (0-30) indicate more complex text. Scores are based on average sentence length and average syllables per word."
                      >
                        Flesch Score:
                      </TermWithModal>
                    </span>
                    <span className="font-semibold text-gray-800">
                      {getNumber(results.text_complexity.text1?.flesch_reading_ease)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      <TermWithModal 
                        term="Vocabulary Diversity" 
                        description="Measures the variety of unique words used in the text. Higher percentages indicate more diverse vocabulary, suggesting more sophisticated language use."
                      >
                        Vocabulary Diversity:
                      </TermWithModal>
                    </span>
                    <span className="font-semibold text-gray-800">
                      {getPercentage(results.text_complexity.text1?.vocabulary_diversity)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg. Word Length:</span>
                    <span className="font-semibold text-gray-800">
                      {getNumber(results.text_complexity.text1?.avg_word_length)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Response 2 Complexity</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      <TermWithModal 
                        term="Flesch Reading Ease Score" 
                        description="A readability metric that scores text on a scale of 0-100. Higher scores (60-70) indicate easier reading, while lower scores (0-30) indicate more complex text. Scores are based on average sentence length and average syllables per word."
                      >
                        Flesch Score:
                      </TermWithModal>
                    </span>
                    <span className="font-semibold text-gray-800">
                      {getNumber(results.text_complexity.text2?.flesch_reading_ease)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      <TermWithModal 
                        term="Vocabulary Diversity" 
                        description="Measures the variety of unique words used in the text. Higher percentages indicate more diverse vocabulary, suggesting more sophisticated language use."
                      >
                        Vocabulary Diversity:
                      </TermWithModal>
                    </span>
                    <span className="font-semibold text-gray-800">
                      {getPercentage(results.text_complexity.text2?.vocabulary_diversity)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg. Word Length:</span>
                    <span className="font-semibold text-gray-800">
                      {getNumber(results.text_complexity.text2?.avg_word_length)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 