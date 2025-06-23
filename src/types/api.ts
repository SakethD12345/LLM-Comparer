export interface LLMResponse {
  text: string;
  model: string;
  error?: string;
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  model?: string; // for assistant responses
  content: string;
  timestamp: string;
  turnId: string;
  error?: string; // for error messages
}

export interface Conversation {
  id: string;
  turns: ConversationTurn[];
  model1: string;
  model2: string;
  createdAt: string;
  updatedAt: string;
  title?: string;
}

export interface ComparisonResult {
  model1: LLMResponse;
  model2: LLMResponse;
  timestamp: string;
  conversationId?: string; // link to conversation if part of one
  turnId?: string; // specific turn in conversation
}

export interface ConversationState {
  currentConversation: Conversation | null;
  conversations: Conversation[];
  isConversationMode: boolean;
} 