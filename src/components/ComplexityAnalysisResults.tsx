import React from 'react';

interface ComplexityAnalysisResultsProps {
  analysis: any;
  isLoading: boolean;
}

interface ComplexityMetric {
  label: string;
  value: number | string;
  unit?: string;
  description?: string;
  color?: string;
}

const ComplexityAnalysisResults: React.FC<ComplexityAnalysisResultsProps> = ({
  analysis,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Analyzing Text Complexity...
            </h2>
          </div>
          <p className="text-gray-600 mb-6">Computing linguistic metrics and complexity scores</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Lexical Diversity', emoji: '📝', color: 'from-blue-200 to-blue-300' },
            { label: 'Syntactic Analysis', emoji: '🔗', color: 'from-green-200 to-green-300' },
            { label: 'Readability Scores', emoji: '👁️', color: 'from-purple-200 to-purple-300' },
            { label: 'Vocabulary Sophistication', emoji: '💭', color: 'from-orange-200 to-orange-300' }
          ].map((item, index) => (
            <div key={index} className={`bg-gradient-to-r ${item.color} rounded-xl p-4 animate-pulse`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl animate-bounce" style={{ animationDelay: `${index * 0.2}s` }}>
                  {item.emoji}
                </span>
                <span className="font-semibold text-gray-700">{item.label}</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-white bg-opacity-60 rounded"></div>
                <div className="h-3 bg-white bg-opacity-60 rounded w-4/5"></div>
                <div className="h-3 bg-white bg-opacity-60 rounded w-3/5"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-1 text-sm text-gray-500">
            <span className="animate-pulse">🧠</span>
            <span>Processing advanced linguistic analysis...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis || analysis.error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600">
          {analysis?.error || 'No analysis data available'}
        </div>
      </div>
    );
  }

  const renderComplexityScore = (score: number, level: string) => (
    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-white rounded-2xl p-6 mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-8 right-8 w-1 h-1 bg-white rounded-full animate-ping"></div>
        <div className="absolute bottom-6 left-12 w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
      </div>
      
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">🧠</span>
        Overall Complexity Score
      </h3>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="text-5xl font-bold animate-pulse">{score}</div>
          <div className="text-sm opacity-90 mt-1 font-medium">
            Complexity Level: <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full">{level}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-90 font-medium">Scale: 0-1</div>
          <div className="text-xs opacity-75">Higher = More Complex</div>
          {/* Circular progress indicator */}
          <div className="mt-2 relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="4" fill="none" opacity="0.3"/>
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                stroke="white" 
                strokeWidth="4" 
                fill="none"
                strokeDasharray={`${score * 175.9} 175.9`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {Math.round(score * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMetricCard = (title: string, metrics: ComplexityMetric[]) => (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <div key={index} className="text-sm">
            <div className="text-gray-600">{metric.label}</div>
            <div className={`font-semibold ${metric.color || 'text-gray-800'}`}>
              {typeof metric.value === 'number' ? metric.value.toFixed(3) : metric.value}
              {metric.unit && <span className="text-gray-500 ml-1">{metric.unit}</span>}
            </div>
            {metric.description && (
              <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderComparisonSection = () => {
    if (!analysis.complexity_difference) return null;

    return (
      <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚖️</span>
          Complexity Comparison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center transform hover:scale-105 transition-all duration-200">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="text-3xl font-bold text-blue-600 mb-1 animate-bounce">
                {analysis.complexity_difference}
              </div>
              <div className="text-sm text-gray-600 font-medium">Difference</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${analysis.complexity_difference * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="text-center transform hover:scale-105 transition-all duration-200">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="text-lg font-bold text-green-600 mb-1 flex items-center justify-center gap-1">
                <span className="text-xl">🏆</span>
                {analysis.more_complex_text}
              </div>
              <div className="text-sm text-gray-600 font-medium">More Complex</div>
              <div className="mt-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                Higher linguistic complexity
              </div>
            </div>
          </div>
          <div className="text-center transform hover:scale-105 transition-all duration-200">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="text-3xl font-bold text-purple-600 mb-1 animate-pulse">
                {analysis.complexity_gap}
              </div>
              <div className="text-sm text-gray-600 font-medium">Gap</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${analysis.complexity_gap * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBreakdownSection = () => {
    if (!analysis.text1_complexity?.complexity_breakdown) return null;

    const breakdown = analysis.text1_complexity.complexity_breakdown;
    const factors = [
      { label: 'Lexical Factor', value: breakdown.lexical_factor, color: 'text-blue-600', emoji: '📝', bg: 'bg-blue-50' },
      { label: 'Syntactic Factor', value: breakdown.syntactic_factor, color: 'text-green-600', emoji: '🔗', bg: 'bg-green-50' },
      { label: 'Readability Factor', value: breakdown.readability_factor, color: 'text-purple-600', emoji: '👁️', bg: 'bg-purple-50' },
      { label: 'Vocabulary Factor', value: breakdown.vocabulary_factor, color: 'text-orange-600', emoji: '💭', bg: 'bg-orange-50' }
    ];

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 hover:shadow-xl transition-all duration-300">
        <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Complexity Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factors.map((factor, index) => (
            <div key={index} className={`${factor.bg} rounded-xl p-4 transform hover:scale-105 transition-all duration-200`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{factor.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{factor.label}</span>
                </div>
                <div className={`font-bold text-lg ${factor.color}`}>
                  {factor.value.toFixed(3)}
                </div>
              </div>
              <div className="w-full bg-white bg-opacity-50 rounded-full h-3 relative overflow-hidden">
                <div
                  className={`h-3 rounded-full ${factor.color.replace('text-', 'bg-')} transition-all duration-1000 ease-out relative`}
                  style={{ width: `${factor.value * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white bg-opacity-30 animate-pulse"></div>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2 text-center">
                {Math.round(factor.value * 100)}% contribution
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDetailedMetrics = () => {
    if (!analysis.text1_complexity) return null;

    const text1 = analysis.text1_complexity;
    const text2 = analysis.text2_complexity;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lexical Diversity */}
        {text1.lexical_diversity && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg border border-blue-200 p-6 transform hover:scale-105 hover:shadow-xl transition-all duration-300 group">
            <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
              <span className="text-2xl group-hover:animate-spin">📝</span>
              Lexical Diversity
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white bg-opacity-60 rounded-lg p-3 hover:bg-opacity-80 transition-all">
                <span className="text-sm font-medium text-gray-700">Type-Token Ratio</span>
                <span className="font-bold text-blue-700 text-lg">{text1.lexical_diversity.type_token_ratio}</span>
              </div>
              <div className="flex justify-between items-center bg-white bg-opacity-60 rounded-lg p-3 hover:bg-opacity-80 transition-all">
                <span className="text-sm font-medium text-gray-700">Yule's K</span>
                <span className="font-bold text-blue-700 text-lg">{text1.lexical_diversity.yules_k}</span>
              </div>
              <div className="flex justify-between items-center bg-white bg-opacity-60 rounded-lg p-3 hover:bg-opacity-80 transition-all">
                <span className="text-sm font-medium text-gray-700">Diversity Level</span>
                <span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm">
                  {text1.lexical_diversity.diversity_level}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Readability Scores */}
        {text1.readability_scores && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-lg border border-green-200 p-6 transform hover:scale-105 hover:shadow-xl transition-all duration-300 group">
            <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
              <span className="text-2xl group-hover:animate-bounce">👁️</span>
              Readability Scores
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white bg-opacity-60 rounded-lg p-3 hover:bg-opacity-80 transition-all">
                <span className="text-sm font-medium text-gray-700">Flesch Reading Ease</span>
                <span className="font-bold text-green-700 text-lg">{text1.readability_scores.flesch_reading_ease}</span>
              </div>
              <div className="flex justify-between items-center bg-white bg-opacity-60 rounded-lg p-3 hover:bg-opacity-80 transition-all">
                <span className="text-sm font-medium text-gray-700">Grade Level</span>
                <span className="font-bold text-green-700 text-lg">{text1.readability_scores.flesch_grade_level}</span>
              </div>
              <div className="flex justify-between items-center bg-white bg-opacity-60 rounded-lg p-3 hover:bg-opacity-80 transition-all">
                <span className="text-sm font-medium text-gray-700">Readability Level</span>
                <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm animate-pulse">
                  {text1.readability_scores.readability_level}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Vocabulary Sophistication */}
        {text1.vocabulary_sophistication && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Vocabulary Sophistication</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Academic Vocabulary</span>
                <span className="font-semibold">{text1.vocabulary_sophistication.academic_vocabulary_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rare Words</span>
                <span className="font-semibold">{text1.vocabulary_sophistication.rare_word_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sophistication Level</span>
                <span className="font-semibold text-purple-600">{text1.vocabulary_sophistication.sophistication_level}</span>
              </div>
            </div>
          </div>
        )}

        {/* Syntactic Complexity */}
        {text1.syntactic_complexity && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Syntactic Complexity</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Sentence Length</span>
                <span className="font-semibold">{text1.syntactic_complexity.avg_sentence_length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subordination Ratio</span>
                <span className="font-semibold">{text1.syntactic_complexity.subordination_ratio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Syntactic Level</span>
                <span className="font-semibold text-orange-600">{text1.syntactic_complexity.syntactic_level}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Text Complexity Analysis</h2>
        
        {/* Overall Complexity Score */}
        {analysis.text1_complexity?.overall_complexity_score && (
          renderComplexityScore(
            analysis.text1_complexity.overall_complexity_score,
            analysis.text1_complexity.complexity_level
          )
        )}

        {/* Comparison Section */}
        {renderComparisonSection()}

        {/* Complexity Breakdown */}
        {renderBreakdownSection()}

        {/* Detailed Metrics */}
        {renderDetailedMetrics()}
      </div>
    </div>
  );
};

export default ComplexityAnalysisResults; 