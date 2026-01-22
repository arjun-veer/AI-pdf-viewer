/**
 * ChatPanel Component
 * 
 * RAG-based chat interface for PDF documents with:
 * 1. Context-aware responses using document content
 * 2. Citations linking back to source pages
 * 3. Conversation history
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RAGService,
  type ChatMessage,
  type Citation,
  type ConversationHistory,
} from '@/services/ragService';
import { MessageCircle, Send, Loader2, Trash2, ExternalLink, BookOpen } from 'lucide-react';

interface ChatPanelProps {
  documentHash: string;
  pages: { pageNumber: number; text: string }[];
  onNavigateToPage?: (pageNumber: number) => void;
}

export function ChatPanel({ documentHash, pages, onNavigateToPage }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize RAG and index document
  useEffect(() => {
    const initialize = async () => {
      setIsIndexing(true);
      try {
        RAGService.initialize();

        // Index document if not already indexed
        if (!RAGService.isDocumentIndexed(documentHash)) {
          await RAGService.indexDocument(documentHash, pages);
        }

        // Create conversation
        const convId = RAGService.createConversation(documentHash);
        setConversationId(convId);

        // Load existing conversations
        const convs = RAGService.listConversations(documentHash);
        setConversations(convs);
      } catch (err) {
        setError('Failed to initialize chat');
        console.error('RAG initialization error:', err);
      } finally {
        setIsIndexing(false);
      }
    };
    void initialize();
  }, [documentHash, pages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = useCallback(async () => {
    if (!input.trim() || !conversationId) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Add user message to conversation
      RAGService.addToConversation(documentHash, conversationId, userMessage);

      // Get response
      const response = await RAGService.chat(documentHash, input, conversationId);

      setMessages((prev) => [...prev, response.message]);
    } catch (err) {
      setError('Failed to get response');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [input, conversationId, documentHash]);

  // Navigate to citation
  const handleCitationClick = useCallback(
    (citation: Citation) => {
      onNavigateToPage?.(citation.pageNumber);
    },
    [onNavigateToPage]
  );

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    if (conversationId) {
      RAGService.deleteConversation(conversationId);
      const newConvId = RAGService.createConversation(documentHash);
      setConversationId(newConvId);
    }
  }, [conversationId, documentHash]);

  // Load existing conversation
  const loadConversation = useCallback((convId: string) => {
    const conv = RAGService.getConversation(convId);
    if (conv) {
      setMessages(conv.messages);
      setConversationId(convId);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5" />
              Chat with PDF
            </CardTitle>
            {messages.length > 0 && (
              <Button onClick={clearConversation} variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isIndexing ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Indexing document...
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ask questions about the PDF content. Responses include citations.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Conversation History Selector */}
      {conversations.length > 1 && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex gap-2 overflow-x-auto">
              {conversations.map((conv) => (
                <Button
                  key={conv.id}
                  onClick={() => { loadConversation(conv.id); }}
                  variant={conv.id === conversationId ? 'default' : 'outline'}
                  size="sm"
                >
                  {new Date(conv.createdAt).toLocaleDateString()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
        {messages.length === 0 && !isIndexing && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Start a conversation by asking a question</p>
            <p className="text-xs mt-2">Try: "What is this document about?"</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card
              className={`max-w-[80%] ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              <CardContent className="pt-6">
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Citations */}
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <p className="text-xs font-medium opacity-70">Sources:</p>
                    {message.citations.map((citation, _idx) => (
                      <button
                        key={citation.chunkId}
                        onClick={() => { handleCitationClick(citation); }}
                        className="flex items-start gap-2 text-xs p-2 rounded hover:bg-muted/20 w-full text-left"
                      >
                        <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              Page {citation.pageNumber}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {(citation.relevance * 100).toFixed(0)}% relevant
                            </Badge>
                          </div>
                          <p className="opacity-80 line-clamp-2">{citation.text}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-xs opacity-50 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="max-w-[80%]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">Thinking...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Ask a question about the PDF..."
              disabled={isLoading || isIndexing}
              className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={() => { void sendMessage(); }} disabled={!input.trim() || isLoading || isIndexing}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
