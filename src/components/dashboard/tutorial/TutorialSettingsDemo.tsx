import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Camera, Globe, ArrowClockwise, Bell, Lock, ShieldCheck, CheckCircle, Circle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
];

const HEALTH_GOALS = ["Muscle", "Sommeil", "Énergie", "Immunité", "Focus"];

const PROFILE_ITEMS = [
  { label: "Photo de profil", done: true },
  { label: "Nom & prénom", done: true },
  { label: "Profil de santé", done: true },
  { label: "Première analyse", done: true },
  { label: "Premier complément", done: false },
];

export function TutorialSettingsDemo() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLang, setSelectedLang] = useState("fr");
  const [notifStates, setNotifStates] = useState([true, false, true]);

  // Auto-toggle animations
  useEffect(() => {
    const t1 = setTimeout(() => setDarkMode(true), 1200);
    const t2 = setTimeout(() => setSelectedLang("en"), 2500);
    const t3 = setTimeout(() => setSelectedLang("fr"), 3800);
    const t4 = setTimeout(() => setNotifStates([true, true, true]), 2000);
    const t5 = setTimeout(() => setNotifStates([true, true, false]), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  const completionPercent = Math.round((PROFILE_ITEMS.filter(i => i.done).length / PROFILE_ITEMS.length) * 100);

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-light tracking-tight text-foreground">Paramètres</h2>

      {/* Profile Completion */}
      <div className="glass-card-premium rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck weight="fill" className="w-5 h-5 text-primary" />
            <h3 className="text-base font-medium text-foreground">Complétion du profil</h3>
          </div>
          <span className="text-sm font-semibold text-primary">{completionPercent}%</span>
        </div>
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          />
        </div>
        <div className="space-y-2">
          {PROFILE_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              {item.done ? (
                <CheckCircle weight="fill" className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Circle weight="light" className="w-4 h-4 text-foreground/30 shrink-0" />
              )}
              <span className={cn("text-sm font-light", item.done ? "text-foreground/70" : "text-foreground/40")}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

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

      {/* Notifications */}
      <div className="glass-card-premium rounded-3xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Bell weight="light" className="w-5 h-5 text-foreground/60" />
          <h3 className="text-base font-medium text-foreground">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: "Rappels compléments", desc: "Notification quotidienne pour vos prises" },
            { label: "Analyse prête", desc: "Quand votre analyse sanguine est terminée" },
            { label: "Résumé hebdomadaire", desc: "Bilan de votre semaine chaque dimanche" },
          ].map((notif, i) => (
            <div key={notif.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-foreground">{notif.label}</p>
                <p className="text-xs text-foreground/40 font-light">{notif.desc}</p>
              </div>
              <motion.div
                animate={{ backgroundColor: notifStates[i] ? "hsl(var(--primary))" : "hsl(var(--muted))" }}
                className="w-10 h-5 rounded-full relative cursor-default shrink-0"
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ x: notifStates[i] ? 20 : 2 }}
                  className="w-4 h-4 rounded-full bg-white absolute top-0.5"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              </motion.div>
            </div>
          ))}
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

      {/* Security */}
      <div className="glass-card-premium rounded-3xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Lock weight="light" className="w-5 h-5 text-foreground/60" />
          <h3 className="text-base font-medium text-foreground">Sécurité</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-foreground/50 font-light mb-1.5 block">Nouveau mot de passe</label>
            <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground/30 font-light">••••••••••</div>
          </div>
          <div>
            <label className="text-xs text-foreground/50 font-light mb-1.5 block">Confirmer le mot de passe</label>
            <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground/30 font-light">••••••••••</div>
          </div>
          {/* Strength indicator */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 flex-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={cn("h-1 rounded-full flex-1", i <= 3 ? "bg-primary" : "bg-muted/30")} />
              ))}
            </div>
            <span className="text-xs text-primary font-medium">Fort</span>
          </div>
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
