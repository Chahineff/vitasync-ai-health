import { motion } from 'framer-motion';
import { Copy, Check, SpeakerHigh, User as UserIcon, ArrowsClockwise, Sparkle } from '@phosphor-icons/react';
import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { ProductRecommendationCard, parseProductRecommendations, SubscriptionCard } from '../ProductRecommendationCard';
import { ChatQuizBlock, parseQuizBlock } from './ChatQuizBlock';
import { ChatChartBlock, parseChartBlocks } from './ChatChartBlock';

const vitasyncLogoUrl = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

interface ChatMessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onQuizComplete?: (summary: string) => void;
}

function MessageContent({ content, isStreaming, onQuizComplete }: { content: string; isStreaming?: boolean; onQuizComplete?: (summary: string) => void }) {
  // Check for quiz blocks first
  const { beforeQuiz, quiz, afterQuiz } = parseQuizBlock(content);
  // Parse charts from content
  const chartResult = parseChartBlocks(quiz ? beforeQuiz : content);
  const { text, products, subscription } = parseProductRecommendations(chartResult.text);
  const charts = chartResult.charts;
  
  const streamingCursor = isStreaming ? (
    <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle animate-cursor-blink" />
  ) : null;

  if (products.length === 0 && !subscription && !quiz && charts.length === 0) {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none font-light leading-relaxed">
        <ReactMarkdown>{content}</ReactMarkdown>
        {streamingCursor}
      </div>
    );
  }

  // If there's a quiz, render it
  if (quiz) {
    return (
      <div className="space-y-4">
        {beforeQuiz && (
          <div className="prose prose-sm dark:prose-invert max-w-none font-light leading-relaxed">
            <ReactMarkdown>{beforeQuiz}</ReactMarkdown>
          </div>
        )}
        <ChatQuizBlock quiz={quiz} onComplete={onQuizComplete || (() => {})} />
        {afterQuiz && (
          <div className="prose prose-sm dark:prose-invert max-w-none font-light leading-relaxed">
            <ReactMarkdown>{afterQuiz}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  }

  const parts = text.split(/__(?:PRODUCT|CHART)_(\d+)__/);
  const elements: React.ReactNode[] = [];
  
  // Build a map of placeholder positions
  const placeholderRegex = /__(?:PRODUCT|CHART)_(\d+)__/g;
  const placeholders: Array<{ type: 'product' | 'chart'; index: number }> = [];
  let m;
  while ((m = placeholderRegex.exec(text)) !== null) {
    const isChart = text.substring(m.index, m.index + 8) === '__CHART_';
    placeholders.push({ type: isChart ? 'chart' : 'product', index: parseInt(m[1], 10) });
  }
  
  let elementCounter = 0;
  parts.forEach((part, index) => {
    if (index % 2 === 1) {
      const placeholderIdx = Math.floor(index / 2);
      const placeholder = placeholders[placeholderIdx];
      if (placeholder?.type === 'product') {
        const product = products[placeholder.index];
        if (product) {
          elements.push(<ProductRecommendationCard key={`el-${elementCounter++}`} product={product} />);
        }
      } else if (placeholder?.type === 'chart') {
        const chart = charts[placeholder.index];
        if (chart) {
          elements.push(<ChatChartBlock key={`el-${elementCounter++}`} chart={chart} />);
        }
      }
    } else if (part && part.trim()) {
      elements.push(
        <div key={`el-${elementCounter++}`} className="prose prose-sm dark:prose-invert max-w-none font-light leading-relaxed">
          <ReactMarkdown>{part.trim()}</ReactMarkdown>
        </div>
      );
    }
  });
  
  if (subscription) {
    elements.push(<SubscriptionCard key="subscription" subscription={subscription} />);
  }
  
  // Append cursor to last element
  if (streamingCursor) {
    elements.push(<span key="cursor">{streamingCursor}</span>);
  }
  
  return <div className="space-y-2">{elements}</div>;
}

function TTSButton({ content }: { content: string }) {
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis();
  if (!isSupported) return null;

  return (
    <button
      onClick={() => isSpeaking ? stop() : speak(content)}
      className={cn(
        "p-1.5 rounded-lg transition-all duration-200",
        isSpeaking 
          ? "bg-primary/20 text-primary" 
          : "text-foreground/40 hover:text-foreground/70 hover:bg-white/5"
      )}
      title={isSpeaking ? "Arrêter la lecture" : "Lire à voix haute"}
    >
      {isSpeaking ? (
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
          <SpeakerHigh weight="fill" className="w-4 h-4" />
        </motion.div>
      ) : (
        <SpeakerHigh weight="light" className="w-4 h-4" />
      )}
    </button>
  );
}

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
        copied ? "bg-secondary/20 text-secondary" : "text-foreground/40 hover:text-foreground/70 hover:bg-white/5"
      )}
      title={copied ? "Copié !" : "Copier"}
    >
      {copied ? (
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: [1.2, 1] }} transition={{ duration: 0.3 }}>
          <Check weight="bold" className="w-4 h-4" />
        </motion.div>
      ) : (
        <Copy weight="light" className="w-4 h-4" />
      )}
    </button>
  );
}

export function ChatMessageBubble({ role, content, isStreaming, onRegenerate, onQuizComplete }: ChatMessageBubbleProps) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 30, scale: 0.95, filter: "blur(4px)" }}
        animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex gap-4 justify-end"
      >
        <div className="max-w-[75%]">
          <div className="rounded-2xl px-5 py-4 bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
            <p className="text-sm font-light leading-relaxed">{content}</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
          <UserIcon weight="fill" className="w-5 h-5 text-primary" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30, scale: 0.95, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex items-start gap-4"
    >
      {/* AI Avatar */}
      <motion.div 
        className={cn(
          "w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-2 flex-shrink-0 border border-white/20 relative"
        )}
      animate={isStreaming ? { 
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 10px 2px rgba(0, 240, 255, 0.2)",
            "0 0 20px 4px rgba(0, 240, 255, 0.4)",
            "0 0 10px 2px rgba(0, 240, 255, 0.2)"
          ]
        } : {}}
        transition={isStreaming ? { 
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          boxShadow: { duration: 1.5, repeat: Infinity }
        } : {}}
      >
        <img src={vitasyncLogoUrl} alt="VitaSync" className="w-full h-full object-contain" />
      </motion.div>
      
      <div className="flex-1 space-y-2 pt-1">
        <div className="flex items-center gap-2 mb-2">
          <Sparkle weight="fill" className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground/50">VitaSync AI</span>
        </div>

        <div className="text-foreground/90 relative">
          <MessageContent content={content} isStreaming={isStreaming} onQuizComplete={onQuizComplete} />
          {/* Gradient mask during streaming for progressive reveal */}
          {isStreaming && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          )}
        </div>

        {/* Action buttons with stagger */}
        {content && !isStreaming && (
          <div className="flex items-center gap-1 pt-2">
            {[
              <CopyButton key="copy" content={content} />,
              <TTSButton key="tts" content={content} />,
              onRegenerate && (
                <button
                  key="regen"
                  onClick={onRegenerate}
                  className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground/70 hover:bg-white/5 transition-all duration-200"
                  title="Régénérer"
                >
                  <ArrowsClockwise weight="light" className="w-4 h-4" />
                </button>
              ),
            ].filter(Boolean).map((btn, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.25 }}
              >
                {btn}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
