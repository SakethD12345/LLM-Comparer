import { ComparisonResult, Conversation } from '@/types/api';

const STORAGE_KEY = 'llm-comparer-history';
const CONVERSATIONS_KEY = 'llm-comparer-conversations';

function isValidComparisonResult(result: any): result is ComparisonResult {
  return (
    result &&
    typeof result === 'object' &&
    typeof result.model1 === 'object' &&
    typeof result.model2 === 'object' &&
    typeof result.timestamp === 'string' &&
    typeof result.model1.text === 'string' &&
    typeof result.model1.model === 'string' &&
    typeof result.model2.text === 'string' &&
    typeof result.model2.model === 'string'
  );
}

function isValidConversation(conversation: any): conversation is Conversation {
  return (
    conversation &&
    typeof conversation === 'object' &&
    typeof conversation.id === 'string' &&
    Array.isArray(conversation.turns) &&
    typeof conversation.model1 === 'string' &&
    typeof conversation.model2 === 'string' &&
    typeof conversation.createdAt === 'string' &&
    typeof conversation.updatedAt === 'string'
  );
}

export function saveComparisonResults(results: ComparisonResult[]): void {
  try {
    if (!Array.isArray(results)) {
      throw new Error('Results must be an array');
    }

    // Validate each result before saving
    results.forEach((result, index) => {
      if (!isValidComparisonResult(result)) {
        throw new Error(`Invalid comparison result at index ${index}`);
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch (error) {
    console.error('Error saving comparison results:', error);
    // Clear potentially corrupted data
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function loadComparisonResults(): ComparisonResult[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new Error('Saved data is not an array');
    }

    // Filter out invalid results
    const validResults = parsed.filter(isValidComparisonResult);
    
    // If we filtered out any results, save the cleaned data
    if (validResults.length !== parsed.length) {
      saveComparisonResults(validResults);
    }

    return validResults;
  } catch (error) {
    console.error('Error loading comparison results:', error);
    // Clear corrupted data
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

// Conversation storage functions
export function saveConversations(conversations: Conversation[]): void {
  try {
    if (!Array.isArray(conversations)) {
      throw new Error('Conversations must be an array');
    }

    // Validate each conversation before saving
    conversations.forEach((conversation, index) => {
      if (!isValidConversation(conversation)) {
        throw new Error(`Invalid conversation at index ${index}`);
      }
    });

    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversations:', error);
    // Clear potentially corrupted data
    localStorage.removeItem(CONVERSATIONS_KEY);
  }
}

export function loadConversations(): Conversation[] {
  try {
    const saved = localStorage.getItem(CONVERSATIONS_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new Error('Saved conversations data is not an array');
    }

    // Filter out invalid conversations
    const validConversations = parsed.filter(isValidConversation);
    
    // If we filtered out any conversations, save the cleaned data
    if (validConversations.length !== parsed.length) {
      saveConversations(validConversations);
    }

    return validConversations;
  } catch (error) {
    console.error('Error loading conversations:', error);
    // Clear corrupted data
    localStorage.removeItem(CONVERSATIONS_KEY);
    return [];
  }
}

export function saveConversation(conversation: Conversation): void {
  try {
    if (!isValidConversation(conversation)) {
      throw new Error('Invalid conversation data');
    }

    const conversations = loadConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);
    
    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }

    saveConversations(conversations);
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

export function deleteConversation(conversationId: string): void {
  try {
    const conversations = loadConversations();
    const filteredConversations = conversations.filter(c => c.id !== conversationId);
    saveConversations(filteredConversations);
  } catch (error) {
    console.error('Error deleting conversation:', error);
  }
}

export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONVERSATIONS_KEY);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
} 