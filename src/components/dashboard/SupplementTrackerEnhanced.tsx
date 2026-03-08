import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Pill, Check, Clock, Sun, Moon, Plus, ChartBar, CalendarBlank, X, Warning, Fire, ArrowRight, Sparkle } from '@phosphor-icons/react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeeklyChart } from './WeeklyChart';
import { MonthlyChart } from './MonthlyChart';
import { AddSupplementModal } from './AddSupplementModal';
import { useSupplementTracking, SupplementTracking } from '@/hooks/useSupplementTracking';
import { useShopifyProductResolver } from '@/hooks/useShopifyProductResolver';
import { Confetti } from '@/components/ui/Confetti';
import { toast } from '@/hooks/use-toast';

function formatCustomTime(timeOfDay: string): string {
  if (timeOfDay.startsWith('custom:')) {
    return timeOfDay.replace('custom:', '');
  }
  return timeOfDay;
}

// ─── Radial Progress Ring ───
function RadialProgress({ taken, total, percent }: { taken: number; total: number; percent: number }) {
  const size = 80;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const isComplete = percent === 100 && total > 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--secondary))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
          {isComplete && (
            <filter id="ring-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--foreground) / 0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (circumference * percent) / 100 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          filter={isComplete ? 'url(#ring-glow)' : undefined}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold text-foreground leading-none">{taken}/{total}</span>
        <span className="text-[10px] text-foreground/40 font-light">pris</span>
      </div>
    </div>
  );
}

// ─── Particle Burst ───
function ParticleBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * 360;
    const rad = (angle * Math.PI) / 180;
    return { id: i, x: Math.cos(rad) * 20, y: Math.sin(rad) * 20, color: i % 2 === 0 ? 'hsl(var(--secondary))' : 'hsl(var(--primary))' };
  });

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full -ml-[3px] -mt-[3px]"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

// ─── Next Slot Badge ───
function NextSlotBadge({ supplements, isSupplementTakenToday }: { supplements: SupplementTracking[]; isSupplementTakenToday: (id: string) => boolean }) {
  const nextSlot = useMemo(() => {
    const hour = new Date().getHours();
    const slotOrder = ['morning', 'noon', 'evening'];
    const slotLabels: Record<string, string> = { morning: 'Matin', noon: 'Midi', evening: 'Soir' };

    // Find the current or next slot
    let currentSlotIdx = 0;
    if (hour >= 12 && hour < 17) currentSlotIdx = 1;
    else if (hour >= 17) currentSlotIdx = 2;

    for (let i = currentSlotIdx; i < slotOrder.length; i++) {
      const slot = slotOrder[i];
      const untaken = supplements.filter(s => s.time_of_day === slot && !isSupplementTakenToday(s.id));
      if (untaken.length > 0) {
        return { label: slotLabels[slot], names: untaken.slice(0, 3).map(s => s.product_name) };
      }
    }
    return null;
  }, [supplements, isSupplementTakenToday]);

  if (!nextSlot) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20"
    >
      <ArrowRight weight="bold" className="w-3.5 h-3.5 text-primary flex-shrink-0" />
      <span className="text-xs text-foreground/70 font-light truncate">
        <span className="font-medium text-primary">{nextSlot.label}</span> — {nextSlot.names.join(', ')}
      </span>
    </motion.div>
  );
}

// ─── Main Component ───
export function SupplementTrackerEnhanced() {
  const [activeTab, setActiveTab] = useState('day');
  const [prevTab, setPrevTab] = useState('day');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevProgressRef = useRef(0);
  const { 
    supplements, loading, toggleSupplementTaken, isSupplementTakenToday,
    addSupplement, removeSupplement, getWeeklyStats, getMonthlyStats,
    takenCount, totalCount, progressPercent, streakDays
  } = useSupplementTracking();

  const shopifyIds = supplements.map(s => s.shopify_product_id);
  const { getProduct, loading: resolving } = useShopifyProductResolver(shopifyIds);

  // Trigger confetti when reaching 100%
  useEffect(() => {
    if (progressPercent === 100 && prevProgressRef.current < 100 && totalCount > 0) {
      setShowConfetti(true);
    }
    prevProgressRef.current = progressPercent;
  }, [progressPercent, totalCount]);

  const morningSupplements = supplements.filter(s => s.time_of_day === 'morning');
  const noonSupplements = supplements.filter(s => s.time_of_day === 'noon');
  const eveningSupplements = supplements.filter(s => s.time_of_day === 'evening');
  const customSupplements = supplements.filter(s => s.time_of_day?.startsWith('custom:'));

  const groups = [
    { key: 'morning', label: 'Matin', icon: <Sun weight="light" className="w-4 h-4 text-secondary" />, items: morningSupplements },
    { key: 'noon', label: 'Midi', icon: <Sun weight="fill" className="w-4 h-4 text-amber-500" />, items: noonSupplements },
    { key: 'evening', label: 'Soir', icon: <Moon weight="light" className="w-4 h-4 text-primary" />, items: eveningSupplements },
    { key: 'custom', label: 'Heure spécifique', icon: <Clock weight="light" className="w-4 h-4 text-foreground/60" />, items: customSupplements },
  ];

  const tabOrder = ['day', 'week', 'month'];
  const slideDirection = tabOrder.indexOf(activeTab) > tabOrder.indexOf(prevTab) ? 1 : -1;

  const handleTabChange = (newTab: string) => {
    setPrevTab(activeTab);
    setActiveTab(newTab);
  };

  return (
    <>
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card-premium rounded-3xl p-4 md:p-6 h-full border border-white/10 relative"
      >
        {/* Header with radial progress + streak */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <RadialProgress taken={takenCount} total={totalCount} percent={progressPercent} />
            <div>
              <h3 className="text-lg font-light tracking-tight text-foreground">
                Suivi des compléments
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-foreground/50 font-light">
                  {takenCount}/{totalCount} pris aujourd'hui
                </p>
                {streakDays > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] font-medium"
                  >
                    <Fire weight="fill" className="w-3 h-3" />
                    {streakDays}j
                  </motion.span>
                )}
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 rounded-xl p-1 mb-4">
            <TabsTrigger value="day" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-foreground text-foreground/60 font-light text-sm h-9 flex items-center justify-center gap-1.5">
              <Sun weight="light" className="w-4 h-4 shrink-0" /> Jour
            </TabsTrigger>
            <TabsTrigger value="week" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-foreground text-foreground/60 font-light text-sm h-9 flex items-center justify-center gap-1.5">
              <ChartBar weight="light" className="w-4 h-4 shrink-0" /> Semaine
            </TabsTrigger>
            <TabsTrigger value="month" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-foreground text-foreground/60 font-light text-sm h-9 flex items-center justify-center gap-1.5">
              <CalendarBlank weight="light" className="w-4 h-4 shrink-0" /> Mois
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait" custom={slideDirection}>
            <TabsContent value="day" className="mt-0">
              <motion.div
                key="day"
                custom={slideDirection}
                initial={{ opacity: 0, x: slideDirection * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -slideDirection * 30 }}
                transition={{ duration: 0.25 }}
              >
                {/* Next slot badge */}
                {supplements.length > 0 && (
                  <div className="mb-4">
                    <NextSlotBadge supplements={supplements} isSupplementTakenToday={isSupplementTakenToday} />
                  </div>
                )}

                {supplements.length === 0 ? (
                  <AnimatedEmptyState onAdd={() => setShowAddModal(true)} />
                ) : (
                  <div className="space-y-4">
                    {groups.map(group => group.items.length > 0 && (
                      <div key={group.key}>
                        <div className="flex items-center gap-2 mb-3">
                          {group.icon}
                          <span className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
                            {group.label}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {group.items.map((supplement, idx) => {
                            const resolved = getProduct(supplement.shopify_product_id);
                            return (
                              <motion.div
                                key={supplement.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.06, duration: 0.3 }}
                              >
                                <SupplementItem
                                  name={resolved?.title || supplement.product_name}
                                  dosage={supplement.dosage}
                                  imageUrl={resolved?.imageUrl}
                                  taken={isSupplementTakenToday(supplement.id)}
                                  onToggle={() => toggleSupplementTaken(supplement.id)}
                                  onRemove={() => {
                                    removeSupplement(supplement.id);
                                    toast({ title: '✅ Complément supprimé', description: `${resolved?.title || supplement.product_name} a été retiré de votre suivi.` });
                                  }}
                                  loading={loading}
                                  customTime={group.key === 'custom' ? formatCustomTime(supplement.time_of_day) : undefined}
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="week" className="mt-0">
              <motion.div
                key="week"
                custom={slideDirection}
                initial={{ opacity: 0, x: slideDirection * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -slideDirection * 30 }}
                transition={{ duration: 0.25 }}
              >
                <WeeklyChart getWeeklyStats={getWeeklyStats} />
              </motion.div>
            </TabsContent>

            <TabsContent value="month" className="mt-0">
              <motion.div
                key="month"
                custom={slideDirection}
                initial={{ opacity: 0, x: slideDirection * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -slideDirection * 30 }}
                transition={{ duration: 0.25 }}
              >
                <MonthlyChart getMonthlyStats={getMonthlyStats} />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* FAB */}
        <motion.button
          onClick={() => setShowAddModal(true)}
          initial={{ rotate: 45, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          className={`group absolute bottom-5 right-5 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 ease-out flex items-center justify-center z-10 px-3 hover:px-5 min-w-12 ${
            supplements.length === 0 ? 'animate-pulse-glow' : ''
          }`}
          aria-label="Ajouter au suivi"
        >
          <Plus weight="bold" className="w-5 h-5 flex-shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-[10rem] group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-out text-sm font-medium">
            Ajouter au suivi
          </span>
        </motion.button>
      </motion.div>

      <AddSupplementModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addSupplement}
      />
    </>
  );
}

// ─── Animated Empty State ───
function AnimatedEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-10">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mx-auto w-16 h-16 mb-4"
      >
        <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Pill weight="light" className="w-8 h-8 text-primary/50" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1"
        >
          <Sparkle weight="fill" className="w-4 h-4 text-secondary" />
        </motion.div>
      </motion.div>
      <p className="text-foreground/70 font-light text-sm mb-1">Construis ton stack idéal</p>
      <p className="text-foreground/40 text-xs mb-4">Ajoute tes compléments pour suivre ta routine quotidienne</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAdd}
        className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
      >
        <Plus weight="bold" className="w-4 h-4 inline mr-1.5 -mt-0.5" />
        Ajouter un complément
      </motion.button>
    </div>
  );
}

// ─── Supplement Item with swipe + particles ───
interface SupplementItemProps {
  name: string;
  dosage: string | null;
  imageUrl?: string | null;
  taken: boolean;
  onToggle: () => void;
  onRemove: () => void;
  loading: boolean;
  customTime?: string;
}

function SupplementItem({ name, dosage, imageUrl, taken, onToggle, onRemove, loading, customTime }: SupplementItemProps) {
  const [justToggled, setJustToggled] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [0, 80], [0, 0.3]);
  const checkScale = useTransform(x, [0, 80], [0, 1]);

  const handleToggle = () => {
    onToggle();
    if (!taken) {
      setJustToggled(true);
      setShowParticles(true);
      setTimeout(() => setJustToggled(false), 500);
      setTimeout(() => setShowParticles(false), 600);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 60 && !taken) {
      handleToggle();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe background */}
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 bg-secondary/30 rounded-xl flex items-center pl-4 pointer-events-none"
      >
        <motion.div style={{ scale: checkScale }}>
          <Check weight="bold" className="w-5 h-5 text-secondary" />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ x }}
        drag={!taken ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        className={`relative group w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
          taken
            ? 'bg-secondary/10 border border-secondary/30'
            : 'bg-white/5 border border-white/10 hover:bg-white/10'
        } ${justToggled ? 'ring-2 ring-secondary/40' : ''}`}
      >
        <button
          onClick={handleToggle}
          disabled={loading}
          className="flex items-center gap-3 flex-1 min-w-0 disabled:opacity-50"
        >
          <div className="relative">
            <motion.div
              animate={justToggled ? { scale: [1, 1.6, 1] } : {}}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                taken ? 'bg-secondary text-white' : 'bg-white/10 border border-white/20'
              }`}
            >
              {taken && <Check weight="bold" className="w-4 h-4" />}
            </motion.div>
            <ParticleBurst active={showParticles} />
          </div>

          {imageUrl ? (
            <img src={imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Pill weight="light" className="w-4 h-4 text-foreground/30" />
            </div>
          )}

          <div className="flex-1 text-left min-w-0">
            <span className={`text-sm font-light block truncate ${
              taken ? 'text-foreground/60 line-through' : 'text-foreground'
            }`}>
              {name}
            </span>
            <div className="flex items-center gap-2">
              {dosage && <span className="text-xs text-foreground/40">{dosage}</span>}
              {customTime && (
                <span className="text-xs text-foreground/40 flex items-center gap-1">
                  <Clock weight="light" className="w-3 h-3" /> {customTime}
                </span>
              )}
            </div>
          </div>
        </button>

        {!taken && <Clock weight="light" className="w-4 h-4 text-foreground/30 flex-shrink-0" />}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="p-1 rounded-lg hover:bg-destructive/10 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
              title="Supprimer"
            >
              <X weight="light" className="w-3.5 h-3.5 text-foreground/30 hover:text-destructive" />
            </motion.button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-background border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Warning weight="fill" className="w-5 h-5 text-destructive" />
                Supprimer du suivi ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir retirer <span className="font-medium text-foreground">{name}</span> de votre suivi des compléments ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-white/10">Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );
}
