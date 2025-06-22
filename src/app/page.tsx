'use client';

import { useState, useEffect } from 'react';
import ModelPanel from '@/components/ModelPanel';
import StorageTest from '@/components/StorageTest';
import { LLMResponse, ComparisonResult, Conversation, ConversationTurn } from '@/types/api';
import { saveComparisonResults, loadComparisonResults, saveConversation, loadConversations, deleteConversation } from '@/lib/storage';
import AnalysisResults from '@/components/AnalysisResults';
import AdvancedAnalysisResults from '@/components/AdvancedAnalysisResults';
import ConversationPanel from '@/components/ConversationPanel';
import ModeSelector from '@/components/ModeSelector';
import ConversationList from '@/components/ConversationList';

export default function Home() {
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [response1, setResponse1] = useState<LLMResponse | null>(null);
  const [response2, setResponse2] = useState<LLMResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [useAdvancedAnalysis, setUseAdvancedAnalysis] = useState(false);
  
  // Conversation state
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isConversationLoading, setIsConversationLoading] = useState(false);

  // Load saved results and conversations on component mount
  useEffect(() => {
    const savedResults = loadComparisonResults();
    const savedConversations = loadConversations();
    
    if (savedResults.length > 0) {
      setComparisonResults(savedResults);
    }
    
    if (savedConversations.length > 0) {
      setConversations(savedConversations);
    }
  }, []);

  // Save results whenever they change
  useEffect(() => {
    if (comparisonResults.length > 0) {
      saveComparisonResults(comparisonResults);
    }
  }, [comparisonResults]);

  // Save conversations whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      // This will be handled by individual save operations
    }
  }, [conversations]);

  const handleResponse = (modelNumber: number, response: LLMResponse) => {
    setComparisonResults((prev) => {
      const newResults = [...prev];
      const currentResult = newResults[newResults.length - 1] || {
        model1: { text: '', model: '' },
        model2: { text: '', model: '' },
        timestamp: new Date().toISOString(),
      };

      if (modelNumber === 1) {
        currentResult.model1 = response;
      } else {
        currentResult.model2 = response;
      }

      if (newResults.length === 0) {
        newResults.push(currentResult);
      } else {
        newResults[newResults.length - 1] = currentResult;
      }

      return newResults;
    });
  };

  const handleAnalyze = async () => {
    if (!response1 || !response2) return;

    setIsAnalyzing(true);
    try {
      const endpoint = useAdvancedAnalysis ? '/api/advanced-analyze' : '/api/analyze';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response1: response1.text,
          response2: response2.text,
          model1: response1.model,
          model2: response2.model,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const results = await response.json();
      setAnalysisResults(results);
    } catch (error) {
      console.error('Error analyzing responses:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Conversation functions
  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      turns: [],
      model1: 'llama2', // Default models - could be made configurable
      model2: 'mistral',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setCurrentConversation(newConversation);
    setConversations(prev => [newConversation, ...prev]);
    saveConversation(newConversation);
  };

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  const deleteConversationHandler = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    deleteConversation(conversationId);
    
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
  };

  const sendConversationMessage = async (message: string) => {
    if (!currentConversation) return;

    setIsConversationLoading(true);
    
    try {
      // Add user message to conversation
      const userTurn: ConversationTurn = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        turnId: `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const updatedConversation = {
        ...currentConversation,
        turns: [...currentConversation.turns, userTurn],
        updatedAt: new Date().toISOString(),
      };

      setCurrentConversation(updatedConversation);
      setConversations(prev => 
        prev.map(c => c.id === updatedConversation.id ? updatedConversation : c)
      );
      saveConversation(updatedConversation);

      // Get responses from both models
      const [response1, response2] = await Promise.all([
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: message,
            model: currentConversation.model1,
            conversation_history: updatedConversation.turns.map(turn => ({
              role: turn.role,
              content: turn.content
            }))
          }),
        }).then(res => res.json()),
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: message,
            model: currentConversation.model2,
            conversation_history: updatedConversation.turns.map(turn => ({
              role: turn.role,
              content: turn.content
            }))
          }),
        }).then(res => res.json()),
      ]);

      // Add model responses to conversation
      const model1Turn: ConversationTurn = {
        role: 'assistant',
        model: currentConversation.model1,
        content: response1.text || 'Error: No response',
        timestamp: new Date().toISOString(),
        turnId: `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const model2Turn: ConversationTurn = {
        role: 'assistant',
        model: currentConversation.model2,
        content: response2.text || 'Error: No response',
        timestamp: new Date().toISOString(),
        turnId: `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const finalConversation = {
        ...updatedConversation,
        turns: [...updatedConversation.turns, model1Turn, model2Turn],
        updatedAt: new Date().toISOString(),
      };

      setCurrentConversation(finalConversation);
      setConversations(prev => 
        prev.map(c => c.id === finalConversation.id ? finalConversation : c)
      );
      saveConversation(finalConversation);

    } catch (error) {
      console.error('Error sending conversation message:', error);
    } finally {
      setIsConversationLoading(false);
    }
  };

  const clearHistory = () => {
    setComparisonResults([]);
    setConversations([]);
    setCurrentConversation(null);
    localStorage.removeItem('llm-comparer-history');
    localStorage.removeItem('llm-comparer-conversations');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            LLM Comparer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Compare responses from different language models side by side. 
            Generate responses, analyze similarities, and gain insights into model performance.
          </p>
        </div>

        {/* Mode Selector */}
        <ModeSelector 
          isConversationMode={isConversationMode}
          onModeChange={setIsConversationMode}
          conversationCount={conversations.length}
        />

        {/* Main Content */}
        {isConversationMode ? (
          // Conversation Mode
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Conversation List Sidebar */}
            <div className="lg:col-span-1">
              <ConversationList
                conversations={conversations}
                currentConversationId={currentConversation?.id || null}
                onSelectConversation={selectConversation}
                onDeleteConversation={deleteConversationHandler}
                onNewConversation={createNewConversation}
              />
            </div>

            {/* Conversation Panel */}
            <div className="lg:col-span-3">
              {currentConversation ? (
                <ConversationPanel
                  conversation={currentConversation}
                  onSendMessage={sendConversationMessage}
                  onNewConversation={createNewConversation}
                  isLoading={isConversationLoading}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Conversation Selected</h3>
                  <p className="text-gray-600 mb-6">Select a conversation from the sidebar or start a new one</p>
                  <button
                    onClick={createNewConversation}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
                  >
                    Start New Conversation
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Single Comparison Mode
          <>
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <ModelPanel 
                modelNumber={1} 
                onResponse={setResponse1}
                otherResponse={response2}
              />
              <ModelPanel 
                modelNumber={2} 
                onResponse={setResponse2}
                otherResponse={response1}
              />
            </div>

            {/* Analysis Controls */}
            {response1 && response2 && (
              <div className="flex flex-col items-center mb-8 space-y-4">
                {/* Analysis Type Toggle */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Analysis Type:</span>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setUseAdvancedAnalysis(false)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          !useAdvancedAnalysis
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Basic
                      </button>
                      <button
                        onClick={() => setUseAdvancedAnalysis(true)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          useAdvancedAnalysis
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Advanced
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {useAdvancedAnalysis 
                      ? 'Advanced analysis includes NER, topic modeling, and semantic similarity'
                      : 'Basic analysis includes sentiment, readability, and key phrases'
                    }
                  </p>
                </div>

                {/* Compare Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`px-8 py-4 text-white rounded-xl font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    useAdvancedAnalysis
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                  }`}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-white">
                        {useAdvancedAnalysis ? 'Performing Advanced Analysis...' : 'Analyzing...'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{useAdvancedAnalysis ? '🧠' : '🔍'}</span>
                      <span className="text-white">
                        {useAdvancedAnalysis ? 'Advanced Analysis' : 'Compare Responses'}
                      </span>
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* Analysis Results */}
            {analysisResults && (
              <div className="max-w-6xl mx-auto">
                {useAdvancedAnalysis ? (
                  <AdvancedAnalysisResults results={analysisResults} isLoading={isAnalyzing} />
                ) : (
                  <AnalysisResults results={analysisResults} isLoading={isAnalyzing} />
                )}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500">
            Built with Next.js, FastAPI, and Ollama • 
            <a href="https://github.com/SakethD12345/LLM-Comparer" className="text-blue-500 hover:text-blue-600 ml-1">
              View on GitHub
            </a>
          </p>
        </div>
      </div>
      <StorageTest />
    </div>
  );
} 