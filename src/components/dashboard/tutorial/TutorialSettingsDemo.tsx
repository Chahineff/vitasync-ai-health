import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Camera, Globe, ArrowClockwise } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
];

const HEALTH_GOALS = ["Muscle", "Sommeil", "Énergie", "Immunité", "Focus"];

export function TutorialSettingsDemo() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLang, setSelectedLang] = useState("fr");

  // Auto-toggle dark mode
  useEffect(() => {
    const t1 = setTimeout(() => setDarkMode(true), 1200);
    const t2 = setTimeout(() => setSelectedLang("en"), 2500);
    const t3 = setTimeout(() => setSelectedLang("fr"), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-light tracking-tight text-foreground">Paramètres</h2>

      {/* Avatar + Name */}
      <div className="glass-card-premium rounded-3xl p-6 border border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User weight="light" className="w-10 h-10 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-card border-2 border-background flex items-center justify-center">
              <Camera weight="light" className="w-3.5 h-3.5 text-foreground/60" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">Jean Dupont</h3>
            <p className="text-sm text-foreground/50 font-light">jean.dupont@email.com</p>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-foreground/50 font-light mb-1.5 block">Prénom</label>
            <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground font-light">Jean</div>
          </div>
          <div>
            <label className="text-xs text-foreground/50 font-light mb-1.5 block">Nom</label>
            <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground font-light">Dupont</div>
          </div>
        </div>
      </div>

      {/* Theme toggle */}
      <div className="glass-card-premium rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-foreground">Thème</h3>
            <p className="text-sm text-foreground/50 font-light">Mode {darkMode ? "sombre" : "clair"}</p>
          </div>
          <motion.div
            animate={{ backgroundColor: darkMode ? "hsl(var(--primary))" : "hsl(var(--muted))" }}
            className="w-12 h-6 rounded-full relative cursor-default"
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ x: darkMode ? 24 : 2 }}
              className="w-5 h-5 rounded-full bg-white absolute top-0.5"
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </motion.div>
        </div>
      </div>

      {/* Language selector */}
      <div className="glass-card-premium rounded-3xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Globe weight="light" className="w-5 h-5 text-foreground/60" />
          <h3 className="text-base font-medium text-foreground">Langue</h3>
        </div>
        <div className="flex gap-2">
          {LANGUAGES.map(lang => (
            <motion.div
              key={lang.code}
              animate={selectedLang === lang.code ? { scale: [1, 1.05, 1] } : {}}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-light border transition-all",
                selectedLang === lang.code
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-white/5 text-foreground/50 border-white/10"
              )}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Health profile */}
      <div className="glass-card-premium rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-foreground">Profil de santé</h3>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-primary bg-primary/10 border border-primary/20">
            <ArrowClockwise weight="light" className="w-3 h-3" />
            Modifier
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {HEALTH_GOALS.map(goal => (
            <span key={goal} className="px-3 py-1.5 rounded-full text-xs font-light bg-primary/10 text-primary border border-primary/20">
              {goal}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
