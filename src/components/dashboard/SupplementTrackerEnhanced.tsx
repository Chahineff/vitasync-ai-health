import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Check, Clock, Sun, Moon, Plus, ChartBar, CalendarBlank } from '@phosphor-icons/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AwaitingAnalysis } from './AwaitingAnalysis';
import { WeeklyChart } from './WeeklyChart';
import { MonthlyChart } from './MonthlyChart';
import { useSupplementTracking } from '@/hooks/useSupplementTracking';

interface SupplementTrackerEnhancedProps {
  showAwaitingState?: boolean;
  onStartDiagnostic?: () => void;
}

export function SupplementTrackerEnhanced({ 
  showAwaitingState = false, 
  onStartDiagnostic 
}: SupplementTrackerEnhancedProps) {
  const [activeTab, setActiveTab] = useState('day');
  const { 
    supplements, 
    logs,
    loading, 
    toggleSupplementTaken,
    isSupplementTakenToday,
    getWeeklyStats,
    getMonthlyStats,
    takenCount,
    totalCount,
    progressPercent
  } = useSupplementTracking();

  if (showAwaitingState && onStartDiagnostic) {
    return (
      <AwaitingAnalysis 
        title="Compléments du jour" 
        onStartDiagnostic={onStartDiagnostic} 
      />
    );
  }

  // Calculate progress for today
  const morningSupplements = supplements.filter(s => s.time_of_day === 'morning');
  const eveningSupplements = supplements.filter(s => s.time_of_day === 'evening');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-premium rounded-3xl p-6 h-full border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
            <Pill weight="light" className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-light tracking-tight text-foreground">
              Suivi des compléments
            </h3>
            <p className="text-xs text-foreground/50 font-light">
              {takenCount}/{totalCount} pris aujourd'hui
            </p>
          </div>
        </div>
        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <Plus weight="light" className="w-5 h-5 text-foreground/60" />
        </button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 rounded-xl p-1 mb-4">
          <TabsTrigger 
            value="day" 
            className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-foreground text-foreground/60 font-light text-sm"
          >
            <Sun weight="light" className="w-4 h-4 mr-1" />
            Jour
          </TabsTrigger>
          <TabsTrigger 
            value="week"
            className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-foreground text-foreground/60 font-light text-sm"
          >
            <ChartBar weight="light" className="w-4 h-4 mr-1" />
            Semaine
          </TabsTrigger>
          <TabsTrigger 
            value="month"
            className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-foreground text-foreground/60 font-light text-sm"
          >
            <CalendarBlank weight="light" className="w-4 h-4 mr-1" />
            Mois
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* Daily View */}
          <TabsContent value="day" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Progress bar */}
              <div className="mb-6">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                  />
                </div>
              </div>

              {supplements.length === 0 ? (
                <div className="text-center py-8">
                  <Pill weight="light" className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
                  <p className="text-foreground/60 font-light text-sm">
                    Aucun complément ajouté
                  </p>
                  <p className="text-foreground/40 font-light text-xs mt-1">
                    Ajoutez vos compléments depuis la boutique
                  </p>
                </div>
              ) : (
                <>
                  {/* Morning supplements */}
                  {morningSupplements.length > 0 && (
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
                            name={supplement.product_name}
                            dosage={supplement.dosage}
                            taken={isSupplementTakenToday(supplement.id)}
                            onToggle={() => toggleSupplementTaken(supplement.id)}
                            loading={loading}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evening supplements */}
                  {eveningSupplements.length > 0 && (
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
                            name={supplement.product_name}
                            dosage={supplement.dosage}
                            taken={isSupplementTakenToday(supplement.id)}
                            onToggle={() => toggleSupplementTaken(supplement.id)}
                            loading={loading}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </TabsContent>

          {/* Weekly View */}
          <TabsContent value="week" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <WeeklyChart getWeeklyStats={getWeeklyStats} />
            </motion.div>
          </TabsContent>

          {/* Monthly View */}
          <TabsContent value="month" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <MonthlyChart getMonthlyStats={getMonthlyStats} />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}

interface SupplementItemProps {
  name: string;
  dosage: string | null;
  taken: boolean;
  onToggle: () => void;
  loading: boolean;
}

function SupplementItem({ name, dosage, taken, onToggle, loading }: SupplementItemProps) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        taken
          ? 'bg-secondary/10 border border-secondary/30'
          : 'bg-white/5 border border-white/10 hover:bg-white/10'
      } disabled:opacity-50`}
    >
      <div
        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
          taken
            ? 'bg-secondary text-white'
            : 'bg-white/10 border border-white/20'
        }`}
      >
        {taken && <Check weight="bold" className="w-4 h-4" />}
      </div>
      <div className="flex-1 text-left">
        <span
          className={`text-sm font-light ${
            taken ? 'text-foreground/60 line-through' : 'text-foreground'
          }`}
        >
          {name}
        </span>
        {dosage && (
          <span className="text-xs text-foreground/40 ml-2">{dosage}</span>
        )}
      </div>
      {!taken && (
        <Clock weight="light" className="w-4 h-4 text-foreground/30" />
      )}
    </button>
  );
}
