import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { LegalParticles } from "@/components/ui/LegalParticles";
import { useTranslation } from "@/hooks/useTranslation";
import { ScrollText } from "lucide-react";

interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  date?: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, subtitle, date, children }: LegalPageLayoutProps) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <LegalParticles />
      <FloatingThemeToggle />
      <ScrollToTopButton />
      <Navbar />
      <main className="relative z-10 pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="container-custom max-w-3xl">
          <header className="mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-card/60 border border-border/40 backdrop-blur-sm">
              <ScrollText className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10.5px] uppercase tracking-[0.18em] font-medium text-foreground/60">
                {t("legal.effectiveDate") /* "Document légal" key fallback */}
              </span>
            </div>
            <h1 className="text-3xl md:text-[40px] leading-[1.15] font-light text-foreground tracking-tight mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-foreground/60 text-[15px] md:text-base leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            )}
            {date && (
              <div className="mt-5 pt-4 border-t border-border/40 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-foreground/50">
                <span>
                  <span className="text-foreground/40">{t("legal.effectiveDate")} : </span>
                  <span className="text-foreground/70 font-medium">{date}</span>
                </span>
                <span className="text-foreground/30">·</span>
                <span className="text-foreground/40">Version 2.0</span>
              </div>
            )}
          </header>

          <article
            className="legal-prose prose prose-base dark:prose-invert max-w-none
              prose-headings:text-foreground prose-headings:font-medium prose-headings:tracking-tight
              prose-h2:text-[22px] md:prose-h2:text-2xl prose-h2:mt-14 prose-h2:mb-5 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/40
              prose-h3:text-[17px] md:prose-h3:text-lg prose-h3:mt-9 prose-h3:mb-3 prose-h3:text-foreground/90
              prose-p:text-foreground/75 prose-p:leading-[1.75] prose-p:text-[15px]
              prose-li:text-foreground/75 prose-li:text-[15px] prose-li:leading-[1.7] prose-li:my-1
              prose-ul:my-4 prose-ol:my-4
              prose-strong:text-foreground prose-strong:font-medium
              prose-a:text-primary prose-a:no-underline prose-a:underline-offset-4 hover:prose-a:underline
              prose-hr:border-border/40 prose-hr:my-10"
          >
            {children}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
