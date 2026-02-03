import { motion } from 'framer-motion';
import { House, FirstAidKit, Storefront, Gear } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';

type Section = "home" | "coach" | "supplements" | "shop" | "product" | "settings" | "help";

// Custom VitaSync icon component for Coach IA
const VitaSyncIcon = ({ className }: { className?: string }) => (
  <img 
    src="/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png" 
    alt="Coach IA" 
    className={className || "w-5 h-5"}
  />
);

interface MobileBottomNavProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onSignOut: () => void;
}

export function MobileBottomNav({ activeSection, onSectionChange, onSignOut }: MobileBottomNavProps) {
  const { t } = useTranslation();

  const navItems = [
    { id: "home" as Section, labelKey: "dashboard.home", icon: House },
    { id: "coach" as Section, labelKey: "dashboard.coach", icon: VitaSyncIcon },
    { id: "supplements" as Section, labelKey: "dashboard.supplements", icon: FirstAidKit },
    { id: "shop" as Section, labelKey: "dashboard.shop", icon: Storefront },
    { id: "settings" as Section, labelKey: "dashboard.settings", icon: Gear },
  ];

  // Map product section to shop for nav highlighting
  const displaySection = activeSection === "product" ? "shop" : activeSection;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Glass background with blur */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-white/10" />
      
      {/* Nav items */}
      <div className="relative flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = displaySection === item.id;
          const Icon = item.icon;
          // Get translated label and take first word for mobile
          const label = t(item.labelKey).split(' ')[0];
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className="relative flex flex-col items-center gap-1 px-3 py-2 min-w-[56px]"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              
              {/* Icon */}
              <Icon 
                weight={isActive ? "fill" : "light"} 
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? 'text-primary' : 'text-foreground/60'
                }`}
              />
              
              {/* Label */}
              <span className={`text-[10px] font-medium relative z-10 transition-colors ${
                isActive ? 'text-primary' : 'text-foreground/50'
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
