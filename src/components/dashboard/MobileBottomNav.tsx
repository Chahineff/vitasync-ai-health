import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { House, FirstAidKit, Storefront, Gear, Package, TestTube, DotsThreeOutline, Question, SignOut, X } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';

type Section = "home" | "coach" | "supplements" | "shop" | "product" | "mystack" | "analyses" | "settings" | "help";

const VitaSyncIcon = ({ className }: { className?: string }) => (
  <img src="/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png" alt="Coach IA" className={className || "w-5 h-5"} />
);

interface MobileBottomNavProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onSignOut: () => void;
}

type NavItem = { id: Section | 'more'; labelKey?: string; label?: string; icon: any; description?: string };

export function MobileBottomNav({ activeSection, onSectionChange, onSignOut }: MobileBottomNavProps) {
  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryItems: NavItem[] = [
    { id: "home", labelKey: "dashboard.home", icon: House },
    { id: "coach", labelKey: "dashboard.coach", icon: VitaSyncIcon },
    { id: "shop", labelKey: "dashboard.shop", icon: Storefront },
    { id: "mystack", labelKey: "dashboard.mystack", icon: Package },
    { id: "more", label: "More", icon: DotsThreeOutline },
  ];

  const moreItems: NavItem[] = [
    { id: "supplements", labelKey: "dashboard.supplements", icon: FirstAidKit, description: "Track your daily intake" },
    { id: "analyses", label: "Wellness Journal", icon: TestTube, description: "Log nutrients and insights" },
    { id: "settings", labelKey: "dashboard.settings", icon: Gear, description: "Account & preferences" },
    { id: "help", labelKey: "dashboard.help", icon: Question, description: "FAQ & support" },
  ];

  const displaySection = activeSection === "product" ? "shop" : activeSection;
  const isMoreActive = moreItems.some(i => i.id === displaySection);

  const handlePrimary = (id: NavItem['id']) => {
    if (id === 'more') { setMoreOpen(true); return; }
    onSectionChange(id as Section);
  };

  const handleMorePick = (id: Section) => {
    setMoreOpen(false);
    onSectionChange(id);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-white/10" />

        <div className="relative flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {primaryItems.map((item) => {
            const isActive = item.id === 'more' ? (moreOpen || isMoreActive) : displaySection === item.id;
            const Icon = item.icon;
            const label = item.labelKey ? t(item.labelKey).split(' ')[0] : (item.label || '');

            return (
              <button
                key={item.id}
                onClick={() => handlePrimary(item.id)}
                className="relative flex flex-col items-center gap-1 px-3 py-2 min-w-[56px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                      opacity: 0.15,
                    }}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}

                <motion.div
                  animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  <Icon
                    weight={isActive ? "fill" : "light"}
                    className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-foreground/60'}`}
                  />
                </motion.div>

                <motion.span
                  className={`text-[10px] font-medium relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-foreground/50'}`}
                  animate={isActive ? { y: [4, 0], opacity: [0, 1] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {label}
                </motion.span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* More overlay sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-[70] lg:hidden"
            >
              <div
                className="rounded-t-3xl border-t border-x border-white/10 bg-background/95 backdrop-blur-2xl px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.5)]"
                style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, hsl(var(--primary)/0.10), transparent 60%)' }}
              >
                <div className="mx-auto w-10 h-1 rounded-full bg-foreground/15 mb-4" />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }}>
                      <DotsThreeOutline weight="fill" className="w-4 h-4 text-primary-foreground" />
                    </span>
                    <h2 className="text-base font-semibold text-foreground tracking-tight">More</h2>
                  </div>
                  <button
                    onClick={() => setMoreOpen(false)}
                    className="p-2 rounded-xl text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
                    aria-label="Close"
                  >
                    <X size={20} weight="light" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = displaySection === item.id;
                    const label = item.labelKey ? t(item.labelKey) : item.label;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMorePick(item.id as Section)}
                        className={`group relative text-left p-3.5 rounded-2xl border transition-all overflow-hidden ${
                          isActive
                            ? 'border-primary/40 bg-primary/10'
                            : 'border-white/10 bg-foreground/[0.03] hover:bg-foreground/[0.06]'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
                          style={{
                            background: isActive
                              ? 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))'
                              : 'linear-gradient(135deg, hsl(var(--primary)/0.18), hsl(var(--secondary)/0.18))',
                          }}
                        >
                          <Icon weight={isActive ? 'fill' : 'duotone'} className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                        </div>
                        <p className={`text-sm font-medium leading-tight ${isActive ? 'text-primary' : 'text-foreground'}`}>{label}</p>
                        {item.description && (
                          <p className="text-[11px] text-foreground/50 mt-0.5 leading-snug line-clamp-1">{item.description}</p>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => { setMoreOpen(false); onSignOut(); }}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
                >
                  <SignOut weight="bold" className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
