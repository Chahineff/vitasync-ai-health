import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Tag, NotePencil } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { SplineBackground } from "@/components/sections/SplineBackground";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  read_time: string | null;
  created_at: string;
}

const Blog = () => {
  const { t } = useTranslation();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts" as any)
        .select("id, slug, title, excerpt, category, read_time, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as BlogPost[];
    },
  });

  const gradients = [
    "from-primary to-accent",
    "from-secondary to-primary",
    "from-accent to-secondary",
    "from-primary to-secondary",
  ];

  return (
    <div className="min-h-screen bg-background">
      <SplineBackground />
      <FloatingThemeToggle />
      <Navbar />
      <main className="relative z-10">
        {/* Hero */}
        <section className="pt-32 pb-20 bg-gradient-radial">
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
                {t("blog.title")}{" "}
                <span className="gradient-text">{t("blog.titleHighlight")}</span>
              </h1>
              <p className="text-lg text-foreground/60">
                {t("blog.subtitle")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Articles Grid or Empty State */}
        <section className="section-padding">
          <div className="container-custom">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : articles.length === 0 ? (
              <ScrollReveal>
                <GlassCard className="max-w-2xl mx-auto text-center py-16 px-8">
                  <NotePencil size={56} weight="light" className="mx-auto text-foreground/30 mb-6" />
                  <h2 className="text-2xl font-light tracking-tight text-foreground mb-3">
                    {t("blog.emptyTitle")}
                  </h2>
                  <p className="text-foreground/50">
                    {t("blog.emptySubtitle")}
                  </p>
                </GlassCard>
              </ScrollReveal>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {articles.map((article, index) => (
                  <ScrollReveal key={article.id} delay={index * 0.1}>
                    <Link to={`/blog/${article.slug}`} className="block group">
                      <GlassCard hover className="h-full">
                        <div className={`h-48 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} mb-6 opacity-20 group-hover:opacity-30 transition-opacity`} />
                        <div className="flex items-center gap-4 mb-4">
                          {article.category && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-primary">
                              <Tag size={14} weight="light" />
                              {article.category}
                            </span>
                          )}
                          {article.read_time && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-foreground/50">
                              <Clock size={14} weight="light" />
                              {article.read_time}
                            </span>
                          )}
                          <span className="text-xs text-foreground/40">
                            {new Date(article.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h2 className="text-xl font-light tracking-tight text-foreground mb-3 group-hover:text-primary transition-colors">
                          {article.title}
                        </h2>
                        {article.excerpt && (
                          <p className="text-sm text-foreground/50 mb-4">
                            {article.excerpt}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-2 text-sm text-primary group-hover:gap-3 transition-all">
                          {t("blog.readArticle")}
                          <ArrowRight size={16} weight="light" />
                        </span>
                      </GlassCard>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="section-padding bg-gradient-subtle">
          <div className="container-custom">
            <ScrollReveal>
              <GlassCard className="max-w-3xl mx-auto text-center p-12">
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-4">
                  {t("blog.newsletterTitle")}
                </h2>
                <p className="text-lg text-foreground/60 mb-8">
                  {t("blog.newsletterSubtitle")}
                </p>
                <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder={t("blog.emailPlaceholder")}
                    className="flex-1 px-6 py-4 rounded-xl glass-card bg-background border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
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
    </div>
  );
};

export default Blog;
