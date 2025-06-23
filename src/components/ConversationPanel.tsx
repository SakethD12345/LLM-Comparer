import React, { useState } from 'react';
import { Conversation, ConversationTurn } from '@/types/api';
import ConversationAnalysis from './ConversationAnalysis';
import { AVAILABLE_MODELS, MODEL_INFO } from '@/lib/api';

interface ConversationPanelProps {
  conversation: Conversation;
  onSendMessage: (message: string) => void;
  onNewConversation: () => void;
  onUpdateModels: (model1: string, model2: string) => void;
  isLoading?: boolean;
}

export default function ConversationPanel({ 
  conversation, 
  onSendMessage, 
  onNewConversation,
  onUpdateModels,
  isLoading = false 
}: ConversationPanelProps) {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis'>('chat');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedModel1, setSelectedModel1] = useState(conversation.model1);
  const [selectedModel2, setSelectedModel2] = useState(conversation.model2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleModelUpdate = () => {
    if (selectedModel1 !== conversation.model1 || selectedModel2 !== conversation.model2) {
      onUpdateModels(selectedModel1, selectedModel2);
    }
    setShowModelSelector(false);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getModelColor = (model: string) => {
    return model === conversation.model1 ? 'text-blue-600' : 'text-purple-600';
  };

  const getModelBgColor = (model: string) => {
    return model === conversation.model1 ? 'bg-blue-50' : 'bg-purple-50';
  };

  const getModelBorderColor = (model: string) => {
    return model === conversation.model1 ? 'border-blue-200' : 'border-purple-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>💬</span>
            Conversation
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModelSelector(true)}
              className="px-3 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all text-sm"
            >
              Change Models
            </button>
            <button
              onClick={onNewConversation}
              className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all"
            >
              New Chat
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 text-white text-sm">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
            {conversation.model1}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-purple-400 rounded-full"></span>
            {conversation.model2}
          </span>
        </div>
      </div>

      {/* Model Selector Modal */}
      {showModelSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800">Select Models</h3>
              <button
                onClick={() => setShowModelSelector(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model 1 (Blue)
                </label>
                <select
                  value={selectedModel1}
                  onChange={(e) => setSelectedModel1(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <option key={model} value={model} disabled={model === selectedModel2}>
                      {MODEL_INFO[model].name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model 2 (Purple)
                </label>
                <select
                  value={selectedModel2}
                  onChange={(e) => setSelectedModel2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <option key={model} value={model} disabled={model === selectedModel1}>
                      {MODEL_INFO[model].name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModelSelector(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleModelUpdate}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                Update Models
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'chat'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'analysis'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 Analysis
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' ? (
        <>
          {/* Conversation History */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {conversation.turns.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">💬</div>
                <p>Start a conversation by sending a message below</p>
              </div>
            ) : (
              conversation.turns.map((turn) => (
                <div
                  key={turn.turnId}
                  className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      turn.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : turn.error
                        ? 'bg-red-50 border border-red-200'
                        : `${getModelBgColor(turn.model || '')} ${getModelBorderColor(turn.model || '')} border`
                    }`}
                  >
                    {turn.role === 'assistant' && turn.model && (
                      <div className={`text-xs font-medium mb-1 ${turn.error ? 'text-red-600' : getModelColor(turn.model)}`}>
                        {turn.model}
                      </div>
                    )}
                    {turn.error && (
                      <div className="text-xs font-medium mb-1 text-red-600 flex items-center gap-1">
                        <span>⚠️</span>
                        Error
                      </div>
                    )}
                    <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                      turn.error ? 'text-red-700' : turn.role === 'user' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {turn.content}
                    </div>
                    <div className={`text-xs mt-2 ${
                      turn.role === 'user' ? 'text-blue-100' : turn.error ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {formatTimestamp(turn.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Models are thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-100 p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>
        </>
      ) : (
        /* Analysis Tab */
        <div className="p-6">
          <ConversationAnalysis conversation={conversation} />
        </div>
      )}
    </div>
  );
} 