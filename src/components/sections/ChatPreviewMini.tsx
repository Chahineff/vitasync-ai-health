import { motion } from "framer-motion";

const vitasyncLogo = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

const messages = [
  { role: "user" as const, text: "Quels suppléments pour mieux dormir ?" },
  { role: "assistant" as const, text: "Je te recommande le **Magnésium Bisglycinate** (400mg) 30 min avant le coucher. C'est la forme la plus biodisponible 💊" },
  { role: "user" as const, text: "Je peux le prendre avec ma créatine ?" },
];

export function ChatPreviewMini({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col h-full bg-background/80 backdrop-blur-xl rounded-xl overflow-hidden border border-border/30 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/20 bg-card/50">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <img src={vitasyncLogo} alt="" className="w-3 h-3" />
        </div>
        <span className="text-[10px] text-foreground/60 font-medium">VitaSync Coach</span>
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
      </div>

      {/* Messages */}
      <div className="flex-1 px-2.5 py-2 space-y-2 overflow-hidden">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.25, duration: 0.3 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start gap-1.5"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <img src={vitasyncLogo} alt="" className="w-2.5 h-2.5" />
              </div>
            )}
            <div className={`max-w-[80%] px-2.5 py-1.5 rounded-xl text-[10px] leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-card/80 border border-border/20 text-foreground/70 rounded-bl-sm"
            }`}>
              {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
            </div>
          </motion.div>
        ))}
        {/* Typing indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2 }}
          className="flex gap-1.5 items-start"
        >
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
            <img src={vitasyncLogo} alt="" className="w-2.5 h-2.5" />
          </div>
          <div className="bg-card/80 border border-border/20 rounded-xl rounded-bl-sm px-2.5 py-2">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-1 h-1 rounded-full bg-primary/50"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Input */}
      <div className="px-2 pb-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card/60 border border-border/20">
          <span className="text-[9px] text-foreground/30 flex-1">Posez votre question…</span>
          <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="text-primary"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
