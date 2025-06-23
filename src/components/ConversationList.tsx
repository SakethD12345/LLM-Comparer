import React, { useState } from 'react';
import { Conversation } from '@/types/api';
import { AVAILABLE_MODELS, MODEL_INFO } from '@/lib/api';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void;
  onNewConversation: (model1?: string, model2?: string) => void;
}

export default function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation
}: ConversationListProps) {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedModel1, setSelectedModel1] = useState('llama2');
  const [selectedModel2, setSelectedModel2] = useState('mistral');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPreviewText = (conversation: Conversation) => {
    const lastTurn = conversation.turns[conversation.turns.length - 1];
    if (!lastTurn) return 'No messages yet';
    
    const preview = lastTurn.content.substring(0, 50);
    return preview.length === 50 ? preview + '...' : preview;
  };

  const handleNewConversation = () => {
    setShowModelSelector(true);
  };

  const handleCreateConversation = () => {
    onNewConversation(selectedModel1, selectedModel2);
    setShowModelSelector(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Conversations</h3>
            <button
              onClick={handleNewConversation}
              className="px-3 py-1 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all text-sm"
            >
              New
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="max-h-64 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-sm">No conversations yet</p>
              <button
                onClick={handleNewConversation}
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
              >
                Start First Conversation
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                    currentConversationId === conversation.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                  }`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {conversation.title || `Chat with ${conversation.model1} & ${conversation.model2}`}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {conversation.turns.length} messages
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {getPreviewText(conversation)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(conversation.updatedAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          <span className="text-xs text-gray-500">{conversation.model1}</span>
                          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                          <span className="text-xs text-gray-500">{conversation.model2}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conversation.id);
                      }}
                      className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete conversation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Model Selector Modal */}
      {showModelSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800">Select Models for New Conversation</h3>
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
                onClick={handleCreateConversation}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                Create Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 