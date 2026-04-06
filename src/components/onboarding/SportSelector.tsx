import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Minus } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface SelectedSport {
  id: string;
  label: string;
  emoji: string;
  frequency: number; // times per week
}

const allSports = [
  { id: "muscu", label: "Musculation", emoji: "🏋️" },
  { id: "cardio", label: "Cardio / HIIT", emoji: "🫀" },
  { id: "running", label: "Course à pied", emoji: "🏃" },
  { id: "cycling", label: "Cyclisme", emoji: "🚴" },
  { id: "swimming", label: "Natation", emoji: "🏊" },
  { id: "yoga", label: "Yoga", emoji: "🧘" },
  { id: "pilates", label: "Pilates", emoji: "🤸" },
  { id: "crossfit", label: "CrossFit", emoji: "💪" },
  { id: "football", label: "Football", emoji: "⚽" },
  { id: "basketball", label: "Basketball", emoji: "🏀" },
  { id: "tennis", label: "Tennis", emoji: "🎾" },
  { id: "padel", label: "Padel", emoji: "🏓" },
  { id: "rugby", label: "Rugby", emoji: "🏉" },
  { id: "volleyball", label: "Volleyball", emoji: "🏐" },
  { id: "handball", label: "Handball", emoji: "🤾" },
  { id: "boxing", label: "Boxe", emoji: "🥊" },
  { id: "mma", label: "MMA / Arts martiaux", emoji: "🥋" },
  { id: "climbing", label: "Escalade", emoji: "🧗" },
  { id: "hiking", label: "Randonnée", emoji: "🥾" },
  { id: "skiing", label: "Ski / Snowboard", emoji: "⛷️" },
  { id: "surfing", label: "Surf", emoji: "🏄" },
  { id: "rowing", label: "Aviron / Rameur", emoji: "🚣" },
  { id: "dancing", label: "Danse", emoji: "💃" },
  { id: "gymnastics", label: "Gymnastique", emoji: "🤸" },
  { id: "golf", label: "Golf", emoji: "⛳" },
  { id: "horse", label: "Équitation", emoji: "🏇" },
  { id: "skating", label: "Patinage / Roller", emoji: "⛸️" },
  { id: "badminton", label: "Badminton", emoji: "🏸" },
  { id: "table_tennis", label: "Tennis de table", emoji: "🏓" },
  { id: "athletics", label: "Athlétisme", emoji: "🏅" },
  { id: "triathlon", label: "Triathlon", emoji: "🏊" },
  { id: "walking", label: "Marche active", emoji: "🚶" },
  { id: "stretching", label: "Stretching", emoji: "🙆" },
  { id: "calisthenics", label: "Calisthenics", emoji: "🤸" },
  { id: "cricket", label: "Cricket", emoji: "🏏" },
  { id: "baseball", label: "Baseball", emoji: "⚾" },
  { id: "hockey", label: "Hockey", emoji: "🏒" },
  { id: "fencing", label: "Escrime", emoji: "🤺" },
  { id: "archery", label: "Tir à l'arc", emoji: "🏹" },
  { id: "other", label: "Autre", emoji: "🎯" },
];

interface SportSelectorProps {
  selectedSports: SelectedSport[];
  onChange: (sports: SelectedSport[]) => void;
}

export function SportSelector({ selectedSports, onChange }: SportSelectorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");

  const availableSports = allSports.filter(
    (s) => !selectedSports.some((sel) => sel.id === s.id)
  );

  const filteredSports = search
    ? availableSports.filter((s) =>
        s.label.toLowerCase().includes(search.toLowerCase())
      )
    : availableSports;

  const addSport = (sport: (typeof allSports)[0]) => {
    onChange([...selectedSports, { ...sport, frequency: 2 }]);
    setShowPicker(false);
    setSearch("");
  };

  const removeSport = (id: string) => {
    onChange(selectedSports.filter((s) => s.id !== id));
  };

  const updateFrequency = (id: string, delta: number) => {
    onChange(
      selectedSports.map((s) =>
        s.id === id
          ? { ...s, frequency: Math.max(1, Math.min(7, s.frequency + delta)) }
          : s
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Selected sports list */}
      <AnimatePresence mode="popLayout">
        {selectedSports.map((sport) => (
          <motion.div
            key={sport.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card/60 backdrop-blur-sm"
          >
            <span className="text-2xl">{sport.emoji}</span>
            <span className="text-sm font-medium flex-1 truncate">
              {sport.label}
            </span>

            {/* Frequency stepper */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateFrequency(sport.id, -1)}
                className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <Minus className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <span className="text-sm font-semibold w-8 text-center tabular-nums">
                {sport.frequency}x
              </span>
              <button
                onClick={() => updateFrequency(sport.id, 1)}
                className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <span className="text-xs text-muted-foreground">/sem</span>
            </div>

            <button
              onClick={() => removeSport(sport.id)}
              className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add sport button / picker */}
      <AnimatePresence>
        {showPicker ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <input
              type="text"
              placeholder="Rechercher un sport..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-card/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="max-h-[240px] overflow-y-auto grid grid-cols-2 gap-2 pr-1">
              {filteredSports.map((sport) => (
                <motion.button
                  key={sport.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addSport(sport)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card/50 hover:border-primary/50 hover:bg-card transition-all text-left"
                >
                  <span className="text-lg">{sport.emoji}</span>
                  <span className="text-xs font-medium truncate">
                    {sport.label}
                  </span>
                </motion.button>
              ))}
              {filteredSports.length === 0 && (
                <p className="col-span-2 text-center text-sm text-muted-foreground py-4">
                  Aucun sport trouvé
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setShowPicker(false);
                setSearch("");
              }}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Fermer
            </button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowPicker(true)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-card/50 transition-all text-sm text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-4 h-4" />
            Ajouter un sport
          </motion.button>
        )}
      </AnimatePresence>

      {selectedSports.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Clique sur "Ajouter un sport" pour commencer
        </p>
      )}
    </div>
  );
}

export { allSports };
