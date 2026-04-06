import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SliderQuestionProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  labels?: { left: string; right: string };
  showValue?: boolean;
  invertColors?: boolean;
}

function getColorClasses(percent: number, invert: boolean) {
  const p = invert ? 100 - percent : percent;
  if (p < 20) return "text-red-400 bg-red-500/15 border-red-500/20";
  if (p < 40) return "text-orange-400 bg-orange-500/15 border-orange-500/20";
  if (p < 60) return "text-yellow-400 bg-yellow-500/15 border-yellow-500/20";
  if (p < 80) return "text-green-400 bg-green-500/15 border-green-500/20";
  return "text-emerald-400 bg-emerald-500/15 border-emerald-500/20";
}

function getEmoji(percent: number, invert: boolean) {
  const p = invert ? 100 - percent : percent;
  if (p < 20) return "😫";
  if (p < 40) return "😕";
  if (p < 60) return "😐";
  if (p < 80) return "🙂";
  return "🔥";
}

export function SliderQuestion({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 5,
  labels,
  showValue = true,
  invertColors = false,
}: SliderQuestionProps) {
  const percent = ((value - min) / (max - min)) * 100;
  const colorClass = getColorClasses(percent, invertColors);
  const emoji = getEmoji(percent, invertColors);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {showValue && (
          <motion.div
            key={value}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={cn(
              "flex items-center gap-1.5 px-3 h-10 rounded-xl border font-semibold text-sm",
              colorClass
            )}
          >
            <span>{emoji}</span>
            <span>{value}%</span>
          </motion.div>
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

      {/* Visual fill bar */}
      <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            invertColors
              ? "bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400"
              : "bg-gradient-to-r from-red-400 via-yellow-400 to-emerald-400"
          )}
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      </div>

      {labels && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{labels.left}</span>
          <span>{labels.right}</span>
        </div>
      )}
    </div>
  );
}
