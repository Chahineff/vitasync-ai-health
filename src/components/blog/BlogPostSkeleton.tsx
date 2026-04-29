import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SplineBackground } from "@/components/sections/SplineBackground";

/**
 * Lightweight skeleton shown while /blog/:slug chunk loads.
 * Matches the article layout to avoid layout shift / flash.
 */
export function BlogPostSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <SplineBackground />
      <Navbar />
      <main className="relative z-10 pt-32 pb-20">
        <div className="container-custom max-w-3xl mx-auto">
          <div className="h-4 w-28 rounded-md bg-foreground/5 mb-8 animate-pulse" />
          <div className="rounded-2xl border border-border/40 bg-white/40 dark:bg-transparent dark:border-white/[0.06] p-6 md:p-10 backdrop-blur">
            <div className="h-40 md:h-56 rounded-xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent mb-8 animate-pulse" />
            <div className="space-y-3">
              <div className="h-3 w-40 bg-foreground/5 rounded animate-pulse" />
              <div className="h-9 w-3/4 bg-foreground/10 rounded animate-pulse" />
              <div className="h-9 w-2/3 bg-foreground/10 rounded animate-pulse" />
              <div className="h-4 w-full bg-foreground/5 rounded animate-pulse mt-4" />
              <div className="h-4 w-5/6 bg-foreground/5 rounded animate-pulse" />
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-foreground/5 animate-pulse" />
              ))}
            </div>
            <div className="mt-10 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-3 bg-foreground/5 rounded animate-pulse"
                  style={{ width: `${100 - (i % 3) * 8}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}