import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { PaperPlaneRight } from "@phosphor-icons/react";

const vitasyncLogoUrl = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

const conversations = [
  {
    question: "Quels compléments pour mieux dormir ?",
    answer: "Je te recommande le **Magnésium Bisglycinate** (300mg le soir) et la **L-Théanine** (200mg). Ces deux agissent en synergie pour favoriser un sommeil profond et réparateur. 🌙",
  },
  {
    question: "J'ai souvent des coups de fatigue l'après-midi",
    answer: "C'est un signe classique de carence en **Vitamine B12** ou en **Fer**. Je te suggère un check-up de ton profil énergétique et d'essayer le **CoQ10** (100mg) après le déjeuner. ⚡",
  },
  {
    question: "Comment booster mon immunité cet hiver ?",
    answer: "Un trio efficace : **Vitamine D3** (2000 UI/jour), **Zinc** (15mg) et **Vitamine C** liposomale (1000mg). Ajoute du **Sureau** en cas de premiers symptômes. 🛡️",
  },
];

export function ChatPreviewWidget() {
  const [convIndex, setConvIndex] = useState(0);
  const [phase, setPhase] = useState<"typing-q" | "sent" | "thinking" | "typing-a" | "done">("typing-q");
  const [displayedChars, setDisplayedChars] = useState(0);

  const conv = conversations[convIndex];

  // Cycle through phases
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing-q") {
      if (displayedChars < conv.question.length) {
        timer = setTimeout(() => setDisplayedChars((c) => c + 1), 30);
      } else {
        timer = setTimeout(() => setPhase("sent"), 400);
      }
    } else if (phase === "sent") {
      timer = setTimeout(() => setPhase("thinking"), 300);
    } else if (phase === "thinking") {
      timer = setTimeout(() => {
        setDisplayedChars(0);
        setPhase("typing-a");
      }, 1200);
    } else if (phase === "typing-a") {
      const plainAnswer = conv.answer.replace(/\*\*/g, "");
      if (displayedChars < plainAnswer.length) {
        timer = setTimeout(() => setDisplayedChars((c) => c + 1), 18);
      } else {
        timer = setTimeout(() => setPhase("done"), 2500);
      }
    } else if (phase === "done") {
      timer = setTimeout(() => {
        setConvIndex((i) => (i + 1) % conversations.length);
        setDisplayedChars(0);
        setPhase("typing-q");
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [phase, displayedChars, conv]);

  const renderAnswer = (text: string, chars: number) => {
    const plain = text.replace(/\*\*/g, "");
    const visible = plain.slice(0, chars);
    
    // Simple bold rendering
    let result = "";
    let boldOpen = false;
    let plainIdx = 0;
    
    for (let i = 0; i < text.length && plainIdx < chars; i++) {
      if (text[i] === '*' && text[i + 1] === '*') {
        if (boldOpen) {
          result += '</b>';
        } else {
          result += '<b>';
        }
        boldOpen = !boldOpen;
        i++; // skip second *
      } else {
        result += text[i];
        plainIdx++;
      }
    }
    if (boldOpen) result += '</b>';
    
    return result;
  };

  return (
    <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl">
      {/* Chat header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/30 bg-muted/30">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <img src={vitasyncLogoUrl} alt="" className="w-4 h-4 object-contain" />
        </div>
        <div>
          <p className="text-xs font-medium text-foreground">Coach IA VitaSync</p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] text-foreground/40">En ligne</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 px-3 py-3 space-y-2.5 overflow-hidden flex flex-col justify-end min-h-0">
        <AnimatePresence mode="wait">
          <motion.div key={`conv-${convIndex}`} className="space-y-2.5">
            {/* User message */}
            {(phase !== "typing-q" || displayedChars > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex justify-end"
              >
                <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-br-md bg-primary text-primary-foreground text-xs leading-relaxed">
                  {phase === "typing-q" 
                    ? conv.question.slice(0, displayedChars)
                    : conv.question
                  }
                  {phase === "typing-q" && (
                    <span className="inline-block w-0.5 h-3 bg-primary-foreground/70 ml-0.5 animate-pulse" />
                  )}
                </div>
              </motion.div>
            )}

            {/* AI thinking indicator */}
            {phase === "thinking" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                  <img src={vitasyncLogoUrl} alt="" className="w-3.5 h-3.5 object-contain" />
                </div>
                <div className="px-3 py-2 rounded-2xl rounded-bl-md bg-muted/60 border border-border/30">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary/50"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI response */}
            {(phase === "typing-a" || phase === "done") && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                  <img src={vitasyncLogoUrl} alt="" className="w-3.5 h-3.5 object-contain" />
                </div>
                <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-bl-md bg-muted/60 border border-border/30 text-xs text-foreground/80 leading-relaxed">
                  <span 
                    dangerouslySetInnerHTML={{ 
                      __html: renderAnswer(conv.answer, displayedChars) 
                    }} 
                  />
                  {phase === "typing-a" && (
                    <span className="inline-block w-0.5 h-3 bg-primary/60 ml-0.5 animate-pulse" />
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="px-3 py-2.5 border-t border-border/30 bg-muted/20">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border/40">
          <span className="text-[11px] text-foreground/30 flex-1">Posez votre question...</span>
          <div className="w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center">
            <PaperPlaneRight weight="fill" className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}