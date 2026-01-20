import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Check, Clock, Sun, Moon } from '@phosphor-icons/react';

interface Supplement {
  id: string;
  name: string;
  time: 'morning' | 'evening';
  taken: boolean;
}

const SupplementTracker = () => {
  const [supplements, setSupplements] = useState<Supplement[]>([
    { id: '1', name: 'Vitamine D3', time: 'morning', taken: false },
    { id: '2', name: 'Oméga-3', time: 'morning', taken: false },
    { id: '3', name: 'Magnésium', time: 'evening', taken: false },
    { id: '4', name: 'Zinc', time: 'evening', taken: false },
  ]);

  const toggleSupplement = (id: string) => {
    setSupplements(prev =>
      prev.map(s => (s.id === id ? { ...s, taken: !s.taken } : s))
    );
  };

  const takenCount = supplements.filter(s => s.taken).length;
  const totalCount = supplements.length;
  const progressPercent = (takenCount / totalCount) * 100;

  const morningSupplements = supplements.filter(s => s.time === 'morning');
  const eveningSupplements = supplements.filter(s => s.time === 'evening');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-premium rounded-2xl p-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
            <Pill weight="light" className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-light tracking-tight text-foreground">
              Compléments du jour
            </h3>
            <p className="text-xs text-foreground/50 font-light">
              {takenCount}/{totalCount} pris aujourd'hui
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-2 bg-white/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
          />
        </div>
      </div>

      {/* Morning supplements */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sun weight="light" className="w-4 h-4 text-secondary" />
          <span className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
            Matin
          </span>
        </div>
        <div className="space-y-2">
          {morningSupplements.map(supplement => (
            <SupplementItem
              key={supplement.id}
              supplement={supplement}
              onToggle={toggleSupplement}
            />
          ))}
        </div>
      </div>

      {/* Evening supplements */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Moon weight="light" className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
            Soir
          </span>
        </div>
        <div className="space-y-2">
          {eveningSupplements.map(supplement => (
            <SupplementItem
              key={supplement.id}
              supplement={supplement}
              onToggle={toggleSupplement}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

interface SupplementItemProps {
  supplement: Supplement;
  onToggle: (id: string) => void;
}

const SupplementItem = ({ supplement, onToggle }: SupplementItemProps) => {
  return (
    <button
      onClick={() => onToggle(supplement.id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        supplement.taken
          ? 'bg-secondary/10 border border-secondary/30'
          : 'bg-white/30 border border-white/20 hover:bg-white/50'
      }`}
    >
      <div
        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
          supplement.taken
            ? 'bg-secondary text-white'
            : 'bg-white/50 border border-white/30'
        }`}
      >
        {supplement.taken && <Check weight="bold" className="w-4 h-4" />}
      </div>
      <span
        className={`text-sm font-light ${
          supplement.taken ? 'text-foreground/60 line-through' : 'text-foreground'
        }`}
      >
        {supplement.name}
      </span>
      {!supplement.taken && (
        <Clock weight="light" className="w-4 h-4 text-foreground/30 ml-auto" />
      )}
    </button>
  );
};

export default SupplementTracker;
