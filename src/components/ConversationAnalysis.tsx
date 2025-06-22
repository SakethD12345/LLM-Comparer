import React from 'react';
import { Conversation, ConversationTurn } from '@/types/api';

interface ConversationAnalysisProps {
  conversation: Conversation;
}

export default function ConversationAnalysis({ conversation }: ConversationAnalysisProps) {
  const userTurns = conversation.turns.filter(turn => turn.role === 'user');
  const model1Turns = conversation.turns.filter(turn => turn.role === 'assistant' && turn.model === conversation.model1);
  const model2Turns = conversation.turns.filter(turn => turn.role === 'assistant' && turn.model === conversation.model2);

  const getAverageResponseLength = (turns: ConversationTurn[]) => {
    if (turns.length === 0) return 0;
    const totalLength = turns.reduce((sum, turn) => sum + turn.content.length, 0);
    return Math.round(totalLength / turns.length);
  };

  const getResponseTimePattern = () => {
    const assistantTurns = conversation.turns.filter(turn => turn.role === 'assistant');
    if (assistantTurns.length < 2) return 'Insufficient data';

    const responseTimes: number[] = [];
    for (let i = 1; i < conversation.turns.length; i++) {
      if (conversation.turns[i].role === 'assistant') {
        const prevTurn = conversation.turns[i - 1];
        const currentTurn = conversation.turns[i];
        const timeDiff = new Date(currentTurn.timestamp).getTime() - new Date(prevTurn.timestamp).getTime();
        responseTimes.push(timeDiff);
      }
    }

    const avgTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return `${Math.round(avgTime / 1000)}s average`;
  };

  const getConversationFlow = () => {
    const flow = conversation.turns.map(turn => ({
      role: turn.role,
      model: turn.model,
      length: turn.content.length,
      timestamp: turn.timestamp
    }));

    return flow;
  };

  const getModelConsistency = (modelTurns: ConversationTurn[]) => {
    if (modelTurns.length < 2) return 'Insufficient data';
    
    const lengths = modelTurns.map(turn => turn.content.length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    const coefficient = (stdDev / avgLength) * 100;
    
    if (coefficient < 20) return 'Very Consistent';
    if (coefficient < 40) return 'Consistent';
    if (coefficient < 60) return 'Moderate';
    return 'Variable';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📊</span>
          Conversation Analysis
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-2">Total Turns</h3>
            <p className="text-2xl font-bold text-blue-600">{conversation.turns.length}</p>
            <p className="text-sm text-gray-600">
              {userTurns.length} user, {model1Turns.length + model2Turns.length} assistant
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl border border-green-100">
            <h3 className="font-semibold text-gray-800 mb-2">Duration</h3>
            <p className="text-2xl font-bold text-green-600">
              {conversation.turns.length > 1 
                ? `${Math.round((new Date(conversation.turns[conversation.turns.length - 1].timestamp).getTime() - new Date(conversation.turns[0].timestamp).getTime()) / 1000 / 60)}m`
                : '0m'
              }
            </p>
            <p className="text-sm text-gray-600">Total conversation time</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
            <h3 className="font-semibold text-gray-800 mb-2">Avg Response Time</h3>
            <p className="text-2xl font-bold text-purple-600">{getResponseTimePattern()}</p>
            <p className="text-sm text-gray-600">Between turns</p>
          </div>
        </div>

        {/* Model Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-blue-500">🤖</span>
              {conversation.model1} Analysis
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Response Count:</span>
                <span className="font-semibold text-gray-800">{model1Turns.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Length:</span>
                <span className="font-semibold text-gray-800">{getAverageResponseLength(model1Turns)} chars</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Consistency:</span>
                <span className="font-semibold text-gray-800">{getModelConsistency(model1Turns)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-purple-500">🤖</span>
              {conversation.model2} Analysis
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Response Count:</span>
                <span className="font-semibold text-gray-800">{model2Turns.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Length:</span>
                <span className="font-semibold text-gray-800">{getAverageResponseLength(model2Turns)} chars</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Consistency:</span>
                <span className="font-semibold text-gray-800">{getModelConsistency(model2Turns)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Flow Visualization */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-gray-500">📈</span>
            Conversation Flow
          </h3>
          <div className="space-y-2">
            {getConversationFlow().map((turn, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  turn.role === 'user' 
                    ? 'bg-blue-500' 
                    : turn.model === conversation.model1 
                      ? 'bg-blue-400' 
                      : 'bg-purple-400'
                }`}></div>
                <span className="text-sm font-medium text-gray-700 min-w-[60px]">
                  {turn.role === 'user' ? 'User' : turn.model}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((turn.length / 500) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 min-w-[40px]">
                  {turn.length}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Bar length represents response length (max 500 chars)
          </p>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-yellow-500">💡</span>
            Key Insights
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• {conversation.model1} provided {model1Turns.length} responses with {getModelConsistency(model1Turns).toLowerCase()} consistency</p>
            <p>• {conversation.model2} provided {model2Turns.length} responses with {getModelConsistency(model2Turns).toLowerCase()} consistency</p>
            <p>• Average response length: {conversation.model1} ({getAverageResponseLength(model1Turns)} chars) vs {conversation.model2} ({getAverageResponseLength(model2Turns)} chars)</p>
            <p>• Conversation spans {conversation.turns.length} total interactions</p>
          </div>
        </div>
      </div>
    </div>
  );
} 