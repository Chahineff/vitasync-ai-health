import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { TypingIndicator } from './TypingIndicator';
import { ChatWelcomeScreen, ChatMessageBubble, ChatInput, ChatSidebar, type ChatInputRef } from './chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
}

interface ChatInterfaceProps {
  onFirstMessage?: () => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`;

// Official VitaSync PNG Logo
const vitasyncLogoUrl = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

export function ChatInterface({ onFirstMessage }: ChatInterfaceProps) {
  const { user, profile } = useAuth();
  const { healthProfile } = useHealthProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [hasCalledFirstMessage, setHasCalledFirstMessage] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputRef>(null);

  const firstName = profile?.first_name || 'toi';

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (data) setConversations(data);
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })));
    }
  };

  const selectConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    await loadMessages(conversationId);
  };

  const createNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('messages').delete().eq('conversation_id', conversationId);
    await supabase.from('conversations').delete().eq('id', conversationId);
    if (currentConversationId === conversationId) {
      createNewConversation();
    }
    loadConversations();
  };

  const saveMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    await supabase.from('messages').insert({ conversation_id: conversationId, role, content });
  };

  // Handle guided suggestion prompt submission
  const handleGuidedPromptSubmit = useCallback((prompt: string) => {
    chatInputRef.current?.setValue(prompt);
    setTimeout(() => {
      chatInputRef.current?.submitForm();
    }, 100);
  }, []);

  const handleSubmit = async (userMessage: string, file?: File | null) => {
    if (!userMessage.trim() || isLoading || !user) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    if (!hasCalledFirstMessage && onFirstMessage) {
      onFirstMessage();
      setHasCalledFirstMessage(true);
    }

    let conversationId = currentConversationId;

    try {
      if (!conversationId) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({ user_id: user.id, title: userMessage.slice(0, 50) })
          .select()
          .single();
        if (newConv) {
          conversationId = newConv.id;
          setCurrentConversationId(conversationId);
          loadConversations();
        }
      }

      if (conversationId) {
        await saveMessage(conversationId, 'user', userMessage);
      }

      const session = await supabase.auth.getSession();
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur de communication avec le coach');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              assistantMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantMessage };
                return newMessages;
              });
            } catch {}
          }
        }
      }

      if (conversationId && assistantMessage) {
        await saveMessage(conversationId, 'assistant', assistantMessage);
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Désolé, une erreur s'est produite. Veuillez réessayer." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isNewConversation = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-2rem)] min-h-[600px] bg-background/30 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-xl">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onSelectConversation={selectConversation}
        onCreateNew={createNewConversation}
        onDelete={deleteConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {isNewConversation ? (
          <ChatWelcomeScreen
            firstName={firstName}
            healthProfile={healthProfile}
            onSubmitPrompt={handleGuidedPromptSubmit}
          />
        ) : (
          /* Messages Area - Centered with max-w-3xl */
          <div className="flex-1 overflow-y-auto pb-40">
            <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <ChatMessageBubble
                    key={index}
                    role={message.role}
                    content={message.content}
                    isStreaming={isLoading && index === messages.length - 1 && message.role === 'assistant'}
                  />
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-2 flex-shrink-0 border border-white/20 animate-pulse-glow">
                    <img src={vitasyncLogoUrl} alt="VitaSync" className="w-full h-full object-contain" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Premium Floating Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-background via-background/95 to-transparent">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              ref={chatInputRef}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
