import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowUp, ChartLine, CalendarBlank } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";

export function ChatPreviewWidget() {
  const { t } = useTranslation();
  const [convIndex, setConvIndex] = useState(0);
  const [phase, setPhase] = useState<"typing-q" | "answer-in" | "done">("typing-q");
  const [qChars, setQChars] = useState(0);
  const [aLines, setALines] = useState(0);

  const conversations = [
    {
      question: t("chatPreview.q1"),
      answer: {
        intro: t("chatPreview.a1Intro"),
        heading: t("chatPreview.a1Heading"),
        items: [t("chatPreview.a1Item1"), t("chatPreview.a1Item2"), t("chatPreview.a1Item3")],
        chart: { label: t("chatPreview.a1ChartLabel"), value: "3.6", unit: "/5", trend: t("chatPreview.a1ChartTrend") },
      },
    },
    {
      question: t("chatPreview.q2"),
      answer: {
        intro: t("chatPreview.a2Intro"),
        heading: t("chatPreview.a2Heading"),
        items: [t("chatPreview.a2Item1"), t("chatPreview.a2Item2"), t("chatPreview.a2Item3")],
        chart: { label: t("chatPreview.a2ChartLabel"), value: "72", unit: "%", trend: t("chatPreview.a2ChartTrend") },
      },
    },
  ];

  const conv = conversations[convIndex];
  const totalAnswerLines = 2 + conv.answer.items.length + 1;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing-q") {
      if (qChars < conv.question.length) {
        timer = setTimeout(() => setQChars((c) => c + 1), 35);
      } else {
        timer = setTimeout(() => { setALines(0); setPhase("answer-in"); }, 600);
      }
    } else if (phase === "answer-in") {
      if (aLines < totalAnswerLines) {
        timer = setTimeout(() => setALines((l) => l + 1), 350);
      } else {
        timer = setTimeout(() => setPhase("done"), 3000);
      }
    } else if (phase === "done") {
      timer = setTimeout(() => {
        setConvIndex((i) => (i + 1) % conversations.length);
        setQChars(0);
        setALines(0);
        setPhase("typing-q");
      }, 400);
    }

    return () => clearTimeout(timer);
  }, [phase, qChars, aLines, conv, totalAnswerLines]);

  const renderBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <span key={i} className="font-semibold text-foreground">{part}</span> : part
    );
  };

  const Sparkline = () => (
    <svg viewBox="0 0 120 32" className="w-full h-8 mt-1">
      <defs>
        <linearGradient id="spark-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,24 L15,20 L30,22 L45,16 L60,18 L75,12 L90,10 L105,6 L120,8" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
      <path d="M0,24 L15,20 L30,22 L45,16 L60,18 L75,12 L90,10 L105,6 L120,8 L120,32 L0,32Z" fill="url(#spark-grad)" />
    </svg>
  );

  return (
    <div className="w-full h-full flex flex-col gap-3 justify-end p-1">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-xl sm:rounded-2xl border border-border/50 bg-background/80 backdrop-blur-xl px-2.5 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-lg">
        <span className="flex-1 text-[11px] sm:text-sm text-foreground/80 font-light tracking-tight">
          {conv.question.slice(0, qChars)}
          <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="inline-block w-[2px] h-4 bg-primary ml-0.5 align-middle" />
        </span>
        <motion.div animate={{ scale: qChars >= conv.question.length ? [1, 1.1, 1] : 1 }} transition={{ duration: 0.3 }} className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${qChars >= conv.question.length ? "bg-primary" : "bg-muted"}`}>
          <ArrowUp weight="bold" className={`w-3.5 h-3.5 ${qChars >= conv.question.length ? "text-primary-foreground" : "text-foreground/30"}`} />
        </motion.div>
      </motion.div>

      {phase !== "typing-q" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-xl sm:rounded-2xl border border-border/40 bg-card/90 backdrop-blur-xl overflow-hidden shadow-xl">
          <div className="px-2.5 py-2 sm:px-4 sm:py-3 space-y-2">
            {aLines >= 1 && (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] sm:text-xs leading-relaxed text-foreground/70">
                {renderBold(conv.answer.intro)}
              </motion.p>
            )}
            {aLines >= 2 && (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] sm:text-xs font-semibold text-foreground tracking-wide uppercase">
                {conv.answer.heading}
              </motion.p>
            )}
            {conv.answer.items.map((item, i) =>
              aLines >= 3 + i ? (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="text-[10px] sm:text-xs text-foreground/70 pl-2 border-l-2 border-primary/40">
                  {item}
                </motion.div>
              ) : null
            )}
          </div>

          {aLines >= totalAnswerLines && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-2 mb-2 sm:mx-3 sm:mb-3 rounded-lg sm:rounded-xl bg-muted/50 border border-border/30 p-2 sm:p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/50">{conv.answer.chart.label}</span>
                <div className="flex gap-1.5">
                  <ChartLine weight="bold" className="w-3.5 h-3.5 text-foreground/30" />
                  <CalendarBlank weight="bold" className="w-3.5 h-3.5 text-foreground/30" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-semibold text-foreground">{conv.answer.chart.value}</span>
                <span className="text-xs text-foreground/40">{conv.answer.chart.unit}</span>
              </div>
              <span className="text-[10px] text-primary font-medium">{conv.answer.chart.trend}</span>
              <Sparkline />
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
