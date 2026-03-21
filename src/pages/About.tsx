import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { motion } from "framer-motion";
import { 
  Brain, 
  Heart, 
  ShieldCheck, 
  Users,
  ListChecks,
  ChatCircle,
  Package,
  FileArrowUp
} from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { SplineBackground } from "@/components/sections/SplineBackground";

const About = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: Brain,
      title: t("about.value1.title"),
      description: t("about.value1.description"),
    },
    {
      icon: Heart,
      title: t("about.value2.title"),
      description: t("about.value2.description"),
    },
    {
      icon: ShieldCheck,
      title: t("about.value3.title"),
      description: t("about.value3.description"),
    },
    {
      icon: Users,
      title: t("about.value4.title"),
      description: t("about.value4.description"),
    },
  ];

  const facts = [
    { icon: ListChecks, value: t("about.fact1Value"), label: t("about.fact1Label") },
    { icon: ChatCircle, value: t("about.fact2Value"), label: t("about.fact2Label") },
    { icon: Package, value: t("about.fact3Value"), label: t("about.fact3Label") },
    { icon: FileArrowUp, value: t("about.fact4Value"), label: t("about.fact4Label") },
  ];

  return (
    <PageTransition className="min-h-screen bg-background">
      <SplineBackground />
      <FloatingThemeToggle />
      <ScrollToTopButton />
      <Navbar />
      <main className="relative z-10">
        {/* Hero */}
        <section className="pt-32 pb-20">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mx-auto text-center"
            >
              <span className="text-sm text-primary uppercase tracking-widest mb-4 block">
                {t("about.badge")}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-6">
                {t("about.title")}{" "}
                <span className="gradient-text">{t("about.titleHighlight")}</span>
              </h1>
              <p className="text-lg text-foreground/60 mb-4">
                {t("about.subtitle")}
              </p>
              <p className="text-sm text-foreground/40 italic">
                {t("about.heroMicro")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story + Facts */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <ScrollReveal>
                <div>
                  <span className="text-sm text-secondary uppercase tracking-widest mb-4 block">
                    {t("about.storyBadge")}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-6">
                    {t("about.storyTitle")}
                  </h2>
                  <div className="space-y-4 text-foreground/60">
                    <p>{t("about.storyP1")}</p>
                    <p>{t("about.storyP2")}</p>
                    <p>{t("about.storyP3")}</p>
                  </div>
                  <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-sm text-foreground/50 italic">
                      🤖 {t("about.storyAI")}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <GlassCard className="p-8">
                  <div className="space-y-6">
                    {facts.map((fact, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="icon-container shrink-0">
                          <fact.icon size={24} weight="light" className="text-primary" />
                        </div>
                        <div>
                          <span className="text-lg font-medium gradient-text block">{fact.value}</span>
                          <p className="text-sm text-foreground/50 mt-0.5">{fact.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-gradient-subtle border-y border-border/30">
          <div className="container-custom">
            <ScrollReveal>
              <div className="text-center mb-16">
                <span className="text-sm text-primary uppercase tracking-widest mb-4 block">
                  {t("about.valuesBadge")}
                </span>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
                  {t("about.valuesTitle")}
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <ScrollReveal key={value.title} delay={index * 0.1}>
                  <GlassCard hover className="h-full text-center">
                    <div className="icon-container mx-auto mb-4">
                      <value.icon size={28} weight="light" className="text-primary" />
                    </div>
                    <h3 className="text-lg font-light text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-foreground/50">{value.description}</p>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding">
          <div className="container-custom">
            <ScrollReveal>
              <GlassCard className="max-w-3xl mx-auto text-center p-12">
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-4">
                  {t("about.ctaTitle")}
                </h2>
                <p className="text-lg text-foreground/60 mb-8">
                  {t("about.ctaSubtitle")}
                </p>
                <a href="/#pricing" className="btn-neumorphic text-primary-foreground">
                  {t("about.ctaCta")}
                </a>
              </GlassCard>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default About;
