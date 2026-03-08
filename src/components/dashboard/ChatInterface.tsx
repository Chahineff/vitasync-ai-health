import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { List } from '@phosphor-icons/react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { useIsMobile } from '@/hooks/use-mobile';
import { TypingIndicator } from './TypingIndicator';
import { ChatWelcomeScreen, ChatMessageBubble, ChatInput, ChatSidebar, ChatModelSelector, AI_MODELS, type AIModel, type ChatInputRef } from './chat';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

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

// Default model
const DEFAULT_MODEL = AI_MODELS.find(m => m.model === 'google/gemini-3-flash-preview') || AI_MODELS[2];

// Persist model selection in localStorage
function getSavedModel(): AIModel {
  try {
    const saved = localStorage.getItem('vitasync_selected_model');
    if (saved) {
      const found = AI_MODELS.find(m => m.model === saved);
      if (found) return found;
    }
  } catch {}
  return DEFAULT_MODEL;
}

export function ChatInterface({ onFirstMessage }: ChatInterfaceProps) {
  const { user, profile } = useAuth();
  const { healthProfile } = useHealthProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [hasCalledFirstMessage, setHasCalledFirstMessage] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(getSavedModel);

  const handleModelChange = (model: AIModel) => {
    setSelectedModel(model);
    localStorage.setItem('vitasync_selected_model', model.model);
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputRef>(null);
  const fullContentRef = useRef('');
  const revealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sseFinishedRef = useRef(false);

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

  // Generate a smart title using AI after first exchange
  const generateConversationTitle = useCallback(async (conversationId: string, userMsg: string, assistantMsg: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach-title', {
        body: { userMessage: userMsg, assistantMessage: assistantMsg.slice(0, 500) }
      });
      if (!error && data?.title) {
        await supabase.from('conversations').update({ title: data.title }).eq('id', conversationId);
        loadConversations();
      }
    } catch (e) {
      console.error('Title generation failed:', e);
    }
  }, []);

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
        model: selectedModel.model,
        modelVersion: selectedModel.version || '1.0',
      }),
    });

      if (!response.ok) {
        throw new Error('Erreur de communication avec le coach');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      // Reset typewriter state
      fullContentRef.current = '';
      sseFinishedRef.current = false;
      setIsRevealing(true);
      
      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      // Start reveal interval - progressively show characters
      let displayedLength = 0;
      revealIntervalRef.current = setInterval(() => {
        const full = fullContentRef.current;
        if (displayedLength < full.length) {
          // Reveal 3-5 chars at a time for natural feel
          const charsToAdd = Math.min(3 + Math.floor(Math.random() * 3), full.length - displayedLength);
          displayedLength += charsToAdd;
          const displayed = full.slice(0, displayedLength);
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: 'assistant', content: displayed };
            return newMessages;
          });
        } else if (sseFinishedRef.current && displayedLength >= full.length) {
          // SSE done AND reveal caught up - finish
          if (revealIntervalRef.current) {
            clearInterval(revealIntervalRef.current);
            revealIntervalRef.current = null;
          }
          setIsRevealing(false);
          setIsLoading(false);
        }
      }, 18);

      // Read SSE chunks into fullContentRef
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
              fullContentRef.current += content;
            } catch {}
          }
        }
      }

      sseFinishedRef.current = true;
      const assistantMessage = fullContentRef.current;

      if (conversationId && assistantMessage) {
        await saveMessage(conversationId, 'assistant', assistantMessage);
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
        
        // Generate smart title for new conversations (first exchange only)
        if (messages.length === 0) {
          generateConversationTitle(conversationId, userMessage, assistantMessage);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Clean up reveal interval on error
      if (revealIntervalRef.current) {
        clearInterval(revealIntervalRef.current);
        revealIntervalRef.current = null;
      }
      setIsRevealing(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Désolé, une erreur s'est produite. Veuillez réessayer." }
      ]);
    } finally {
      // isLoading is now set to false by the reveal interval when it catches up
      // But if SSE failed before reveal started, ensure cleanup
      if (!isRevealing) {
        setIsLoading(false);
      }
    }
  };

  const isNewConversation = messages.length === 0;

  return (
    <div className="flex h-full min-h-0 bg-background/30 md:rounded-3xl overflow-hidden md:border md:border-border/50 backdrop-blur-xl">
      {/* Sidebar - hidden on mobile, shown via sheet */}
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
        {/* Header with Model Selector + Mobile sidebar toggle */}
        <div className="px-3 md:px-4 py-3 border-b border-border/50 flex items-center justify-between gap-2">
          {/* Mobile sidebar trigger */}
          <MobileChatSidebarTrigger
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={selectConversation}
            onCreateNew={createNewConversation}
            onDelete={deleteConversation}
          />
          <ChatModelSelector 
            selectedModel={selectedModel} 
            onModelChange={handleModelChange} 
          />
        </div>

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
                    isStreaming={(isLoading || isRevealing) && index === messages.length - 1 && message.role === 'assistant'}
                    onQuizComplete={(summary) => handleSubmit(summary)}
                  />
                ))}
              </AnimatePresence>

              {/* Typing Indicator - without bubble */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <TypingIndicator selectedModel={selectedModel.model} />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Premium Floating Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-6 bg-gradient-to-t from-background via-background/95 to-transparent">
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

// Mobile sidebar trigger using Sheet
function MobileChatSidebarTrigger({
  conversations,
  currentConversationId,
  onSelectConversation,
  onCreateNew,
  onDelete,
}: {
  conversations: { id: string; title: string | null; created_at: string }[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateNew: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-xl bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/10 hover:bg-muted dark:hover:bg-white/10 transition-colors md:hidden"
        aria-label="Historique des conversations"
      >
        <List weight="light" className="w-5 h-5 text-foreground" />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0 bg-background/95 backdrop-blur-xl border-border/50">
          <SheetTitle className="sr-only">Historique des conversations</SheetTitle>
          <ChatSidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            isCollapsed={false}
            onToggleCollapse={() => {}}
            onSelectConversation={(id) => {
              onSelectConversation(id);
              setOpen(false);
            }}
            onCreateNew={() => {
              onCreateNew();
              setOpen(false);
            }}
            onDelete={onDelete}
            isMobileOverlay
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
