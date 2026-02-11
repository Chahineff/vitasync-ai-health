import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardText, Check, ArrowRight } from '@phosphor-icons/react';
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
  const startTag = '[[QUIZ_START]]';
  const endTag = '[[QUIZ_END]]';
  
  const startIdx = content.indexOf(startTag);
  const endIdx = content.indexOf(endTag);
  
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return { beforeQuiz: content, quiz: null, afterQuiz: '' };
  }
  
  const beforeQuiz = content.slice(0, startIdx).trim();
  const afterQuiz = content.slice(endIdx + endTag.length).trim();
  const quizBlock = content.slice(startIdx + startTag.length, endIdx).trim();
  
  const lines = quizBlock.split('\n').map(l => l.trim()).filter(Boolean);
  
  let title = 'Quiz Personnalisé';
  const questions: QuizQuestion[] = [];
  
  for (const line of lines) {
    if (line.startsWith('TITLE:')) {
      title = line.slice(6).trim();
    } else if (/^Q\d+:/.test(line)) {
      const parts = line.replace(/^Q\d+:\s*/, '').split('|').map(p => p.trim());
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

export function ChatQuizBlock({ quiz, onComplete }: ChatQuizBlockProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [completed, setCompleted] = useState(false);
  
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
    
    setCompleted(true);
    onComplete(`Voici mes réponses au quiz "${quiz.title}" :\n\n${summary}\n\nQue me recommandes-tu ?`);
  };
  
  if (completed) {
    return (
      <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-center">
        <Check weight="bold" className="w-6 h-6 text-secondary mx-auto mb-2" />
        <p className="text-sm text-foreground/70">Quiz terminé ! Analyse en cours...</p>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-3">
          <ClipboardText weight="duotone" className="w-6 h-6 text-primary" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">{quiz.title}</h4>
            <p className="text-xs text-foreground/50">
              Question {currentQ + 1}/{quiz.questions.length}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            animate={{ width: `${((currentQ + (answers[currentQ] ? 1 : 0)) / quiz.questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      {/* Question */}
      {question && (
        <div className="p-5">
          <p className="text-sm font-medium text-foreground mb-4">{question.text}</p>
          <div className="grid gap-2">
            {question.options.map((option) => (
              <motion.button
                key={option}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(option)}
                className={cn(
                  "p-3 rounded-xl border text-left text-sm transition-all duration-200",
                  answers[currentQ] === option
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 text-foreground/80"
                )}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </div>
      )}
      
      {/* Submit button */}
      {allAnswered && (
        <div className="px-5 pb-5">
          <motion.button
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="w-full p-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors text-sm"
          >
            <span>Terminer le quiz</span>
            <ArrowRight weight="bold" className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
