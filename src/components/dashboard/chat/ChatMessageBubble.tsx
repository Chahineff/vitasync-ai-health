import { motion } from 'framer-motion';
import { Copy, Check, SpeakerHigh, User as UserIcon, ArrowsClockwise } from '@phosphor-icons/react';
import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { ProductRecommendationCard, parseProductRecommendations, SubscriptionCard } from '../ProductRecommendationCard';

// Official VitaSync PNG Logo
const vitasyncLogoUrl = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

interface ChatMessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

// Render message content with product cards and subscription blocks
function MessageContent({ content }: { content: string }) {
  const { text, products, subscription } = parseProductRecommendations(content);
  
  // If no special content, just render markdown
  if (products.length === 0 && !subscription) {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none font-light leading-relaxed">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  // Split text by product placeholders
  const parts = text.split(/__PRODUCT_(\d+)__/);
  const elements: React.ReactNode[] = [];
  
  parts.forEach((part, index) => {
    // Check if this is a product index (odd indices after split are captured groups)
    if (index % 2 === 1) {
      const productIndex = parseInt(part, 10);
      const product = products[productIndex];
      if (product) {
        elements.push(
          <ProductRecommendationCard key={`product-${productIndex}`} product={product} />
        );
      }
    } else if (part && part.trim()) {
      // This is text content
      elements.push(
        <div key={`text-${index}`} className="prose prose-sm dark:prose-invert max-w-none font-light leading-relaxed">
          <ReactMarkdown>{part.trim()}</ReactMarkdown>
        </div>
      );
    }
  });
  
  // Add subscription card if present
  if (subscription) {
    elements.push(<SubscriptionCard key="subscription" subscription={subscription} />);
  }
  
  return <div className="space-y-2">{elements}</div>;
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

// Copy Button Component
function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-1.5 rounded-lg transition-all duration-200",
        copied 
          ? "bg-secondary/20 text-secondary" 
          : "text-foreground/40 hover:text-foreground/70 hover:bg-white/5"
      )}
      title={copied ? "Copié !" : "Copier"}
    >
      {copied ? (
        <Check weight="bold" className="w-4 h-4" />
      ) : (
        <Copy weight="light" className="w-4 h-4" />
      )}
    </button>
  );
}

export function ChatMessageBubble({ role, content, isStreaming, onRegenerate }: ChatMessageBubbleProps) {
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex gap-4",
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* AI Avatar with glow during streaming */}
      {isAssistant && (
        <motion.div 
          className={cn(
            "w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-2 flex-shrink-0 border border-white/20 relative",
            isStreaming && "animate-pulse-glow"
          )}
          animate={isStreaming ? { 
            boxShadow: [
              "0 0 10px 2px rgba(0, 240, 255, 0.2)",
              "0 0 20px 4px rgba(0, 240, 255, 0.4)",
              "0 0 10px 2px rgba(0, 240, 255, 0.2)"
            ]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <img src={vitasyncLogoUrl} alt="VitaSync" className="w-full h-full object-contain" />
        </motion.div>
      )}
      
      {/* Message Container */}
      <div className={cn("max-w-[75%] space-y-2", isUser && "order-first")}>
        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl px-5 py-4",
            isUser
              ? 'bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20'
              : 'bg-white/5 dark:bg-white/5 border border-white/10 backdrop-blur-sm'
          )}
        >
          {isAssistant ? (
            <MessageContent content={content} />
          ) : (
            <p className="text-sm font-light leading-relaxed">{content}</p>
          )}
        </div>

        {/* Action buttons for assistant messages */}
        {isAssistant && content && !isStreaming && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-1 px-2"
          >
            <CopyButton content={content} />
            <TTSButton content={content} />
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground/70 hover:bg-white/5 transition-all duration-200"
                title="Régénérer"
              >
                <ArrowsClockwise weight="light" className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
          <UserIcon weight="fill" className="w-5 h-5 text-primary" />
        </div>
      )}
    </motion.div>
  );
}
