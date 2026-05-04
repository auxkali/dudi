import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface Document {
  id: string;
  filename: string;
  uploadedAt: number;
  status: 'processing' | 'indexed' | 'error';
}

interface RAGContextType {
  documents: Document[];
  chatHistory: ChatMessage[];
  addDocument: (filename: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  queryDocuments: (query: string) => Promise<string>;
  clearChat: () => void;
  isLoading: boolean;
  error: string | null;
}

const RAGContext = createContext<RAGContextType | undefined>(undefined);

export function RAGProvider({ children, token }: { children: React.ReactNode; token: string | null }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addDocument = useCallback(async (filename: string) => {
    if (!token) throw new Error('Not authenticated');
    
    setIsLoading(true);
    setError(null);
    try {
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        filename,
        uploadedAt: Date.now(),
        status: 'processing',
      };
      setDocuments(prev => [...prev, newDoc]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add document';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const addMessage = useCallback((message: ChatMessage) => {
    setChatHistory(prev => [...prev, { ...message, timestamp: Date.now() }]);
  }, []);

  const queryDocuments = useCallback(async (query: string) => {
    if (!token) throw new Error('Not authenticated');
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://8000-iwlct9txk0rjzw9kn4y7s-ecea3df7.us2.manus.computer/api/v1/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query,
          chat_history: chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to query documents');
      }

      const data = await response.json();
      return data.answer;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Query failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, chatHistory]);

  const clearChat = useCallback(() => {
    setChatHistory([]);
  }, []);

  return (
    <RAGContext.Provider value={{
      documents,
      chatHistory,
      addDocument,
      addMessage,
      queryDocuments,
      clearChat,
      isLoading,
      error,
    }}>
      {children}
    </RAGContext.Provider>
  );
}

export function useRAG() {
  const context = useContext(RAGContext);
  if (!context) {
    throw new Error('useRAG must be used within RAGProvider');
  }
  return context;
}
