import { motion } from 'framer-motion';
import { House, FirstAidKit, Storefront, Gear } from '@phosphor-icons/react';
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

export function MobileBottomNav({ activeSection, onSectionChange, onSignOut }: MobileBottomNavProps) {
  const { t } = useTranslation();

  const navItems: Array<{ id: Section; labelKey?: string; label?: string; icon: any }> = [
    { id: "home", labelKey: "dashboard.home", icon: House },
    { id: "coach", labelKey: "dashboard.coach", icon: VitaSyncIcon },
    { id: "supplements", labelKey: "dashboard.supplements", icon: FirstAidKit },
    { id: "shop", labelKey: "dashboard.shop", icon: Storefront },
    { id: "settings", label: "Paramètres", icon: Gear },
  ];

  const displaySection = activeSection === "product" ? "shop" : activeSection;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-white/10" />
      
      <div className="relative flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = displaySection === item.id;
          const Icon = item.icon;
          const label = item.labelKey ? t(item.labelKey).split(' ')[0] : (item as any).label || '';
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className="relative flex flex-col items-center gap-1 px-3 py-2 min-w-[56px]"
            >
              {/* Active indicator with spring bounce */}
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
              
              {/* Icon with scale bounce */}
              <motion.div
                animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <Icon 
                  weight={isActive ? "fill" : "light"} 
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-primary' : 'text-foreground/60'
                  }`}
                />
              </motion.div>
              
              {/* Label with slide-up */}
              <motion.span 
                className={`text-[10px] font-medium relative z-10 transition-colors ${
                  isActive ? 'text-primary' : 'text-foreground/50'
                }`}
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
  );
}
