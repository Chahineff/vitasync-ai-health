import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SplineBackground } from "@/components/sections/SplineBackground";
import { motion } from "framer-motion";

interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  date?: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, subtitle, date, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SplineBackground />
      <FloatingThemeToggle />
      <ScrollToTopButton />
      <Navbar />
      <main className="relative z-10 pt-32 pb-20">
        <div className="container-custom max-w-4xl">
          <motion.header
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-14 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-light text-foreground tracking-tight mb-4">
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
          </motion.header>

          <div className="glass-card border border-border/40 bg-white/50 dark:bg-transparent dark:border-white/[0.06] rounded-2xl p-6 md:p-10">
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
