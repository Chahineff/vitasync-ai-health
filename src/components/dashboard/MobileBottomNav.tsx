import { motion } from 'framer-motion';
import { House, FirstAidKit, Storefront, Gear, Package, TestTube } from '@phosphor-icons/react';
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
    { id: "mystack", labelKey: "dashboard.mystack", icon: Package },
    { id: "analyses", label: "Analyses", icon: TestTube },
  ];

  const displaySection = activeSection === "product" ? "shop" : activeSection;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-background/85 backdrop-blur-xl border-t border-border/40" />
      
      <div className="relative flex items-center justify-around px-1.5 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = displaySection === item.id;
          const Icon = item.icon;
          const label = item.labelKey ? t(item.labelKey).split(' ')[0] : (item as any).label || '';
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className="relative flex flex-col items-center gap-1 px-2.5 py-1.5 min-w-[52px] rounded-xl"
            >
              {/* Active pill — subtle, clinical */}
              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/15"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              
              <div className="relative z-10">
                <Icon 
                  weight={isActive ? "fill" : "light"} 
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-primary' : 'text-foreground/55'
                  }`}
                />
              </div>
              
              <span
                className={`text-[10px] font-medium relative z-10 transition-colors tracking-tight ${
                  isActive ? 'text-primary' : 'text-foreground/50'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
