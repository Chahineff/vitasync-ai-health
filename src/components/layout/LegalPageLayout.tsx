import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";

interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  date?: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, subtitle, date, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <FloatingThemeToggle />
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container-custom max-w-3xl">
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">
              {title}
            </h1>
            {subtitle && (
              <p className="text-foreground/50 text-sm">{subtitle}</p>
            )}
            {date && (
              <p className="text-foreground/40 text-xs mt-2">
                Date d'entrée en vigueur : {date} | Version 2.0
              </p>
            )}
          </header>

          <article className="prose prose-sm dark:prose-invert max-w-none
            prose-headings:text-foreground prose-headings:font-medium prose-headings:tracking-tight
            prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-foreground/70 prose-p:leading-relaxed
            prose-li:text-foreground/70
            prose-strong:text-foreground prose-strong:font-medium
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-table:text-sm
            prose-th:text-foreground prose-th:font-medium prose-th:bg-muted/50 prose-th:px-3 prose-th:py-2
            prose-td:text-foreground/70 prose-td:px-3 prose-td:py-2 prose-td:border-border/50
          ">
            {children}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
