import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Check, Clock, Sun, Moon, Plus, ChartBar, CalendarBlank, X } from '@phosphor-icons/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeeklyChart } from './WeeklyChart';
import { MonthlyChart } from './MonthlyChart';
import { AddSupplementModal } from './AddSupplementModal';
import { useSupplementTracking } from '@/hooks/useSupplementTracking';
import { useShopifyProductResolver } from '@/hooks/useShopifyProductResolver';

/** Parse custom:HH:MM to display time */
function formatCustomTime(timeOfDay: string): string {
  if (timeOfDay.startsWith('custom:')) {
    return timeOfDay.replace('custom:', '');
  }
  return timeOfDay;
}

export function SupplementTrackerEnhanced() {
  const [activeTab, setActiveTab] = useState('day');
  const [showAddModal, setShowAddModal] = useState(false);
  const { 
    supplements, 
    loading, 
    toggleSupplementTaken,
    isSupplementTakenToday,
    addSupplement,
    removeSupplement,
    getWeeklyStats,
    getMonthlyStats,
    takenCount,
    totalCount,
    progressPercent
  } = useSupplementTracking();

  const shopifyIds = supplements.map(s => s.shopify_product_id);
  const { getProduct, loading: resolving } = useShopifyProductResolver(shopifyIds);


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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card-premium rounded-3xl p-4 md:p-6 h-full border border-white/10 relative"
      >
        {/* Header - no add button here anymore */}
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
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 rounded-xl p-1 mb-4">
            <TabsTrigger 
              value="day" 
              className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-foreground text-foreground/60 font-light text-sm min-h-[44px]"
            >
              <Sun weight="light" className="w-4 h-4 mr-1" />
              Jour
            </TabsTrigger>
            <TabsTrigger 
              value="week"
              className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-foreground text-foreground/60 font-light text-sm min-h-[44px]"
            >
              <ChartBar weight="light" className="w-4 h-4 mr-1" />
              Semaine
            </TabsTrigger>
            <TabsTrigger 
              value="month"
              className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-foreground text-foreground/60 font-light text-sm min-h-[44px]"
            >
              <CalendarBlank weight="light" className="w-4 h-4 mr-1" />
              Mois
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
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
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-3 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-light hover:bg-primary/20 transition-colors"
                    >
                      Ajouter un complément
                    </button>
                  </div>
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
                          {group.items.map(supplement => {
                            const resolved = getProduct(supplement.shopify_product_id);
                            return (
                              <SupplementItem
                                key={supplement.id}
                                name={resolved?.title || supplement.product_name}
                                dosage={supplement.dosage}
                                imageUrl={resolved?.imageUrl}
                                taken={isSupplementTakenToday(supplement.id)}
                                onToggle={() => toggleSupplementTaken(supplement.id)}
                                onRemove={() => removeSupplement(supplement.id)}
                                loading={loading}
                                customTime={group.key === 'custom' ? formatCustomTime(supplement.time_of_day) : undefined}
                              />
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <WeeklyChart getWeeklyStats={getWeeklyStats} />
              </motion.div>
            </TabsContent>

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

        {/* FAB - Floating Action Button with hover expand */}
        <button
          onClick={() => setShowAddModal(true)}
          className="group absolute bottom-5 right-5 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 ease-out flex items-center justify-center z-10 px-3 hover:px-5 min-w-12"
          aria-label="Ajouter au suivi"
        >
          <Plus weight="bold" className="w-5 h-5 flex-shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-[10rem] group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-out text-sm font-medium">
            Ajouter au suivi
          </span>
        </button>
      </motion.div>

      <AddSupplementModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addSupplement}
      />
    </>
  );
}

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
  return (
    <div
      className={`group w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        taken
          ? 'bg-secondary/10 border border-secondary/30'
          : 'bg-white/5 border border-white/10 hover:bg-white/10'
      }`}
    >
      <button
        onClick={onToggle}
        disabled={loading}
        className="flex items-center gap-3 flex-1 min-w-0 disabled:opacity-50"
      >
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
            taken
              ? 'bg-secondary text-white'
              : 'bg-white/10 border border-white/20'
          }`}
        >
          {taken && <Check weight="bold" className="w-4 h-4" />}
        </div>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Pill weight="light" className="w-4 h-4 text-foreground/30" />
          </div>
        )}

        <div className="flex-1 text-left min-w-0">
          <span
            className={`text-sm font-light block truncate ${
              taken ? 'text-foreground/60 line-through' : 'text-foreground'
            }`}
          >
            {name}
          </span>
          <div className="flex items-center gap-2">
            {dosage && (
              <span className="text-xs text-foreground/40">{dosage}</span>
            )}
            {customTime && (
              <span className="text-xs text-foreground/40 flex items-center gap-1">
                <Clock weight="light" className="w-3 h-3" />
                {customTime}
              </span>
            )}
          </div>
        </div>
      </button>

      {!taken && (
        <Clock weight="light" className="w-4 h-4 text-foreground/30 flex-shrink-0" />
      )}

      <button
        onClick={onRemove}
        className="p-1 rounded-lg hover:bg-destructive/10 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
        title="Supprimer"
      >
        <X weight="light" className="w-3.5 h-3.5 text-foreground/30 hover:text-destructive" />
      </button>
    </div>
  );
}
