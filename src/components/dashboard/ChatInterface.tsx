import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperPlaneTilt, 
  Plus, 
  Trash, 
  ChatCircle,
  ArrowsClockwise,
  Moon,
  Leaf,
  Brain,
  Heart
} from '@phosphor-icons/react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TypingIndicator } from './TypingIndicator';
import ReactMarkdown from 'react-markdown';
import vitasyncLogo from '@/assets/vitasync-logo.svg';

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

const SUGGESTION_CARDS = [
  {
    icon: Moon,
    title: "Analyser mon sommeil",
    prompt: "Peux-tu analyser la qualité de mon sommeil cette semaine et me donner des conseils pour mieux dormir ?",
    color: "from-indigo-500/20 to-purple-500/20"
  },
  {
    icon: Leaf,
    title: "Conseils nutrition",
    prompt: "Donne-moi des conseils nutritionnels personnalisés basés sur mon profil de santé.",
    color: "from-green-500/20 to-emerald-500/20"
  },
  {
    icon: Brain,
    title: "Gérer mon stress",
    prompt: "Comment puis-je mieux gérer mon stress au quotidien ? Propose-moi des techniques adaptées.",
    color: "from-amber-500/20 to-orange-500/20"
  },
  {
    icon: Heart,
    title: "Optimiser mes compléments",
    prompt: "Analyse ma routine de compléments actuelle et suggère des optimisations.",
    color: "from-rose-500/20 to-pink-500/20"
  }
];

export function ChatInterface({ onFirstMessage }: ChatInterfaceProps) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [hasCalledFirstMessage, setHasCalledFirstMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const firstName = profile?.first_name || 'ami';
  const MAX_CHARS = 1000;

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
    setInput('');
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

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
  };

  const refreshSuggestions = () => {
    // Could shuffle or fetch personalized suggestions
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Call onFirstMessage callback
    if (!hasCalledFirstMessage && onFirstMessage) {
      onFirstMessage();
      setHasCalledFirstMessage(true);
    }

    let conversationId = currentConversationId;

    try {
      // Create conversation if needed
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

      // Stream response
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
    <div className="flex h-full bg-background/50 rounded-3xl overflow-hidden border border-white/10">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 flex flex-col bg-background/30 hidden md:flex">
        <div className="p-4">
          <button
            onClick={createNewConversation}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors font-medium"
          >
            <Plus weight="bold" className="w-5 h-5" />
            Nouvelle conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group ${
                currentConversationId === conv.id
                  ? 'bg-white/10 text-foreground'
                  : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <ChatCircle weight="light" className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate text-sm font-light">
                {conv.title || 'Conversation'}
              </span>
              <button
                onClick={(e) => deleteConversation(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-lg transition-all"
              >
                <Trash weight="light" className="w-4 h-4 text-foreground/40 hover:text-destructive" />
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {isNewConversation ? (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl"
            >
              {/* Logo */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-4 border border-white/10">
                <img src={vitasyncLogo} alt="VitaSync" className="w-full h-full" />
              </div>

              {/* Greeting */}
              <h2 className="text-2xl md:text-3xl font-light text-foreground mb-2">
                Bonjour {firstName},
              </h2>
              <p className="text-foreground/60 font-light mb-8">
                Comment puis-je vous aider aujourd'hui ?
              </p>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {SUGGESTION_CARDS.map((card, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSuggestionClick(card.prompt)}
                    className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} border border-white/10 hover:border-white/20 text-left transition-all hover:scale-[1.02] group`}
                  >
                    <card.icon weight="duotone" className="w-6 h-6 text-foreground/80 mb-2 group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium text-foreground">{card.title}</p>
                  </motion.button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={refreshSuggestions}
                className="flex items-center gap-2 mx-auto text-sm text-foreground/50 hover:text-foreground/70 transition-colors"
              >
                <ArrowsClockwise weight="light" className="w-4 h-4" />
                Rafraîchir les suggestions
              </button>
            </motion.div>
          </div>
        ) : (
          /* Messages Area */
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-2 flex-shrink-0 border border-white/10">
                      <img src={vitasyncLogo} alt="VitaSync" className="w-full h-full" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'glass-card border border-white/10'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none font-light">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm font-light">{message.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-2 flex-shrink-0 border border-white/10">
                  <img src={vitasyncLogo} alt="VitaSync" className="w-full h-full" />
                </div>
                <div className="glass-card rounded-2xl px-4 py-3 border border-white/10">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Comment puis-je vous aider ?"
              className="w-full px-5 py-4 pr-24 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-foreground placeholder:text-foreground/40 font-light transition-colors"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-xs text-foreground/40">
                {input.length}/{MAX_CHARS}
              </span>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperPlaneTilt weight="fill" className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
