import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PaperPlaneTilt, ArrowsLeftRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface BodyZone {
  id: string;
  label: string;
  path: string;
}

const FRONT_ZONES: BodyZone[] = [
  { id: 'head', label: 'Tête', path: 'M88,18 C88,8 98,2 108,2 C118,2 128,8 128,18 L128,34 C128,44 118,52 108,52 C98,52 88,44 88,34 Z' },
  { id: 'neck', label: 'Cou', path: 'M100,52 L116,52 L118,68 L98,68 Z' },
  { id: 'left-shoulder', label: 'Épaule gauche', path: 'M60,68 L98,68 L96,90 L56,82 Z' },
  { id: 'right-shoulder', label: 'Épaule droite', path: 'M118,68 L156,68 L160,82 L120,90 Z' },
  { id: 'chest', label: 'Poitrine', path: 'M96,68 L120,68 L120,110 L96,110 Z' },
  { id: 'left-arm', label: 'Bras gauche', path: 'M44,82 L56,82 L52,150 L38,148 Z' },
  { id: 'right-arm', label: 'Bras droit', path: 'M160,82 L172,82 L178,148 L164,150 Z' },
  { id: 'abdomen', label: 'Abdomen', path: 'M92,110 L124,110 L126,160 L90,160 Z' },
  { id: 'left-hip', label: 'Hanche gauche', path: 'M78,155 L92,155 L88,180 L74,178 Z' },
  { id: 'right-hip', label: 'Hanche droite', path: 'M124,155 L138,155 L142,178 L128,180 Z' },
  { id: 'left-hand', label: 'Main gauche', path: 'M30,148 L44,148 L42,178 L26,176 Z' },
  { id: 'right-hand', label: 'Main droite', path: 'M172,148 L186,148 L190,176 L174,178 Z' },
  { id: 'left-thigh', label: 'Cuisse gauche', path: 'M78,178 L100,178 L96,248 L74,248 Z' },
  { id: 'right-thigh', label: 'Cuisse droite', path: 'M116,178 L138,178 L142,248 L120,248 Z' },
  { id: 'left-knee', label: 'Genou gauche', path: 'M76,248 L98,248 L96,274 L74,274 Z' },
  { id: 'right-knee', label: 'Genou droit', path: 'M118,248 L140,248 L142,274 L120,274 Z' },
  { id: 'left-calf', label: 'Mollet gauche', path: 'M76,274 L96,274 L94,340 L78,340 Z' },
  { id: 'right-calf', label: 'Mollet droit', path: 'M120,274 L140,274 L138,340 L122,340 Z' },
  { id: 'left-foot', label: 'Pied gauche', path: 'M72,340 L96,340 L96,362 L68,362 Z' },
  { id: 'right-foot', label: 'Pied droit', path: 'M120,340 L144,340 L148,362 L120,362 Z' },
];

const BACK_ZONES: BodyZone[] = [
  { id: 'head-back', label: 'Crâne', path: 'M88,18 C88,8 98,2 108,2 C118,2 128,8 128,18 L128,34 C128,44 118,52 108,52 C98,52 88,44 88,34 Z' },
  { id: 'nape', label: 'Nuque', path: 'M100,52 L116,52 L118,68 L98,68 Z' },
  { id: 'left-shoulder-back', label: 'Épaule gauche', path: 'M60,68 L98,68 L96,90 L56,82 Z' },
  { id: 'right-shoulder-back', label: 'Épaule droite', path: 'M118,68 L156,68 L160,82 L120,90 Z' },
  { id: 'upper-back', label: 'Haut du dos', path: 'M96,68 L120,68 L120,110 L96,110 Z' },
  { id: 'left-arm-back', label: 'Bras gauche', path: 'M44,82 L56,82 L52,150 L38,148 Z' },
  { id: 'right-arm-back', label: 'Bras droit', path: 'M160,82 L172,82 L178,148 L164,150 Z' },
  { id: 'lower-back', label: 'Bas du dos / Lombaires', path: 'M92,110 L124,110 L126,160 L90,160 Z' },
  { id: 'left-glute', label: 'Fessier gauche', path: 'M78,155 L104,155 L100,190 L74,188 Z' },
  { id: 'right-glute', label: 'Fessier droit', path: 'M112,155 L138,155 L142,188 L116,190 Z' },
  { id: 'left-hamstring', label: 'Ischio-jambier gauche', path: 'M78,190 L100,190 L96,248 L74,248 Z' },
  { id: 'right-hamstring', label: 'Ischio-jambier droit', path: 'M116,190 L138,190 L142,248 L120,248 Z' },
  { id: 'left-calf-back', label: 'Mollet gauche', path: 'M76,248 L96,248 L94,340 L78,340 Z' },
  { id: 'right-calf-back', label: 'Mollet droit', path: 'M120,248 L140,248 L138,340 L122,340 Z' },
  { id: 'left-heel', label: 'Talon gauche', path: 'M72,340 L96,340 L96,362 L68,362 Z' },
  { id: 'right-heel', label: 'Talon droit', path: 'M120,340 L144,340 L148,362 L120,362 Z' },
];

interface BodyMapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (message: string) => void;
}

export function BodyMapModal({ open, onOpenChange, onSubmit }: BodyMapModalProps) {
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'front' | 'back'>('front');

  const zones = view === 'front' ? FRONT_ZONES : BACK_ZONES;

  const toggleZone = (id: string) => {
    setSelectedZones(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getSelectedLabels = () => {
    const allZones = [...FRONT_ZONES, ...BACK_ZONES];
    return Array.from(selectedZones).map(id => allZones.find(z => z.id === id)?.label).filter(Boolean);
  };

  const handleSend = () => {
    const labels = getSelectedLabels();
    if (labels.length === 0) return;
    const zonesText = labels.join(', ');
    const message = `J'ai une douleur au niveau de : ${zonesText}. Peux-tu m'aider à identifier les causes possibles et me recommander des solutions ?`;
    onSubmit(message);
    setSelectedZones(new Set());
    setView('front');
    onOpenChange(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setSelectedZones(new Set());
      setView('front');
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[95vw] p-0 bg-background/95 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden gap-0">
        <DialogTitle className="sr-only">Carte corporelle interactive</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-foreground">Où avez-vous mal ?</h3>
          <button
            onClick={() => setView(v => v === 'front' ? 'back' : 'front')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <ArrowsLeftRight weight="bold" className="w-3.5 h-3.5" />
            {view === 'front' ? 'Dos' : 'Face'}
          </button>
        </div>

        {/* SVG Body */}
        <div className="flex justify-center px-5 py-2">
          <svg viewBox="0 0 216 370" className="w-full max-w-[240px] h-auto">
            {/* Body outline */}
            <g opacity={0.15} stroke="currentColor" strokeWidth="1" fill="none" className="text-foreground">
              {/* Head */}
              <ellipse cx="108" cy="26" rx="20" ry="24" />
              {/* Neck */}
              <rect x="100" y="50" width="16" height="18" rx="2" />
              {/* Torso */}
              <path d="M60,68 L156,68 L160,82 L148,160 L138,178 L78,178 L68,160 L56,82 Z" />
              {/* Arms */}
              <path d="M56,82 L44,82 L30,148 L42,178 L52,150 Z" />
              <path d="M160,82 L172,82 L186,148 L174,178 L164,150 Z" />
              {/* Legs */}
              <path d="M78,178 L100,178 L96,340 L68,362 L72,340 L74,248 Z" />
              <path d="M116,178 L138,178 L142,248 L144,340 L148,362 L120,340 Z" />
            </g>

            {/* Clickable zones */}
            {zones.map(zone => {
              const isSelected = selectedZones.has(zone.id);
              return (
                <g key={zone.id} onClick={() => toggleZone(zone.id)} className="cursor-pointer">
                  <path
                    d={zone.path}
                    fill={isSelected ? 'hsl(var(--primary) / 0.35)' : 'transparent'}
                    stroke={isSelected ? 'hsl(var(--primary))' : 'transparent'}
                    strokeWidth={isSelected ? 1.5 : 0}
                    className="transition-all duration-200 hover:fill-[hsl(var(--primary)/0.15)]"
                    style={isSelected ? { filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.4))' } : {}}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected zones labels */}
        <div className="px-5 min-h-[40px]">
          <AnimatePresence mode="popLayout">
            {getSelectedLabels().map(label => (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary mr-1.5 mb-1.5"
              >
                {label}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Send button */}
        <div className="px-5 pb-5 pt-2">
          <motion.button
            onClick={handleSend}
            disabled={selectedZones.size === 0}
            whileHover={selectedZones.size > 0 ? { scale: 1.02 } : {}}
            whileTap={selectedZones.size > 0 ? { scale: 0.98 } : {}}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-300",
              selectedZones.size > 0
                ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <PaperPlaneTilt weight="fill" className="w-4 h-4" />
            Envoyer à l'IA
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
