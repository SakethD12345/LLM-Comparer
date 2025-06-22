import React from 'react';

interface ModeSelectorProps {
  isConversationMode: boolean;
  onModeChange: (isConversation: boolean) => void;
  conversationCount: number;
}

export default function ModeSelector({ 
  isConversationMode, 
  onModeChange, 
  conversationCount 
}: ModeSelectorProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Mode:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onModeChange(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !isConversationMode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🔍</span>
                <span>Single Comparison</span>
              </div>
            </button>
            <button
              onClick={() => onModeChange(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isConversationMode
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span>Conversation</span>
                {conversationCount > 0 && (
                  <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                    {conversationCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          {isConversationMode 
            ? 'Compare models in extended conversations'
            : 'Compare single responses side by side'
          }
        </div>
      </div>
    </div>
  );
} 