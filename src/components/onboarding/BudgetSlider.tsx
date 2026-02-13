import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface BudgetPreset {
  id: string;
  label: string;
  emoji: string;
  range: { min: number; max: number };
}

const presets: Record<string, BudgetPreset[]> = {
  EUR: [
    { id: "standard", label: "Standard", emoji: "💙", range: { min: 40, max: 70 } },
    { id: "premium", label: "Premium", emoji: "💎", range: { min: 70, max: 120 } },
    { id: "elite", label: "Élite", emoji: "🏆", range: { min: 120, max: 180 } },
  ],
  USD: [
    { id: "standard", label: "Standard", emoji: "💙", range: { min: 50, max: 80 } },
    { id: "premium", label: "Premium", emoji: "💎", range: { min: 80, max: 140 } },
    { id: "elite", label: "Élite", emoji: "🏆", range: { min: 140, max: 200 } },
  ],
  GBP: [
    { id: "standard", label: "Standard", emoji: "💙", range: { min: 35, max: 60 } },
    { id: "premium", label: "Premium", emoji: "💎", range: { min: 60, max: 100 } },
    { id: "elite", label: "Élite", emoji: "🏆", range: { min: 100, max: 150 } },
  ],
  CHF: [
    { id: "standard", label: "Standard", emoji: "💙", range: { min: 45, max: 80 } },
    { id: "premium", label: "Premium", emoji: "💎", range: { min: 80, max: 130 } },
    { id: "elite", label: "Élite", emoji: "🏆", range: { min: 130, max: 190 } },
  ],
};

const currencySymbols: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "CHF",
  CAD: "$",
  AUD: "$",
};

interface BudgetSliderProps {
  currency: string;
  selectedPreset: string | null;
  customRange: { min: number; max: number } | null;
  onPresetChange: (presetId: string) => void;
  onCustomRangeChange: (range: { min: number; max: number }) => void;
}

export function BudgetSlider({
  currency,
  selectedPreset,
  customRange,
  onPresetChange,
  onCustomRangeChange,
}: BudgetSliderProps) {
  const currencyPresets = presets[currency] || presets.EUR;
  const symbol = currencySymbols[currency] || "€";

  const [customMin, setCustomMin] = useState<string>(customRange?.min?.toString() || "");
  const [customMax, setCustomMax] = useState<string>(customRange?.max?.toString() || "");
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    if (selectedPreset && !isCustom) {
      const preset = currencyPresets.find((p) => p.id === selectedPreset);
      if (preset) {
        setCustomMin(preset.range.min.toString());
        setCustomMax(preset.range.max.toString());
      }
    }
  }, [selectedPreset, currencyPresets, isCustom]);

  const handlePresetClick = (presetId: string) => {
    setIsCustom(false);
    onPresetChange(presetId);
    const preset = currencyPresets.find((p) => p.id === presetId);
    if (preset) {
      setCustomMin(preset.range.min.toString());
      setCustomMax(preset.range.max.toString());
      onCustomRangeChange(preset.range);
    }
  };

  const handleCustomMinChange = (val: string) => {
    setCustomMin(val);
    setIsCustom(true);
    onPresetChange("");
    const min = parseInt(val) || 0;
    const max = parseInt(customMax) || 0;
    if (min > 0 && max > 0 && max >= min) {
      onCustomRangeChange({ min, max });
    }
  };

  const handleCustomMaxChange = (val: string) => {
    setCustomMax(val);
    setIsCustom(true);
    onPresetChange("");
    const min = parseInt(customMin) || 0;
    const max = parseInt(val) || 0;
    if (min > 0 && max > 0 && max >= min) {
      onCustomRangeChange({ min, max });
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="grid grid-cols-3 gap-3">
        {currencyPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset.id)}
            className={cn(
              "p-4 rounded-2xl border text-center transition-all",
              selectedPreset === preset.id && !isCustom
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
            )}
          >
            <span className="text-2xl block mb-2">{preset.emoji}</span>
            <span className="text-sm font-medium block">{preset.label}</span>
            <span className="text-xs text-muted-foreground">
              {preset.range.min}-{preset.range.max}{symbol}/mois
            </span>
          </button>
        ))}
      </div>

      {/* Custom Budget */}
      <div className={cn(
        "p-4 rounded-xl border transition-all",
        isCustom
          ? "bg-primary/5 border-primary/30"
          : "bg-card/30 border-border/50"
      )}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-foreground">Budget personnalisé</span>
          {isCustom && (
            <span className="text-xs text-primary font-medium px-2 py-0.5 rounded-full bg-primary/10">
              Actif
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              type="number"
              placeholder="Min"
              value={customMin}
              onChange={(e) => handleCustomMinChange(e.target.value)}
              className="pr-8 text-center"
              min={0}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{symbol}</span>
          </div>
          <span className="text-muted-foreground font-medium">—</span>
          <div className="flex-1 relative">
            <Input
              type="number"
              placeholder="Max"
              value={customMax}
              onChange={(e) => handleCustomMaxChange(e.target.value)}
              className="pr-8 text-center"
              min={0}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{symbol}</span>
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap">/mois</span>
        </div>
      </div>
    </div>
  );
}
