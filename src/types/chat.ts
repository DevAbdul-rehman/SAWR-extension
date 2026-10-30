export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface ConnectedWebsite {
  domain: string;
  url: string;
  title?: string;
  pagesIndexed?: number;
}