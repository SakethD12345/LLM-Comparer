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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
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
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-2">Overall Complexity Score</h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold">{score}</div>
          <div className="text-sm opacity-90">Complexity Level: {level}</div>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-90">Scale: 0-1</div>
          <div className="text-xs opacity-75">Higher = More Complex</div>
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
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Complexity Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analysis.complexity_difference}
            </div>
            <div className="text-sm text-gray-600">Difference</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {analysis.more_complex_text}
            </div>
            <div className="text-sm text-gray-600">More Complex</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">
              {analysis.complexity_gap}
            </div>
            <div className="text-sm text-gray-600">Gap</div>
          </div>
        </div>
      </div>
    );
  };

  const renderBreakdownSection = () => {
    if (!analysis.text1_complexity?.complexity_breakdown) return null;

    const breakdown = analysis.text1_complexity.complexity_breakdown;
    const factors = [
      { label: 'Lexical Factor', value: breakdown.lexical_factor, color: 'text-blue-600' },
      { label: 'Syntactic Factor', value: breakdown.syntactic_factor, color: 'text-green-600' },
      { label: 'Readability Factor', value: breakdown.readability_factor, color: 'text-purple-600' },
      { label: 'Vocabulary Factor', value: breakdown.vocabulary_factor, color: 'text-orange-600' }
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Complexity Breakdown</h4>
        <div className="space-y-3">
          {factors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{factor.label}</span>
              <div className="flex items-center space-x-2">
                <div className={`font-semibold ${factor.color}`}>
                  {factor.value.toFixed(3)}
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${factor.color.replace('text-', 'bg-')}`}
                    style={{ width: `${factor.value * 100}%` }}
                  ></div>
                </div>
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
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Lexical Diversity</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type-Token Ratio</span>
                <span className="font-semibold">{text1.lexical_diversity.type_token_ratio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Yule's K</span>
                <span className="font-semibold">{text1.lexical_diversity.yules_k}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Diversity Level</span>
                <span className="font-semibold text-blue-600">{text1.lexical_diversity.diversity_level}</span>
              </div>
            </div>
          </div>
        )}

        {/* Readability Scores */}
        {text1.readability_scores && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Readability Scores</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Flesch Reading Ease</span>
                <span className="font-semibold">{text1.readability_scores.flesch_reading_ease}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Grade Level</span>
                <span className="font-semibold">{text1.readability_scores.flesch_grade_level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Readability Level</span>
                <span className="font-semibold text-green-600">{text1.readability_scores.readability_level}</span>
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