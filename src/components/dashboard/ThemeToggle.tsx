import { useTheme } from "next-themes";
import { Sun, Moon } from "@phosphor-icons/react";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            {isDark ? (
              <Moon weight="light" className="w-5 h-5 text-primary" />
            ) : (
              <Sun weight="light" className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Mode sombre</p>
            <p className="text-xs text-foreground/50">
              {isDark ? "Activé" : "Désactivé"}
            </p>
          </div>
        </div>
        <Switch
          checked={isDark}
          onCheckedChange={handleToggle}
          aria-label="Toggle dark mode"
        />
      </div>
    </div>
  );
}
