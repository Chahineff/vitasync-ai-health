import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PaperPlaneTilt, ArrowsLeftRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

/* ─── Zone definitions with polygon hitboxes ─── */
interface BodyZone {
  id: string;
  label: string;
  // SVG path for the clickable/highlight area
  path: string;
  // Center point for label display
  cx: number;
  cy: number;
}

const FRONT_ZONES: BodyZone[] = [
  // Head & Neck
  { id: 'front-head', label: 'Tête (front)', path: 'M140,20 C140,8 150,0 162,0 C174,0 184,8 184,20 L184,40 C184,52 174,62 162,62 C150,62 140,52 140,40 Z', cx: 162, cy: 32 },
  { id: 'front-neck', label: 'Cou', path: 'M152,62 L172,62 L174,80 L150,80 Z', cx: 162, cy: 71 },
  
  // Shoulders
  { id: 'left-deltoid', label: 'Deltoïde gauche', path: 'M108,80 L150,80 L146,108 L104,98 Z', cx: 128, cy: 92 },
  { id: 'right-deltoid', label: 'Deltoïde droit', path: 'M174,80 L216,80 L220,98 L178,108 Z', cx: 196, cy: 92 },
  
  // Chest
  { id: 'left-pec', label: 'Pectoral gauche', path: 'M132,80 L162,80 L162,120 L128,120 L126,98 Z', cx: 145, cy: 100 },
  { id: 'right-pec', label: 'Pectoral droit', path: 'M162,80 L192,80 L198,98 L196,120 L162,120 Z', cx: 179, cy: 100 },
  
  // Arms - Upper
  { id: 'left-bicep', label: 'Biceps gauche', path: 'M96,98 L112,98 L108,148 L92,146 Z', cx: 102, cy: 123 },
  { id: 'right-bicep', label: 'Biceps droit', path: 'M212,98 L228,98 L232,146 L216,148 Z', cx: 222, cy: 123 },
  
  // Arms - Forearm
  { id: 'left-forearm', label: 'Avant-bras gauche', path: 'M88,146 L106,146 L100,198 L82,196 Z', cx: 94, cy: 172 },
  { id: 'right-forearm', label: 'Avant-bras droit', path: 'M218,146 L236,146 L242,196 L224,198 Z', cx: 230, cy: 172 },
  
  // Hands
  { id: 'left-hand', label: 'Main gauche', path: 'M76,196 L100,196 L96,224 L72,222 Z', cx: 86, cy: 210 },
  { id: 'right-hand', label: 'Main droite', path: 'M224,196 L248,196 L252,222 L228,224 Z', cx: 238, cy: 210 },
  
  // Core
  { id: 'upper-abs', label: 'Abdominaux hauts', path: 'M140,120 L184,120 L186,155 L138,155 Z', cx: 162, cy: 137 },
  { id: 'lower-abs', label: 'Abdominaux bas', path: 'M138,155 L186,155 L188,190 L136,190 Z', cx: 162, cy: 172 },
  
  // Obliques
  { id: 'left-oblique', label: 'Oblique gauche', path: 'M120,120 L140,120 L138,190 L124,188 Z', cx: 130, cy: 155 },
  { id: 'right-oblique', label: 'Oblique droit', path: 'M184,120 L204,120 L200,188 L186,190 Z', cx: 194, cy: 155 },
  
  // Hips
  { id: 'left-hip', label: 'Hanche gauche', path: 'M118,188 L142,188 L138,210 L114,208 Z', cx: 128, cy: 198 },
  { id: 'right-hip', label: 'Hanche droite', path: 'M182,188 L206,188 L210,208 L186,210 Z', cx: 196, cy: 198 },
  
  // Upper legs
  { id: 'left-quad', label: 'Quadriceps gauche', path: 'M118,210 L148,210 L146,290 L116,290 Z', cx: 132, cy: 250 },
  { id: 'right-quad', label: 'Quadriceps droit', path: 'M176,210 L206,210 L208,290 L178,290 Z', cx: 192, cy: 250 },
  { id: 'left-adductor', label: 'Adducteur gauche', path: 'M148,210 L164,210 L162,270 L146,270 Z', cx: 155, cy: 240 },
  { id: 'right-adductor', label: 'Adducteur droit', path: 'M160,210 L176,210 L178,270 L162,270 Z', cx: 169, cy: 240 },
  
  // Knees
  { id: 'left-knee', label: 'Genou gauche', path: 'M118,290 L148,290 L146,316 L116,316 Z', cx: 132, cy: 303 },
  { id: 'right-knee', label: 'Genou droit', path: 'M176,290 L206,290 L208,316 L178,316 Z', cx: 192, cy: 303 },
  
  // Lower legs
  { id: 'left-shin', label: 'Tibia gauche', path: 'M118,316 L146,316 L142,390 L120,390 Z', cx: 132, cy: 353 },
  { id: 'right-shin', label: 'Tibia droit', path: 'M178,316 L206,316 L204,390 L182,390 Z', cx: 192, cy: 353 },
  
  // Ankles & Feet
  { id: 'left-ankle', label: 'Cheville gauche', path: 'M120,390 L142,390 L140,406 L118,406 Z', cx: 130, cy: 398 },
  { id: 'right-ankle', label: 'Cheville droite', path: 'M182,390 L204,390 L206,406 L184,406 Z', cx: 194, cy: 398 },
  { id: 'left-foot', label: 'Pied gauche', path: 'M112,406 L142,406 L142,426 L108,426 Z', cx: 126, cy: 416 },
  { id: 'right-foot', label: 'Pied droit', path: 'M182,406 L212,406 L216,426 L182,426 Z', cx: 198, cy: 416 },
];

const BACK_ZONES: BodyZone[] = [
  // Head & Neck
  { id: 'back-head', label: 'Crâne (arrière)', path: 'M140,20 C140,8 150,0 162,0 C174,0 184,8 184,20 L184,40 C184,52 174,62 162,62 C150,62 140,52 140,40 Z', cx: 162, cy: 32 },
  { id: 'nape', label: 'Nuque', path: 'M152,62 L172,62 L174,80 L150,80 Z', cx: 162, cy: 71 },
  
  // Shoulders & Traps
  { id: 'left-trap', label: 'Trapèze gauche', path: 'M130,78 L156,78 L152,100 L126,96 Z', cx: 140, cy: 88 },
  { id: 'right-trap', label: 'Trapèze droit', path: 'M168,78 L194,78 L198,96 L172,100 Z', cx: 184, cy: 88 },
  { id: 'left-rear-delt', label: 'Deltoïde post. gauche', path: 'M108,80 L130,80 L126,108 L104,98 Z', cx: 118, cy: 94 },
  { id: 'right-rear-delt', label: 'Deltoïde post. droit', path: 'M194,80 L216,80 L220,98 L198,108 Z', cx: 206, cy: 94 },
  
  // Upper Back
  { id: 'left-rhomboid', label: 'Rhomboïde gauche', path: 'M136,100 L162,100 L162,135 L132,135 Z', cx: 147, cy: 117 },
  { id: 'right-rhomboid', label: 'Rhomboïde droit', path: 'M162,100 L188,100 L192,135 L162,135 Z', cx: 177, cy: 117 },
  
  // Arms - Triceps
  { id: 'left-tricep', label: 'Triceps gauche', path: 'M96,98 L112,98 L108,148 L92,146 Z', cx: 102, cy: 123 },
  { id: 'right-tricep', label: 'Triceps droit', path: 'M212,98 L228,98 L232,146 L216,148 Z', cx: 222, cy: 123 },
  
  // Arms - Forearm back
  { id: 'left-forearm-back', label: 'Avant-bras gauche', path: 'M88,146 L106,146 L100,198 L82,196 Z', cx: 94, cy: 172 },
  { id: 'right-forearm-back', label: 'Avant-bras droit', path: 'M218,146 L236,146 L242,196 L224,198 Z', cx: 230, cy: 172 },
  
  // Middle Back
  { id: 'left-lat', label: 'Grand dorsal gauche', path: 'M120,120 L140,120 L138,165 L118,162 Z', cx: 129, cy: 141 },
  { id: 'right-lat', label: 'Grand dorsal droit', path: 'M184,120 L204,120 L206,162 L186,165 Z', cx: 195, cy: 141 },
  
  // Lower Back
  { id: 'lower-back', label: 'Lombaires', path: 'M132,135 L192,135 L194,180 L130,180 Z', cx: 162, cy: 157 },
  
  // Glutes
  { id: 'left-glute', label: 'Fessier gauche', path: 'M118,180 L162,180 L160,218 L114,216 Z', cx: 138, cy: 198 },
  { id: 'right-glute', label: 'Fessier droit', path: 'M162,180 L206,180 L210,216 L164,218 Z', cx: 186, cy: 198 },
  
  // Hamstrings
  { id: 'left-hamstring', label: 'Ischio-jambier gauche', path: 'M118,218 L154,218 L150,290 L116,290 Z', cx: 135, cy: 254 },
  { id: 'right-hamstring', label: 'Ischio-jambier droit', path: 'M170,218 L206,218 L208,290 L174,290 Z', cx: 189, cy: 254 },
  
  // Calves
  { id: 'left-calf', label: 'Mollet gauche', path: 'M118,316 L146,316 L142,390 L120,390 Z', cx: 132, cy: 353 },
  { id: 'right-calf', label: 'Mollet droit', path: 'M178,316 L206,316 L204,390 L182,390 Z', cx: 192, cy: 353 },
  
  // Back of knees
  { id: 'left-popliteal', label: 'Creux poplité gauche', path: 'M118,290 L150,290 L148,316 L116,316 Z', cx: 133, cy: 303 },
  { id: 'right-popliteal', label: 'Creux poplité droit', path: 'M174,290 L206,290 L208,316 L176,316 Z', cx: 191, cy: 303 },
  
  // Achilles & Heel
  { id: 'left-achilles', label: 'Tendon d\'Achille gauche', path: 'M124,390 L140,390 L138,410 L122,410 Z', cx: 131, cy: 400 },
  { id: 'right-achilles', label: 'Tendon d\'Achille droit', path: 'M184,390 L200,390 L202,410 L186,410 Z', cx: 193, cy: 400 },
  { id: 'left-heel', label: 'Talon gauche', path: 'M116,410 L142,410 L142,426 L112,426 Z', cx: 127, cy: 418 },
  { id: 'right-heel', label: 'Talon droit', path: 'M182,410 L208,410 L212,426 L182,426 Z', cx: 197, cy: 418 },
];

/* ─── Realistic body outline paths ─── */
const FRONT_OUTLINE = `
  M162,2 C148,2 138,12 138,26 C138,38 144,48 152,54
  L150,62 L152,78
  L108,82 L96,96 L88,142 L82,192 L72,220 L78,224 L100,196 L106,146
  L112,100 L120,88 L128,82
  L136,188 L118,208 L114,288 L116,316 L118,390 L112,426 L142,426 L142,406 L146,316 L148,290
  L162,270
  L176,290 L178,316 L182,406 L182,426 L212,426 L206,390 L208,316 L210,288 L206,208 L188,188
  L196,82 L204,88 L212,100 L218,146 L224,196 L246,224 L252,220 L242,192 L236,142 L228,96
  L216,82 L172,78 L174,62
  L172,54 C180,48 186,38 186,26 C186,12 176,2 162,2 Z
`;

const BACK_OUTLINE = FRONT_OUTLINE; // Same silhouette for back

/* ─── Skin gradient colors ─── */
const SKIN_GRADIENT_ID = 'skinGradient';
const MUSCLE_LINE_COLOR = 'hsl(var(--foreground) / 0.08)';

interface BodyMapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (message: string) => void;
}

export function BodyMapModal({ open, onOpenChange, onSubmit }: BodyMapModalProps) {
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'front' | 'back'>('front');
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const zones = view === 'front' ? FRONT_ZONES : BACK_ZONES;
  const outlinePath = view === 'front' ? FRONT_OUTLINE : BACK_OUTLINE;

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

  const hoveredLabel = hoveredZone ? zones.find(z => z.id === hoveredZone)?.label : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[95vw] p-0 bg-background/95 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden gap-0">
        <DialogTitle className="sr-only">Carte corporelle interactive</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">Où avez-vous mal ?</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Cliquez sur les zones concernées</p>
          </div>
          <button
            onClick={() => setView(v => v === 'front' ? 'back' : 'front')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <ArrowsLeftRight weight="bold" className="w-3.5 h-3.5" />
            {view === 'front' ? 'Dos' : 'Face'}
          </button>
        </div>

        {/* Hovered zone tooltip */}
        <div className="px-5 h-5">
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

        {/* SVG Body */}
        <div className="flex justify-center px-5 py-1">
          <svg viewBox="60 -5 204 440" className="w-full max-w-[260px] h-auto select-none">
            <defs>
              {/* Skin gradient for realistic look */}
              <linearGradient id={SKIN_GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--foreground) / 0.06)" />
                <stop offset="100%" stopColor="hsl(var(--foreground) / 0.03)" />
              </linearGradient>
              {/* Glow filter for selected zones */}
              <filter id="selectedGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Body fill */}
            <path
              d={outlinePath}
              fill={`url(#${SKIN_GRADIENT_ID})`}
              stroke="hsl(var(--foreground) / 0.12)"
              strokeWidth="1"
            />

            {/* Muscle/anatomy lines for realism */}
            {view === 'front' && (
              <g stroke={MUSCLE_LINE_COLOR} strokeWidth="0.5" fill="none">
                {/* Center line */}
                <line x1="162" y1="80" x2="162" y2="190" />
                {/* Pec separation */}
                <path d="M132,82 Q162,95 192,82" />
                {/* Ab lines */}
                <line x1="145" y1="125" x2="179" y2="125" />
                <line x1="143" y1="145" x2="181" y2="145" />
                <line x1="141" y1="165" x2="183" y2="165" />
                {/* Hip crease */}
                <path d="M136,190 Q162,200 188,190" />
              </g>
            )}
            {view === 'back' && (
              <g stroke={MUSCLE_LINE_COLOR} strokeWidth="0.5" fill="none">
                {/* Spine */}
                <line x1="162" y1="68" x2="162" y2="180" />
                {/* Scapula lines */}
                <path d="M130,95 Q142,110 135,130" />
                <path d="M194,95 Q182,110 189,130" />
                {/* Glute crease */}
                <line x1="162" y1="190" x2="162" y2="218" />
                {/* Lower back diamond */}
                <path d="M148,145 L162,135 L176,145 L162,170 Z" />
              </g>
            )}

            {/* Clickable zones */}
            {zones.map(zone => {
              const isSelected = selectedZones.has(zone.id);
              const isHovered = hoveredZone === zone.id;
              return (
                <g
                  key={zone.id}
                  onClick={() => toggleZone(zone.id)}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className="cursor-pointer"
                >
                  <path
                    d={zone.path}
                    fill={
                      isSelected
                        ? 'hsl(var(--primary) / 0.3)'
                        : isHovered
                          ? 'hsl(var(--primary) / 0.1)'
                          : 'transparent'
                    }
                    stroke={
                      isSelected
                        ? 'hsl(var(--primary))'
                        : isHovered
                          ? 'hsl(var(--primary) / 0.4)'
                          : 'transparent'
                    }
                    strokeWidth={isSelected ? 1.5 : 0.8}
                    className="transition-all duration-150"
                    filter={isSelected ? 'url(#selectedGlow)' : undefined}
                  />
                  {/* Selection dot */}
                  {isSelected && (
                    <circle
                      cx={zone.cx}
                      cy={zone.cy}
                      r="3"
                      fill="hsl(var(--primary))"
                      stroke="hsl(var(--primary-foreground))"
                      strokeWidth="1"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected zones labels */}
        <div className="px-5 min-h-[40px] max-h-[80px] overflow-y-auto">
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
            {selectedZones.size > 0
              ? `Envoyer ${selectedZones.size} zone${selectedZones.size > 1 ? 's' : ''}`
              : 'Sélectionnez une zone'}
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
