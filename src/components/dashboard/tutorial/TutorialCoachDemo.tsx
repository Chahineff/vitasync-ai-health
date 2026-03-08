import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaperPlaneRight, Microphone, List, CaretDown, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const vitasyncLogo = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

const FAKE_CONVERSATIONS = [
  { id: "1", title: "Ma routine du matin", date: "Aujourd'hui" },
  { id: "2", title: "Dosage créatine", date: "Hier" },
  { id: "3", title: "Problèmes de sommeil", date: "Il y a 3 jours" },
];

const AI_MODELS = [
  { id: "vs-3-flash", label: "VitaSync 3 Flash", desc: "Rapide & équilibré", active: true },
  { id: "vs-3-pro", label: "VitaSync 3 Pro", desc: "Raisonnement avancé", active: false },
  { id: "vs-5", label: "VitaSync 5", desc: "Haute précision", active: false },
  { id: "vs-5-mini", label: "VitaSync 5 Mini", desc: "Léger & rapide", active: false },
  { id: "vs-5-nano", label: "VitaSync 5 Nano", desc: "Ultra-rapide", active: false },
];

const FAKE_MESSAGES: { role: "user" | "assistant"; content: string }[] = [
  { role: "user", content: "Bonjour ! J'ai du mal à dormir ces derniers temps, tu as des conseils ?" },
  { role: "assistant", content: "Bien sûr ! D'après ton profil, je te recommande d'essayer le **Magnésium Bisglycinate** (400mg) environ 30 minutes avant de dormir. C'est la forme la plus biodisponible et la mieux tolérée.\n\nTu pourrais aussi :\n- Réduire la lumière bleue 1h avant le coucher\n- Maintenir une température de chambre à 18-19°C\n- Éviter la caféine après 14h 💊" },
  { role: "user", content: "Merci ! Et le magnésium, je peux le prendre avec ma créatine du soir ?" },
];

export function TutorialCoachDemo() {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  useEffect(() => {
    FAKE_MESSAGES.forEach((_, i) => {
      setTimeout(() => setVisibleMessages(i + 1), 600 + i * 900);
    });
    // Show model dropdown briefly
    const t1 = setTimeout(() => setShowModelDropdown(true), 3500);
    const t2 = setTimeout(() => setShowModelDropdown(false), 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)] rounded-3xl border border-white/10 overflow-hidden bg-background/50 backdrop-blur-xl">
      {/* Chat Sidebar (desktop only) */}
      <div className="hidden lg:flex flex-col w-72 border-r border-white/10 bg-background/30">
        <div className="p-4 border-b border-white/10">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            + Nouvelle conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {FAKE_CONVERSATIONS.map((conv, i) => (
            <div
              key={conv.id}
              className={cn(
                "px-3 py-2.5 rounded-xl text-sm cursor-default transition-all",
                i === 0 ? "bg-primary/10 text-primary border border-primary/20" : "text-foreground/60"
              )}
            >
              <p className="truncate font-light">{conv.title}</p>
              <p className="text-xs text-foreground/30 mt-0.5">{conv.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 lg:hidden">
            <List weight="light" className="w-5 h-5 text-foreground/60" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <img src={vitasyncLogo} alt="" className="w-4 h-4" />
              <span className="text-sm text-foreground/70 font-light">VitaSync 3 Flash</span>
              <CaretDown weight="light" className="w-3 h-3 text-foreground/40" />
            </div>

            {/* Model dropdown */}
            <AnimatePresence>
              {showModelDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-card border border-border/50 shadow-xl shadow-black/20 overflow-hidden z-10"
                >
                  <div className="p-2 space-y-0.5">
                    {AI_MODELS.map(model => (
                      <div
                        key={model.id}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                          model.active ? "bg-primary/10 text-primary" : "text-foreground/70"
                        )}
                      >
                        <img src={vitasyncLogo} alt="" className="w-4 h-4 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{model.label}</p>
                          <p className="text-[11px] text-foreground/40 font-light">{model.desc}</p>
                        </div>
                        {model.active && <Check weight="bold" className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="w-5" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          <AnimatePresence>
            {FAKE_MESSAGES.slice(0, visibleMessages).map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.35 }}
                className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <img src={vitasyncLogo} alt="" className="w-5 h-5" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[80%] px-4 py-3 rounded-2xl text-sm font-light leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card/80 border border-white/10 text-foreground/80 rounded-bl-md"
                )}>
                  {msg.content.split('\n').map((line, li) => (
                    <p key={li} className={li > 0 ? "mt-1.5" : ""}>{line}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator after last message */}
          {visibleMessages === FAKE_MESSAGES.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3 items-start"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                <img src={vitasyncLogo} alt="" className="w-5 h-5" />
              </div>
              <div className="bg-card/80 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-primary/40"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-gradient-to-t from-background to-transparent">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card/60 border border-white/10 backdrop-blur-sm">
            <span className="flex-1 text-sm text-foreground/30 font-light">Posez votre question…</span>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-foreground/30">
              <Microphone weight="light" className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <PaperPlaneRight weight="fill" className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
