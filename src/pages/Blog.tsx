import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Tag } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";

const Blog = () => {
  const { t } = useTranslation();

  const articles = [
    {
      slug: "ia-nutrition-revolution",
      title: t("blog.article1.title"),
      excerpt: t("blog.article1.excerpt"),
      category: t("blog.article1.category"),
      readTime: "5 min",
      date: "15 Jan 2025",
      gradient: "from-primary to-accent",
    },
    {
      slug: "comprendre-biomarqueurs",
      title: t("blog.article2.title"),
      excerpt: t("blog.article2.excerpt"),
      category: t("blog.article2.category"),
      readTime: "8 min",
      date: "12 Jan 2025",
      gradient: "from-secondary to-primary",
    },
    {
      slug: "sommeil-complements",
      title: t("blog.article3.title"),
      excerpt: t("blog.article3.excerpt"),
      category: t("blog.article3.category"),
      readTime: "6 min",
      date: "8 Jan 2025",
      gradient: "from-accent to-secondary",
    },
    {
      slug: "stress-cortisol-gestion",
      title: t("blog.article4.title"),
      excerpt: t("blog.article4.excerpt"),
      category: t("blog.article4.category"),
      readTime: "7 min",
      date: "5 Jan 2025",
      gradient: "from-primary to-secondary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <FloatingThemeToggle />
      <Navbar />
      <main>
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

        {/* Articles Grid */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-8">
              {articles.map((article, index) => (
                <ScrollReveal key={article.slug} delay={index * 0.1}>
                  <Link to={`/blog/${article.slug}`} className="block group">
                    <GlassCard hover className="h-full">
                      {/* Article Image Placeholder */}
                      <div className={`h-48 rounded-xl bg-gradient-to-br ${article.gradient} mb-6 opacity-20 group-hover:opacity-30 transition-opacity`} />
                      
                      {/* Meta */}
                      <div className="flex items-center gap-4 mb-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-primary">
                          <Tag size={14} weight="light" />
                          {article.category}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-foreground/50">
                          <Clock size={14} weight="light" />
                          {article.readTime}
                        </span>
                        <span className="text-xs text-foreground/40">
                          {article.date}
                        </span>
                      </div>

                      {/* Content */}
                      <h2 className="text-xl font-light tracking-tight text-foreground mb-3 group-hover:text-primary transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-sm text-foreground/50 mb-4">
                        {article.excerpt}
                      </p>

                      {/* Read More */}
                      <span className="inline-flex items-center gap-2 text-sm text-primary group-hover:gap-3 transition-all">
                        {t("blog.readArticle")}
                        <ArrowRight size={16} weight="light" />
                      </span>
                    </GlassCard>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
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
