import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardText, Check, ArrowRight, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
}

interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

export function parseQuizBlock(content: string): { beforeQuiz: string; quiz: QuizData | null; afterQuiz: string } {
  // More tolerant regex: allow whitespace/newlines around tags
  const startRegex = /\[\[\s*QUIZ_START\s*\]\]/i;
  const endRegex = /\[\[\s*QUIZ_END\s*\]\]/i;
  
  const startMatch = startRegex.exec(content);
  const endMatch = endRegex.exec(content);
  
  if (!startMatch || !endMatch || endMatch.index <= startMatch.index) {
    return { beforeQuiz: content, quiz: null, afterQuiz: '' };
  }
  
  const beforeQuiz = content.slice(0, startMatch.index).trim();
  const afterQuiz = content.slice(endMatch.index + endMatch[0].length).trim();
  const quizBlock = content.slice(startMatch.index + startMatch[0].length, endMatch.index).trim();
  
  const lines = quizBlock.split('\n').map(l => l.trim()).filter(Boolean);
  
  let title = 'Quiz Personnalisé';
  const questions: QuizQuestion[] = [];
  
  for (const line of lines) {
    if (/^TITLE\s*:/i.test(line)) {
      title = line.replace(/^TITLE\s*:\s*/i, '').trim();
    } else if (/^Q\d+\s*:/i.test(line)) {
      const parts = line.replace(/^Q\d+\s*:\s*/i, '').split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        questions.push({
          id: questions.length,
          text: parts[0],
          options: parts.slice(1)
        });
      }
    }
  }
  
  if (questions.length === 0) {
    return { beforeQuiz: content, quiz: null, afterQuiz: '' };
  }
  
  return { beforeQuiz, quiz: { title, questions }, afterQuiz };
}

interface ChatQuizBlockProps {
  quiz: QuizData;
  onComplete: (summary: string) => void;
}

// Inline button shown in the chat bubble
export function ChatQuizTrigger({ quiz, onComplete }: ChatQuizBlockProps) {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (completed) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
        <Check weight="bold" className="w-5 h-5 text-secondary" />
        <span className="text-sm font-medium text-foreground">Quiz terminé !</span>
      </div>
    );
  }

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setOverlayOpen(true)}
        className="w-full p-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 hover:from-primary/15 hover:to-secondary/15 transition-all flex items-center gap-3"
      >
        <ClipboardText weight="duotone" className="w-6 h-6 text-primary" />
        <div className="text-left flex-1">
          <p className="text-sm font-semibold text-foreground">{quiz.title}</p>
          <p className="text-xs text-foreground/50">{quiz.questions.length} questions — Cliquez pour commencer</p>
        </div>
        <ArrowRight weight="bold" className="w-5 h-5 text-primary" />
      </motion.button>

      <AnimatePresence>
        {overlayOpen && (
          <QuizOverlay
            quiz={quiz}
            onClose={() => setOverlayOpen(false)}
            onComplete={(summary) => {
              setCompleted(true);
              setOverlayOpen(false);
              onComplete(summary);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Full-screen overlay quiz (75% of screen)
function QuizOverlay({ quiz, onClose, onComplete }: { quiz: QuizData; onClose: () => void; onComplete: (summary: string) => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const question = quiz.questions[currentQ];
  const isLast = currentQ === quiz.questions.length - 1;
  const allAnswered = Object.keys(answers).length === quiz.questions.length;

  const handleSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQ]: option }));
    if (!isLast) {
      setTimeout(() => setCurrentQ(prev => prev + 1), 300);
    }
  };

  const handleSubmit = () => {
    const summary = quiz.questions.map((q, i) =>
      `${q.text} → ${answers[i] || 'Non répondu'}`
    ).join('\n');
    onComplete(`Voici mes réponses au quiz "${quiz.title}" :\n\n${summary}\n\nQue me recommandes-tu ?`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl max-h-[75vh] overflow-y-auto rounded-3xl border border-border/50 bg-background shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-5 border-b border-border/50 bg-background/95 backdrop-blur-xl rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardText weight="duotone" className="w-6 h-6 text-primary" />
            <div>
              <h4 className="text-base font-semibold text-foreground">{quiz.title}</h4>
              <p className="text-xs text-foreground/50">
                Question {currentQ + 1}/{quiz.questions.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            title="Quitter le quiz"
          >
            <X weight="bold" className="w-5 h-5 text-foreground/50" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <div className="h-1.5 rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              animate={{ width: `${((currentQ + (answers[currentQ] ? 1 : 0)) / quiz.questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        {question && (
          <div className="p-6">
            <p className="text-base font-medium text-foreground mb-5">{question.text}</p>
            <div className="grid gap-3">
              {question.options.map((option) => (
                <motion.button
                  key={option}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "p-4 rounded-xl border text-left text-sm transition-all duration-200",
                    answers[currentQ] === option
                      ? "border-primary bg-primary/10 text-foreground font-medium"
                      : "border-border/50 bg-muted/30 hover:border-primary/30 hover:bg-muted/50 text-foreground/80"
                  )}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation / Submit */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="text-sm text-foreground/50 hover:text-foreground disabled:opacity-30 transition-colors"
          >
            ← Précédent
          </button>

          {allAnswered ? (
            <motion.button
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors text-sm"
            >
              <span>Envoyer les résultats au coach</span>
              <ArrowRight weight="bold" className="w-4 h-4" />
            </motion.button>
          ) : !isLast && answers[currentQ] ? (
            <button
              onClick={() => setCurrentQ(prev => prev + 1)}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Suivant →
            </button>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Keep backward compatibility export
export function ChatQuizBlock({ quiz, onComplete }: ChatQuizBlockProps) {
  return <ChatQuizTrigger quiz={quiz} onComplete={onComplete} />;
}
