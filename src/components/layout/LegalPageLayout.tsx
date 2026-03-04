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
        <div className="container-custom max-w-4xl">
          <header className="mb-14">
            <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-foreground/50 text-base">{subtitle}</p>
            )}
            {date && (
              <p className="text-foreground/40 text-sm mt-3">
                Date d'entrée en vigueur : {date} | Version 2.0
              </p>
            )}
          </header>

          <article className="legal-prose prose prose-base dark:prose-invert max-w-none
            prose-headings:text-foreground prose-headings:font-medium prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5
            prose-h3:text-xl prose-h3:mt-9 prose-h3:mb-4
            prose-p:text-foreground/70 prose-p:leading-relaxed prose-p:text-base
            prose-li:text-foreground/70 prose-li:text-base
            prose-strong:text-foreground prose-strong:font-medium
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          ">
            {children}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
