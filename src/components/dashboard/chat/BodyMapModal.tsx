import { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperPlaneTilt, SpinnerGap } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Canvas } from '@react-three/fiber';
import { HumanBody3D, BODY_PARTS } from './body-map/HumanBody3D';

interface BodyMapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (message: string) => void;
}

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <SpinnerGap className="w-8 h-8 text-primary animate-spin" weight="bold" />
      <p className="text-xs text-muted-foreground">Chargement du modèle 3D…</p>
    </div>
  );
}

export function BodyMapModal({ open, onOpenChange, onSubmit }: BodyMapModalProps) {
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const togglePart = (id: string) => {
    setSelectedParts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getSelectedLabels = () =>
    Array.from(selectedParts)
      .map(id => BODY_PARTS.find(p => p.id === id)?.label)
      .filter(Boolean) as string[];

  const handleSend = () => {
    const labels = getSelectedLabels();
    if (labels.length === 0) return;
    const zonesText = labels.join(', ');
    const message = `J'ai une douleur au niveau de : ${zonesText}. Peux-tu m'aider à identifier les causes possibles et me recommander des solutions ?`;
    onSubmit(message);
    setSelectedParts(new Set());
    onOpenChange(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setSelectedParts(new Set());
      setHoveredPart(null);
    }
    onOpenChange(v);
  };

  const hoveredLabel = hoveredPart ? BODY_PARTS.find(p => p.id === hoveredPart)?.label : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[95vw] p-0 bg-background/95 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden gap-0 max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">Carte corporelle interactive 3D</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div>
            <h3 className="text-base font-semibold text-foreground">Où avez-vous mal ?</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tournez le modèle et cliquez sur les zones douloureuses
            </p>
          </div>
        </div>

        {/* Hovered zone tooltip */}
        <div className="px-5 h-5 shrink-0">
          <AnimatePresence>
            {hoveredLabel && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-primary font-medium"
              >
                {hoveredLabel}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 min-h-[340px] max-h-[420px] px-3 touch-none">
          <Suspense fallback={<LoadingFallback />}>
            {open && (
              <Canvas
                camera={{ position: [0, 1.1, 1.8], fov: 40 }}
                style={{ borderRadius: '16px', background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
              >
                <HumanBody3D
                  selectedParts={selectedParts}
                  onTogglePart={togglePart}
                  onHoverPart={setHoveredPart}
                />
              </Canvas>
            )}
          </Suspense>
        </div>

        {/* Selected zones labels */}
        <div className="px-5 min-h-[32px] max-h-[72px] overflow-y-auto shrink-0">
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
        <div className="px-5 pb-5 pt-2 shrink-0">
          <motion.button
            onClick={handleSend}
            disabled={selectedParts.size === 0}
            whileHover={selectedParts.size > 0 ? { scale: 1.02 } : {}}
            whileTap={selectedParts.size > 0 ? { scale: 0.98 } : {}}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-300",
              selectedParts.size > 0
                ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <PaperPlaneTilt weight="fill" className="w-4 h-4" />
            {selectedParts.size > 0
              ? `Envoyer ${selectedParts.size} zone${selectedParts.size > 1 ? 's' : ''}`
              : 'Sélectionnez une zone'}
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
