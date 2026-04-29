import { useMemo, useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { SplineBackground } from "@/components/sections/SplineBackground";
import { POSTS, CATEGORIES, type BlogCategory } from "@/data/blog/posts";
import { PostCard } from "@/components/blog/PostCard";
import { useDocumentSEO } from "@/components/blog/useDocumentSEO";

const Blog = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<"all" | BlogCategory>("all");

  const posts = useMemo(
    () =>
      activeCategory === "all"
        ? POSTS
        : POSTS.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  const canonical =
    typeof window !== "undefined" ? `${window.location.origin}/blog` : "https://vitasyncai.lovable.app/blog";

  useDocumentSEO({
    title: "Blog VitaSync — Science de la supplémentation, décodée",
    description:
      "Articles fondateurs VitaSync : vitamine D, magnésium, oméga-3, créatine. Données NHANES, méta-analyses et recommandations pratiques pour votre stack.",
    canonical,
    ogImage: POSTS[0]?.ogImage || "/placeholder.svg",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Blog VitaSync",
      url: canonical,
      blogPost: POSTS.map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: `${canonical}/${p.slug}`,
        datePublished: p.publishedAt,
        description: p.metaDescription,
      })),
    },
  });

  return (
    <PageTransition className="min-h-screen bg-background">
      <SplineBackground />
      <FloatingThemeToggle />
      <ScrollToTopButton />
      <Navbar />
      <main id="main" className="relative z-10">
        {/* Hero */}
        <section className="pt-32 pb-12">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mx-auto text-center"
            >
              <span className="text-sm text-primary uppercase tracking-widest mb-4 block">
                {t("blog.badge")}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-6">
                {t("blog.title")} <span className="gradient-text">{t("blog.titleHighlight")}</span>
              </h1>
              <p className="text-lg text-foreground/60">{t("blog.subtitle")}</p>
            </motion.div>
          </div>
        </section>

        {/* Category filters */}
        <section className="pb-8">
          <div className="container-custom">
            <div
              className="flex flex-wrap justify-center gap-2"
              role="tablist"
              aria-label="Catégories d'articles"
            >
              {CATEGORIES.map((c) => {
                const active = activeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-all border ${
                      active
                        ? "bg-primary/15 text-primary border-primary/40"
                        : "bg-card/30 text-foreground/60 border-border/40 hover:text-foreground hover:border-border"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="section-padding pt-4">
          <div className="container-custom">
            {posts.length === 0 ? (
              <p className="text-center text-foreground/50 py-20">Aucun article dans cette catégorie pour l'instant.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {posts.map((post, index) => (
                  <ScrollReveal key={post.slug} delay={index * 0.08}>
                    <PostCard post={post} />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="section-padding bg-gradient-subtle border-y border-border/30">
          <div className="container-custom">
            <ScrollReveal>
              <GlassCard className="max-w-3xl mx-auto text-center p-12">
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-4">
                  {t("blog.newsletterTitle")}
                </h2>
                <p className="text-lg text-foreground/60 mb-8">{t("blog.newsletterSubtitle")}</p>
                <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <label htmlFor="newsletter-email" className="sr-only">
                    {t("blog.emailPlaceholder")}
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    placeholder={t("blog.emailPlaceholder")}
                    className="flex-1 px-6 py-4 rounded-xl bg-background border border-border/50 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button type="submit" className="btn-neumorphic text-primary-foreground">
                    {t("blog.subscribe")}
                  </button>
                </form>
              </GlassCard>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Blog;
