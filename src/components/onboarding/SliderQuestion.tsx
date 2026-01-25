import { Slider } from "@/components/ui/slider";

interface SliderQuestionProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  labels?: { left: string; right: string };
  showValue?: boolean;
  emoji?: string;
}

export function SliderQuestion({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  labels,
  showValue = true,
  emoji,
}: SliderQuestionProps) {
  const getEmoji = (val: number) => {
    if (max === 5) {
      const emojis = ["😫", "😕", "😐", "😊", "😄"];
      return emojis[val - 1] || "😐";
    }
    return emoji || "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {showValue && (
          <span className="text-2xl">{getEmoji(value)}</span>
        )}
      </div>
      
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      
      {labels && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{labels.left}</span>
          <span>{labels.right}</span>
        </div>
      )}
    </div>
  );
}
