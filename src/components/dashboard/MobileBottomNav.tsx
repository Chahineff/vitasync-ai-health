import { motion } from "framer-motion";
import { House, FirstAidKit, Storefront, Gear, SignOut } from "@phosphor-icons/react";

type Section = "home" | "coach" | "supplements" | "shop" | "product" | "settings" | "help";

interface MobileBottomNavProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onSignOut: () => void;
}

// Custom VitaSync icon for Coach IA
const VitaSyncIcon = ({ className }: { className?: string }) => (
  <img 
    src="/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png" 
    alt="Coach IA" 
    className={className || "w-5 h-5"}
  />
);

const navItems = [
  { id: "home" as Section, label: "Accueil", icon: House },
  { id: "coach" as Section, label: "Coach", icon: VitaSyncIcon },
  { id: "supplements" as Section, label: "Suivi", icon: FirstAidKit },
  { id: "shop" as Section, label: "Boutique", icon: Storefront },
  { id: "settings" as Section, label: "Profil", icon: Gear },
];

export function MobileBottomNav({ activeSection, onSectionChange, onSignOut }: MobileBottomNavProps) {
  // Map product section to shop for visual indication
  const displaySection = activeSection === "product" ? "shop" : activeSection;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-white/10" />
      
      {/* Safe area padding for iOS */}
      <div className="relative flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = displaySection === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className="relative flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-xl transition-colors"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              
              <div className="relative z-10">
                <Icon 
                  weight={isActive ? "fill" : "light"} 
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-primary" : "text-foreground/60"
                  }`} 
                />
              </div>
              
              <span 
                className={`relative z-10 text-[10px] mt-0.5 font-medium transition-colors ${
                  isActive ? "text-primary" : "text-foreground/50"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
