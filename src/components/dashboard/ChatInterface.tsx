import { useState, useRef, useEffect, Fragment, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PaperPlaneTilt, 
  Plus, 
  Trash, 
  ChatCircle,
  Moon,
  Leaf,
  Brain,
  Heart,
  Microphone,
  Paperclip,
  Database,
  SpeakerHigh,
  SpeakerX,
  Stop,
  User as UserIcon,
  CaretLeft,
  CaretRight,
  X,
  File as FileIcon,
  Image as ImageIcon,
  Lightning,
  Barbell,
  Pill,
  ShieldPlus,
  Sparkle,
  ClipboardText
} from '@phosphor-icons/react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { useDailyCheckin } from '@/hooks/useDailyCheckin';
import { TypingIndicator } from './TypingIndicator';
import { ProductRecommendationCard, parseProductRecommendations } from './ProductRecommendationCard';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { ProfileSummaryCard } from './ProfileSummaryCard';
import { DisclaimerModal } from './DisclaimerModal';
import { GuidedSuggestionCards } from './GuidedSuggestionCards';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

// Official VitaSync PNG Logo
const vitasyncLogoUrl = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

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

interface SuggestionCard {
  icon: React.ElementType;
  title: string;
  prompt: string;
  gradient: string;
  iconColor: string;
}

const DEFAULT_SUGGESTIONS: SuggestionCard[] = [
  {
    icon: Moon,
    title: "Améliorer mon sommeil",
    prompt: "Je dors mal, qu'est-ce que tu me conseilles ?",
    gradient: "from-indigo-500/10 to-purple-500/10",
    iconColor: "text-indigo-500"
  },
  {
    icon: Leaf,
    title: "Conseils nutrition",
    prompt: "Donne-moi des conseils nutrition adaptés à mon profil.",
    gradient: "from-emerald-500/10 to-green-500/10",
    iconColor: "text-emerald-500"
  },
  {
    icon: Brain,
    title: "Gérer mon stress",
    prompt: "Comment réduire mon stress au quotidien ?",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-500"
  },
  {
    icon: Heart,
    title: "Booster mon énergie",
    prompt: "Quels compléments pour plus d'énergie ?",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-500"
  }
];

// Render message content with product cards
function MessageContent({ content }: { content: string }) {
  const { text, products } = parseProductRecommendations(content);
  
  if (products.length === 0) {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none font-light">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  const parts = text.split(/__PRODUCT_(\d+)__/);
  
  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          const productIndex = parseInt(part, 10);
          const product = products[productIndex];
          if (product) {
            return <ProductRecommendationCard key={`product-${index}`} product={product} />;
          }
          return null;
        }
        if (part.trim()) {
          return (
            <div key={`text-${index}`} className="prose prose-sm dark:prose-invert max-w-none font-light">
              <ReactMarkdown>{part}</ReactMarkdown>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// TTS Button Component
function TTSButton({ content }: { content: string }) {
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis();
  
  if (!isSupported) return null;

  const handleClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(content);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "p-1.5 rounded-lg transition-all duration-200",
        isSpeaking 
          ? "bg-primary/20 text-primary" 
          : "text-foreground/40 hover:text-foreground/70 hover:bg-white/5"
      )}
      title={isSpeaking ? "Arrêter la lecture" : "Lire à voix haute"}
    >
      {isSpeaking ? (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <SpeakerHigh weight="fill" className="w-4 h-4" />
        </motion.div>
      ) : (
        <SpeakerHigh weight="light" className="w-4 h-4" />
      )}
    </button>
  );
}

export function ChatInterface({ onFirstMessage }: ChatInterfaceProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { healthProfile } = useHealthProfile();
  const { getTrends } = useDailyCheckin();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [hasCalledFirstMessage, setHasCalledFirstMessage] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speech-to-text hook
  const { 
    startListening, 
    stopListening, 
    isListening, 
    isConnecting,
    transcript,
    partialTranscript,
    isSupported: sttSupported 
  } = useSpeechToText();

  const firstName = profile?.first_name || 'toi';
  const MAX_CHARS = 2000;

  // Generate dynamic suggestions based on user profile and check-ins
  const suggestionCards = useMemo(() => {
    const suggestions: SuggestionCard[] = [];
    const trends = getTrends();
    const goals = healthProfile?.health_goals || [];
    const currentIssues = healthProfile?.current_issues || [];

    // Based on recent check-in trends
    if (trends) {
      if (trends.avgSleep < 3) {
        suggestions.push({
          icon: Moon,
          title: "Analyser mon sommeil",
          prompt: "J'ai mal dormi ces derniers jours selon mes check-ins. Que me conseilles-tu pour améliorer mon sommeil ?",
          gradient: "from-indigo-500/10 to-purple-500/10",
          iconColor: "text-indigo-500"
        });
      }
      if (trends.avgEnergy < 3) {
        suggestions.push({
          icon: Lightning,
          title: "Booster mon énergie",
          prompt: "Mon niveau d'énergie est bas ces derniers jours. Quels conseils ou compléments pour retrouver la forme ?",
          gradient: "from-amber-500/10 to-yellow-500/10",
          iconColor: "text-amber-500"
        });
      }
      if (trends.avgStress > 3) {
        suggestions.push({
          icon: Brain,
          title: "Réduire mon stress",
          prompt: "Je suis stressé en ce moment selon mes check-ins. Comment gérer mon stress naturellement ?",
          gradient: "from-rose-500/10 to-pink-500/10",
          iconColor: "text-rose-500"
        });
      }
    }

    // Based on health goals
    if (goals.includes("sommeil") && !suggestions.some(s => s.title.includes("sommeil"))) {
      suggestions.push({
        icon: Moon,
        title: "Améliorer mon sommeil",
        prompt: "Comment améliorer mon sommeil selon mon profil de santé ?",
        gradient: "from-indigo-500/10 to-purple-500/10",
        iconColor: "text-indigo-500"
      });
    }
    if (goals.includes("energie") && !suggestions.some(s => s.title.includes("énergie"))) {
      suggestions.push({
        icon: Heart,
        title: "Plus d'énergie",
        prompt: "Quels compléments recommandes-tu pour avoir plus d'énergie au quotidien ?",
        gradient: "from-rose-500/10 to-red-500/10",
        iconColor: "text-rose-500"
      });
    }
    if (goals.includes("stress") && !suggestions.some(s => s.title.includes("stress"))) {
      suggestions.push({
        icon: Brain,
        title: "Gérer mon stress",
        prompt: "Quelles solutions naturelles pour gérer mon stress et mon anxiété ?",
        gradient: "from-amber-500/10 to-orange-500/10",
        iconColor: "text-amber-500"
      });
    }
    if (goals.includes("sport") || goals.includes("prise-muscle")) {
      suggestions.push({
        icon: Barbell,
        title: "Performance sportive",
        prompt: "Quels compléments pour optimiser mes performances sportives et ma récupération ?",
        gradient: "from-cyan-500/10 to-blue-500/10",
        iconColor: "text-cyan-500"
      });
    }
    if (goals.includes("immunite")) {
      suggestions.push({
        icon: ShieldPlus,
        title: "Renforcer mon immunité",
        prompt: "Quels compléments pour renforcer mon système immunitaire ?",
        gradient: "from-green-500/10 to-emerald-500/10",
        iconColor: "text-green-500"
      });
    }
    if (goals.includes("digestion")) {
      suggestions.push({
        icon: Leaf,
        title: "Améliorer ma digestion",
        prompt: "J'ai des problèmes de digestion, que me conseilles-tu ?",
        gradient: "from-emerald-500/10 to-teal-500/10",
        iconColor: "text-emerald-500"
      });
    }
    if (goals.includes("focus") || goals.includes("concentration")) {
      suggestions.push({
        icon: Brain,
        title: "Améliorer ma concentration",
        prompt: "Comment améliorer ma concentration et ma mémoire naturellement ?",
        gradient: "from-violet-500/10 to-purple-500/10",
        iconColor: "text-violet-500"
      });
    }

    // Fill with defaults if needed
    if (suggestions.length < 4) {
      for (const defaultSuggestion of DEFAULT_SUGGESTIONS) {
        if (suggestions.length >= 4) break;
        if (!suggestions.some(s => s.title === defaultSuggestion.title)) {
          suggestions.push(defaultSuggestion);
        }
      }
    }

    return suggestions.slice(0, 4);
  }, [healthProfile, getTrends]);

  // Update input with transcript
  useEffect(() => {
    if (transcript) {
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    }
  }, [transcript]);

  // Show partial transcript in real-time
  useEffect(() => {
    if (partialTranscript && isListening) {
      // Optionally update UI to show partial transcript
    }
  }, [partialTranscript, isListening]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

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

  // Handle guided suggestion prompt submission
  const handleGuidedPromptSubmit = useCallback((prompt: string) => {
    setInput(prompt);
    // Auto-submit after a short delay
    setTimeout(() => {
      inputRef.current?.focus();
      // Trigger submit
      const form = inputRef.current?.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }, 100);
  }, []);

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  // File selection handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Voice input toggle
  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const userMessage = input.trim();
    setInput('');
    clearSelectedFile();
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isNewConversation = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-2rem)] min-h-[600px] bg-background/30 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-xl">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
      />

      {/* Collapsible & Fixed Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 72 : 280 }}
        className="sticky top-0 h-full border-r border-white/10 flex flex-col bg-background/20 overflow-hidden hidden md:flex flex-shrink-0"
      >
        {/* Header with toggle */}
        <div className="p-3 flex items-center justify-between min-w-[72px]">
          {!isSidebarCollapsed ? (
            <button
              onClick={createNewConversation}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium shadow-lg shadow-primary/20"
            >
              <Plus weight="bold" className="w-5 h-5" />
              <span className="whitespace-nowrap">Nouvelle conversation</span>
            </button>
          ) : (
            <button
              onClick={createNewConversation}
              className="mx-auto p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              title="Nouvelle conversation"
            >
              <Plus weight="bold" className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-4 right-0 translate-x-1/2 z-10 p-1.5 rounded-full bg-background/80 border border-white/20 hover:bg-white/10 transition-colors"
          title={isSidebarCollapsed ? "Étendre" : "Réduire"}
        >
          {isSidebarCollapsed ? (
            <CaretRight weight="bold" className="w-3 h-3 text-foreground/60" />
          ) : (
            <CaretLeft weight="bold" className="w-3 h-3 text-foreground/60" />
          )}
        </button>

        {/* Scrollable conversations list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group",
                currentConversationId === conv.id
                  ? 'bg-white/10 text-foreground'
                  : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'
              )}
              title={isSidebarCollapsed ? (conv.title || 'Conversation') : undefined}
            >
              <ChatCircle weight="light" className="w-4 h-4 flex-shrink-0" />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 truncate text-sm font-light">
                    {conv.title || 'Conversation'}
                  </span>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Trash weight="light" className="w-4 h-4 text-foreground/40 hover:text-destructive" />
                  </button>
                </>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {isNewConversation ? (
          /* Premium Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center max-w-3xl w-full"
            >
              {/* Logo with gradient glow */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-4 border border-white/20 shadow-xl shadow-primary/10"
              >
                <img src={vitasyncLogoUrl} alt="VitaSync" className="w-full h-full object-contain" />
              </motion.div>

              {/* Greeting */}
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl md:text-4xl font-light text-foreground mb-3"
              >
                Bonjour {firstName} 👋
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-lg text-foreground/60 font-light mb-6"
              >
                Je suis VitaSync AI. Comment puis-je t'aider ?
              </motion.p>

              {/* Quiz CTA or Profile Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="max-w-xl mx-auto mb-6"
              >
                {healthProfile?.onboarding_completed ? (
                  /* Profile Summary Card */
                  <ProfileSummaryCard 
                    goals={healthProfile.health_goals || []}
                    allergies={healthProfile.allergies || []}
                    budget={healthProfile.monthly_budget}
                    onEdit={() => navigate("/onboarding?edit=true")}
                  />
                ) : (
                  /* Quiz CTA Button */
                  <motion.button
                    onClick={() => navigate("/onboarding")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium shadow-lg shadow-primary/20 flex items-center justify-center gap-3 hover:shadow-xl transition-shadow"
                  >
                    <ClipboardText weight="bold" className="w-5 h-5" />
                    <span>🎯 Personnaliser mon plan (60 sec)</span>
                    <Sparkle weight="fill" className="w-4 h-4 opacity-70" />
                  </motion.button>
                )}
              </motion.div>

              {/* Guided Suggestion Cards with Multi-Step Flow */}
              <GuidedSuggestionCards 
                onSubmitPrompt={handleGuidedPromptSubmit}
                onboardingCompleted={healthProfile?.onboarding_completed}
              />

              {/* Disclaimer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="mt-6 text-center"
              >
                <p className="text-xs text-foreground/40">
                  VitaSync AI est un outil de bien-être, pas un diagnostic médical.{' '}
                  <DisclaimerModal />
                </p>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          /* Messages Area - Centered with max-w-3xl */
          <div className="flex-1 overflow-y-auto pb-32">
            <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {/* AI Avatar */}
                    {message.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-2 flex-shrink-0 border border-white/20">
                        <img src={vitasyncLogoUrl} alt="VitaSync" className="w-full h-full object-contain" />
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === 'user'
                          ? 'bg-primary/10 border border-primary/20 text-foreground'
                          : 'bg-transparent border border-white/10'
                      )}
                    >
                      {message.role === 'assistant' ? (
                        <div className="space-y-2">
                          <MessageContent content={message.content} />
                          {/* TTS Button */}
                          {message.content && (
                            <div className="flex justify-end pt-1">
                              <TTSButton content={message.content} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm font-light">{message.content}</p>
                      )}
                    </div>

                    {/* User Avatar */}
                    {message.role === 'user' && (
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/20">
                        <UserIcon weight="fill" className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-2 flex-shrink-0 border border-white/20">
                    <img src={vitasyncLogoUrl} alt="VitaSync" className="w-full h-full object-contain" />
                  </div>
                  <div className="bg-transparent border border-white/10 rounded-2xl px-4 py-3">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Premium Floating Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
          <div className="max-w-3xl mx-auto">
            {/* Listening indicator */}
            {(isListening || isConnecting) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Microphone weight="fill" className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="text-sm text-primary font-medium">
                  {isConnecting ? "Connexion..." : "🎙️ Écoute en cours..."}
                </span>
                {partialTranscript && (
                  <span className="text-sm text-foreground/60 italic truncate flex-1">
                    {partialTranscript}
                  </span>
                )}
              </motion.div>
            )}

            {/* Selected file preview */}
            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
              >
                {filePreview ? (
                  <img src={filePreview} className="w-10 h-10 rounded-lg object-cover" alt="Preview" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <FileIcon weight="light" className="w-5 h-5 text-foreground/60" />
                  </div>
                )}
                <span className="text-sm text-foreground/80 truncate flex-1">{selectedFile.name}</span>
                <button 
                  onClick={clearSelectedFile}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X weight="bold" className="w-4 h-4 text-foreground/60" />
                </button>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="relative">
              <div className="glass-card rounded-2xl border border-white/20 shadow-2xl shadow-black/10 overflow-hidden">
                {/* Input Area */}
                <div className="flex items-end gap-2 p-3">
                  <textarea
                    ref={inputRef}
                    value={isListening && partialTranscript ? input + (input ? ' ' : '') + partialTranscript : input}
                    onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Écoute en cours..." : "Pose-moi ta question..."}
                    className={cn(
                      "flex-1 bg-transparent border-0 focus:outline-none text-foreground placeholder:text-foreground/40 font-light resize-none min-h-[24px] max-h-[150px] py-2 px-2",
                      isListening && partialTranscript && "text-foreground/70 italic"
                    )}
                    disabled={isLoading}
                    rows={1}
                    readOnly={isListening}
                  />
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between px-3 pb-3 pt-0">
                  <div className="flex items-center gap-1">
                    {/* Attach Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-lg text-foreground/50 hover:text-foreground/80 hover:bg-white/5 transition-colors"
                      title="Joindre un fichier"
                    >
                      <Paperclip weight="light" className="w-5 h-5" />
                    </button>

                    {/* Voice Input Button */}
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      disabled={!sttSupported || isConnecting}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        isListening 
                          ? "text-primary bg-primary/20 animate-pulse" 
                          : isConnecting
                          ? "text-foreground/30 cursor-wait"
                          : "text-foreground/50 hover:text-foreground/80 hover:bg-white/5"
                      )}
                      title={isListening ? "Arrêter la dictée" : "Dictée vocale"}
                    >
                      <Microphone weight={isListening ? "fill" : "light"} className="w-5 h-5" />
                    </button>

                    {/* Source Button */}
                    <button
                      type="button"
                      className="p-2 rounded-lg text-foreground/50 hover:text-foreground/80 hover:bg-white/5 transition-colors flex items-center gap-1.5"
                      title="Source de connaissances"
                    >
                      <Database weight="light" className="w-5 h-5" />
                      <span className="text-xs">VitaSync</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground/30">
                      {input.length}/{MAX_CHARS}
                    </span>
                    
                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "p-2.5 rounded-xl transition-all duration-200",
                        input.trim() && !isLoading
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30"
                          : "bg-white/10 text-foreground/30 cursor-not-allowed"
                      )}
                    >
                      <PaperPlaneTilt weight="fill" className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Disclaimer */}
            <p className="text-center text-xs text-foreground/30 mt-3">
              VitaSync AI peut afficher des informations inexactes. Vérifiez les conseils importants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
