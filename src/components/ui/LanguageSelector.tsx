import { Globe } from "@phosphor-icons/react";
import { useI18n } from "@/hooks/useTranslation";
import { languages, type Locale } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  
  const currentLanguage = languages.find(l => l.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors text-foreground/70 hover:text-foreground">
        <Globe weight="light" className="w-4 h-4" />
        <span className="text-sm">{currentLanguage?.flag}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-border/50">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => setLocale(lang.code as Locale)}
            className={`flex items-center gap-2 cursor-pointer ${locale === lang.code ? "bg-primary/10 text-primary" : ""}`}
          >
            <span className="text-base">{lang.flag}</span>
            <span className="text-sm">{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
