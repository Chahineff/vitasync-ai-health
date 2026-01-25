import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface BudgetPreset {
  id: string;
  label: string;
  emoji: string;
  range: { min: number; max: number };
}

const presets: Record<string, BudgetPreset[]> = {
  EUR: [
    { id: "eco", label: "Éco", emoji: "💚", range: { min: 20, max: 40 } },
    { id: "standard", label: "Standard", emoji: "💙", range: { min: 40, max: 70 } },
    { id: "premium", label: "Premium", emoji: "💎", range: { min: 70, max: 120 } },
  ],
  USD: [
    { id: "eco", label: "Éco", emoji: "💚", range: { min: 25, max: 50 } },
    { id: "standard", label: "Standard", emoji: "💙", range: { min: 50, max: 80 } },
    { id: "premium", label: "Premium", emoji: "💎", range: { min: 80, max: 150 } },
  ],
  GBP: [
    { id: "eco", label: "Éco", emoji: "💚", range: { min: 20, max: 35 } },
    { id: "standard", label: "Standard", emoji: "💙", range: { min: 35, max: 60 } },
    { id: "premium", label: "Premium", emoji: "💎", range: { min: 60, max: 100 } },
  ],
  CHF: [
    { id: "eco", label: "Éco", emoji: "💚", range: { min: 25, max: 45 } },
    { id: "standard", label: "Standard", emoji: "💙", range: { min: 45, max: 80 } },
    { id: "premium", label: "Premium", emoji: "💎", range: { min: 80, max: 130 } },
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
  
  const maxBudget = currencyPresets[2].range.max;
  const minBudget = currencyPresets[0].range.min;

  const [sliderValue, setSliderValue] = useState<[number, number]>([
    customRange?.min || currencyPresets[1].range.min,
    customRange?.max || currencyPresets[1].range.max,
  ]);

  useEffect(() => {
    if (selectedPreset) {
      const preset = currencyPresets.find((p) => p.id === selectedPreset);
      if (preset) {
        setSliderValue([preset.range.min, preset.range.max]);
      }
    }
  }, [selectedPreset, currencyPresets]);

  const handlePresetClick = (presetId: string) => {
    onPresetChange(presetId);
    const preset = currencyPresets.find((p) => p.id === presetId);
    if (preset) {
      setSliderValue([preset.range.min, preset.range.max]);
      onCustomRangeChange(preset.range);
    }
  };

  const handleSliderChange = (values: number[]) => {
    const [min, max] = values as [number, number];
    setSliderValue([min, max]);
    onCustomRangeChange({ min, max });
    
    // Check if matches a preset
    const matchingPreset = currencyPresets.find(
      (p) => p.range.min === min && p.range.max === max
    );
    if (matchingPreset) {
      onPresetChange(matchingPreset.id);
    } else {
      onPresetChange("");
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
              selectedPreset === preset.id
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

      {/* Custom Slider */}
      <div className="space-y-4 p-4 rounded-xl bg-card/30 border border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Budget personnalisé</span>
          <span className="text-lg font-medium text-primary">
            {sliderValue[0]}-{sliderValue[1]}{symbol}/mois
          </span>
        </div>
        
        <Slider
          value={sliderValue}
          onValueChange={handleSliderChange}
          min={minBudget}
          max={maxBudget}
          step={5}
          className="w-full"
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{minBudget}{symbol}</span>
          <span>{maxBudget}{symbol}</span>
        </div>
      </div>
    </div>
  );
}
