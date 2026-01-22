import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, ConversationHistory } from '@/services/ragService';

interface ChatState {
  conversations: ConversationHistory[];
  currentConversationId: string | null;
  messages: ChatMessage[];
  isIndexing: boolean;
  indexedDocuments: Set<string>;
  
  // Actions
  setConversations: (conversations: ConversationHistory[]) => void;
  addConversation: (conversation: ConversationHistory) => void;
  setCurrentConversation: (id: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  deleteConversation: (id: string) => void;
  clearMessages: () => void;
  setIndexing: (indexing: boolean) => void;
  addIndexedDocument: (documentHash: string) => void;
  removeIndexedDocument: (documentHash: string) => void;
  isDocumentIndexed: (documentHash: string) => boolean;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      messages: [],
      isIndexing: false,
      indexedDocuments: new Set<string>(),

      setConversations: (conversations) => set({ conversations }),
      
      addConversation: (conversation) => set((state) => ({
        conversations: [...state.conversations, conversation],
      })),
      
      setCurrentConversation: (id) => set({ currentConversationId: id }),
      
      setMessages: (messages) => set({ messages }),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
      })),
      
      updateMessage: (id, updates) => set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === id ? { ...msg, ...updates } : msg
        ),
      })),
      
      deleteConversation: (id) => set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== id),
        currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
        messages: state.currentConversationId === id ? [] : state.messages,
      })),
      
      clearMessages: () => set({ messages: [] }),
      
      setIndexing: (indexing) => set({ isIndexing: indexing }),
      
      addIndexedDocument: (documentHash) => set((state) => ({
        indexedDocuments: new Set([...state.indexedDocuments, documentHash]),
      })),
      
      removeIndexedDocument: (documentHash) => set((state) => {
        const newSet = new Set(state.indexedDocuments);
        newSet.delete(documentHash);
        return { indexedDocuments: newSet };
      }),
      
      isDocumentIndexed: (documentHash) => {
        return get().indexedDocuments.has(documentHash);
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        indexedDocuments: Array.from(state.indexedDocuments),
      }),
    }
  )
);
