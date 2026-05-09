import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowCard } from "@/components/ui/spotlight-card";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { BlogBreadcrumbs } from "@/components/blog/BlogBreadcrumbs";
import { motion } from "framer-motion";
import {
  Brain,
  Heart,
  ShieldCheck,
  Users,
  ListChecks,
  ChatCircle,
  Package,
  FileArrowUp,
  Sparkle,
  Compass,
  ChartLineUp,
  Lock,
  CheckCircle,
  ArrowRight,
} from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

const About = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const facts = [
    { icon: ListChecks, value: t("about.fact1Value"), label: t("about.fact1Label") },
    { icon: ChatCircle, value: t("about.fact2Value"), label: t("about.fact2Label") },
    { icon: Package, value: t("about.fact3Value"), label: t("about.fact3Label") },
    { icon: FileArrowUp, value: t("about.fact4Value"), label: t("about.fact4Label") },
  ];

  const milestones = [
    { year: t("about.milestone1Year"), title: t("about.milestone1Title"), desc: t("about.milestone1Desc"), icon: Compass },
    { year: t("about.milestone2Year"), title: t("about.milestone2Title"), desc: t("about.milestone2Desc"), icon: Sparkle },
    { year: t("about.milestone3Year"), title: t("about.milestone3Title"), desc: t("about.milestone3Desc"), icon: Brain },
    { year: t("about.milestone4Year"), title: t("about.milestone4Title"), desc: t("about.milestone4Desc"), icon: ChartLineUp },
  ];

  const aiSteps = [
    { icon: Brain, title: t("about.aiStep1Title"), desc: t("about.aiStep1Desc") },
    { icon: Sparkle, title: t("about.aiStep2Title"), desc: t("about.aiStep2Desc") },
    { icon: ChartLineUp, title: t("about.aiStep3Title"), desc: t("about.aiStep3Desc") },
  ];

  const commitments = [
    t("about.commit1"),
    t("about.commit2"),
    t("about.commit3"),
    t("about.commit4"),
  ];

  const values = [
    { icon: Brain, title: t("about.value1.title"), description: t("about.value1.description") },
    { icon: Heart, title: t("about.value2.title"), description: t("about.value2.description") },
    { icon: ShieldCheck, title: t("about.value3.title"), description: t("about.value3.description") },
    { icon: Users, title: t("about.value4.title"), description: t("about.value4.description") },
  ];

  return (
    <PageTransition className="min-h-screen bg-background">
      {/* Custom layered background — Spline-like aura at top, gradients below */}
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top aura (hero zone only) */}
        <div className="absolute inset-x-0 top-0 h-[100vh] bg-gradient-mesh opacity-90" />
        <div className="absolute inset-x-0 top-0 h-[100vh] bg-[radial-gradient(ellipse_120%_70%_at_50%_0%,hsl(var(--primary)/0.28),transparent_60%),radial-gradient(ellipse_80%_50%_at_80%_10%,hsl(var(--secondary)/0.22),transparent_60%)]" />
        {/* Fade hero into background */}
        <div className="absolute inset-x-0 top-[60vh] h-[40vh] bg-gradient-to-b from-transparent to-background" />
        {/* Mid drifting blobs */}
        <div className="absolute left-[-10%] top-[120vh] w-[55vw] h-[55vw] rounded-full bg-secondary/15 blur-[120px]" />
        <div className="absolute right-[-10%] top-[200vh] w-[50vw] h-[50vw] rounded-full bg-primary/15 blur-[140px]" />
        <div className="absolute left-[20%] top-[300vh] w-[45vw] h-[45vw] rounded-full bg-secondary/10 blur-[120px]" />
        {/* Subtle base wash */}
        <div className="absolute inset-0 bg-background/40 dark:bg-background/30" />
      </div>
      <FloatingThemeToggle />
      <ScrollToTopButton />
      <Navbar />
      <main id="main" aria-label="Contenu principal" className="relative z-10">
        {/* Breadcrumbs */}
        <div className="container-custom pt-24 md:pt-28">
          <BlogBreadcrumbs
            items={[
              { label: t("about.crumbHome"), href: "/" },
              { label: t("about.crumbAbout") },
            ]}
          />
        </div>

        {/* Hero — asymmetric editorial */}
        <section className="pt-8 pb-16 md:pt-12 md:pb-24">
          <div className="container-custom">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7"
              >
                <span className="inline-flex items-center gap-2 text-xs md:text-sm text-primary uppercase tracking-[0.25em] mb-6 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
                  <Sparkle size={14} weight="fill" />
                  {t("about.badge")}
                </span>
                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6 leading-[1.05]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {t("about.title")}{" "}
                  <span
                    className="gradient-text italic font-normal"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {t("about.titleHighlight")}
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-foreground/65 mb-4 max-w-2xl leading-relaxed">
                  {t("about.subtitle")}
                </p>
                <p className="text-sm text-foreground/45 italic">{t("about.heroMicro")}</p>
              </motion.div>

              {/* Visual — orbital on desktop, mesh gradient on mobile */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5 relative h-[280px] md:h-[400px] lg:h-[460px] flex items-center justify-center"
              >
                {!isMobile ? (
                  <>
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.25),transparent_60%)] blur-3xl" />
                    <OrbitingCircles radius={140} duration={28} iconSize={48}>
                      <div className="size-full rounded-full bg-primary/15 backdrop-blur border border-primary/30 flex items-center justify-center">
                        <Brain size={22} weight="duotone" className="text-primary" />
                      </div>
                      <div className="size-full rounded-full bg-secondary/15 backdrop-blur border border-secondary/30 flex items-center justify-center">
                        <Heart size={22} weight="duotone" className="text-secondary" />
                      </div>
                      <div className="size-full rounded-full bg-primary/15 backdrop-blur border border-primary/30 flex items-center justify-center">
                        <ShieldCheck size={22} weight="duotone" className="text-primary" />
                      </div>
                    </OrbitingCircles>
                    <OrbitingCircles radius={80} duration={18} reverse iconSize={36}>
                      <div className="size-full rounded-full bg-foreground/5 backdrop-blur border border-foreground/10 flex items-center justify-center">
                        <Sparkle size={16} weight="fill" className="text-primary" />
                      </div>
                      <div className="size-full rounded-full bg-foreground/5 backdrop-blur border border-foreground/10 flex items-center justify-center">
                        <Compass size={16} weight="duotone" className="text-secondary" />
                      </div>
                    </OrbitingCircles>
                    <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_60px_hsl(var(--primary)/0.5)]">
                      <Sparkle size={36} weight="fill" className="text-primary-foreground" />
                    </div>
                  </>
                ) : (
                  <div className="relative w-full h-full rounded-3xl overflow-hidden border border-border/40">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.4),transparent_60%),radial-gradient(circle_at_70%_70%,hsl(var(--secondary)/0.35),transparent_60%)]" />
                    <div className="absolute inset-0 backdrop-blur-2xl" />
                    <div className="relative z-10 h-full flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.5)]">
                        <Sparkle size={28} weight="fill" className="text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Facts band */}
        <section className="py-12 md:py-16 border-y border-border/30 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent">
          <div className="container-custom">
            <ScrollReveal>
              <div className="text-center mb-10">
                <span className="text-xs text-secondary uppercase tracking-[0.25em] mb-3 block">
                  {t("about.factsBadge")}
                </span>
                <h2
                  className="text-2xl md:text-3xl font-light tracking-tight text-foreground"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {t("about.factsTitle")}
                </h2>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {facts.map((fact, i) => (
                <ScrollReveal key={i} delay={i * 0.08}>
                  <GlowCard glowColor="cyan" className="p-6 h-full">
                    <fact.icon size={24} weight="duotone" className="text-primary mb-3" />
                    <div
                      className="text-2xl md:text-3xl font-semibold gradient-text mb-2"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {fact.value}
                    </div>
                    <p className="text-xs md:text-sm text-foreground/55 leading-relaxed">
                      {fact.label}
                    </p>
                  </GlowCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Story timeline */}
        <section className="section-padding">
          <div className="container-custom max-w-4xl">
            <ScrollReveal>
              <div className="text-center mb-12 md:mb-16">
                <span className="text-xs text-primary uppercase tracking-[0.25em] mb-3 block">
                  {t("about.timelineBadge")}
                </span>
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {t("about.timelineTitle")}
                </h2>
              </div>
            </ScrollReveal>

            <div className="relative">
              {/* vertical line */}
              <div
                aria-hidden
                className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent md:-translate-x-1/2"
              />

              <div className="space-y-10 md:space-y-16">
                {milestones.map((m, i) => {
                  const isRight = i % 2 === 1;
                  const isHighlight = i === milestones.length - 1;
                  return (
                    <ScrollReveal key={i} delay={i * 0.05}>
                      <div
                        className={`relative grid gap-6 md:gap-12 items-center ${
                          isHighlight ? "md:grid-cols-1" : "md:grid-cols-2"
                        }`}
                      >
                        {/* dot */}
                        {!isHighlight && (
                          <div
                            aria-hidden
                            className="absolute left-4 md:left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary to-secondary z-10 w-3 h-3 shadow-[0_0_20px_hsl(var(--primary)/0.6)]"
                          />
                        )}
                        {/* content */}
                        <div
                          className={
                            isHighlight
                              ? "pl-12 md:pl-0 md:max-w-md md:mx-auto md:text-center w-full"
                              : `pl-12 md:pl-0 ${isRight ? "md:pl-12 md:order-2" : "md:pr-12 md:text-right md:order-1"}`
                          }
                        >
                          <div className={`relative ${isHighlight ? "rounded-3xl p-[1.5px] bg-gradient-to-br from-primary/70 via-secondary/50 to-primary/70 shadow-[0_0_50px_hsl(var(--primary)/0.25)]" : ""}`}>
                            <GlassCard className={`p-5 md:p-6 relative overflow-hidden ${isHighlight ? "bg-background/80 dark:bg-background/60" : ""}`}>
                              {isHighlight && (
                                <div aria-hidden className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 blur-3xl" />
                              )}
                              <div className={`relative flex items-center gap-2 mb-3 ${isHighlight ? "md:justify-center" : isRight ? "" : "md:justify-end"}`}>
                                <m.icon size={isHighlight ? 22 : 20} weight={isHighlight ? "fill" : "duotone"} className="text-primary" />
                                <span className={`text-xs uppercase tracking-widest ${isHighlight ? "text-primary font-semibold" : "text-foreground/50"}`}>
                                  {m.year}
                                </span>
                              </div>
                              <h3
                                className={`relative font-medium text-foreground mb-2 ${isHighlight ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"}`}
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                              >
                                {isHighlight ? <span className="gradient-text">{m.title}</span> : m.title}
                              </h3>
                              <p className="relative text-sm md:text-base text-foreground/60 leading-relaxed">
                                {m.desc}
                              </p>
                            </GlassCard>
                          </div>
                        </div>
                        {/* spacer */}
                        {!isHighlight && <div className={`hidden md:block ${isRight ? "md:order-1" : "md:order-2"}`} />}
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>

            {/* Pull quote */}
            <ScrollReveal>
              <blockquote
                className="mt-16 md:mt-24 max-w-3xl mx-auto text-center text-2xl md:text-3xl lg:text-4xl leading-snug text-foreground/80 italic"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                <span className="text-primary text-5xl leading-none align-top mr-1">"</span>
                {t("about.pullQuote")}
                <span className="text-primary text-5xl leading-none align-bottom ml-1">"</span>
              </blockquote>
            </ScrollReveal>
          </div>
        </section>

        {/* AI Section */}
        <section className="section-padding bg-gradient-to-b from-transparent via-secondary/[0.04] to-transparent border-y border-border/30">
          <div className="container-custom">
            <ScrollReveal>
              <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
                <span className="text-xs text-secondary uppercase tracking-[0.25em] mb-3 block">
                  {t("about.aiBadge")}
                </span>
                <h2
                  className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-4"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {t("about.aiTitle")}
                </h2>
                <p className="text-foreground/60">{t("about.aiSubtitle")}</p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-5 md:gap-6">
              {aiSteps.map((step, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <GlassCard hover className="h-full relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="icon-container">
                          <step.icon size={22} weight="duotone" className="text-primary" />
                        </div>
                        <span className="text-xs uppercase tracking-widest text-foreground/40">
                          0{i + 1}
                        </span>
                      </div>
                      <h3
                        className="text-lg md:text-xl font-medium text-foreground mb-2"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-sm text-foreground/55 leading-relaxed">{step.desc}</p>
                    </div>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Values bento */}
        <section className="section-padding">
          <div className="container-custom">
            <ScrollReveal>
              <div className="text-center mb-12 md:mb-16">
                <span className="text-xs text-primary uppercase tracking-[0.25em] mb-3 block">
                  {t("about.valuesBadge")}
                </span>
                <h2
                  className="text-3xl md:text-4xl font-light tracking-tight text-foreground"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {t("about.valuesTitle")}
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-5 md:gap-6 items-stretch">
              {/* Hero card */}
              <ScrollReveal>
                <GlassCard hover className="h-full relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 blur-3xl" />
                  <div className="relative">
                    <div className="icon-container mb-5">
                      {(() => {
                        const Icon = values[0].icon;
                        return <Icon size={28} weight="duotone" className="text-primary" />;
                      })()}
                    </div>
                    <h3
                      className="text-2xl md:text-3xl font-medium text-foreground mb-3"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {values[0].title}
                    </h3>
                    <p className="text-foreground/60 leading-relaxed">{values[0].description}</p>
                  </div>
                  <div className="relative mt-8 hidden md:flex items-end justify-end">
                    <Sparkle size={64} weight="duotone" className="text-primary/20" />
                  </div>
                </GlassCard>
              </ScrollReveal>

              {/* Side cards — stacked, fill available height */}
              <div className="flex flex-col gap-5 md:gap-6 h-full">
                {values.slice(1).map((v, i) => (
                  <ScrollReveal key={i} delay={(i + 1) * 0.1} className="flex-1">
                    <GlassCard hover className="h-full flex items-start gap-4">
                      <div className="icon-container shrink-0">
                        <v.icon size={24} weight="duotone" className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3
                          className="text-lg font-medium text-foreground mb-1.5"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {v.title}
                        </h3>
                        <p className="text-sm text-foreground/55 leading-relaxed">{v.description}</p>
                      </div>
                    </GlassCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Commitments */}
        <section className="section-padding bg-gradient-to-b from-transparent via-foreground/[0.02] to-transparent border-y border-border/30">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <ScrollReveal>
                <div>
                  <span className="text-xs text-primary uppercase tracking-[0.25em] mb-3 block">
                    {t("about.commitBadge")}
                  </span>
                  <h2
                    className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-8"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {t("about.commitTitle")}
                  </h2>
                  <ul className="space-y-4">
                    {commitments.map((c, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle
                          size={22}
                          weight="duotone"
                          className="text-primary mt-0.5 flex-shrink-0"
                        />
                        <span className="text-foreground/70 leading-relaxed">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="relative h-[320px] md:h-[400px] flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.18),transparent_65%)] blur-3xl" />
                  {!isMobile && (
                    <OrbitingCircles radius={130} duration={32} iconSize={42}>
                      <div className="size-full rounded-full bg-primary/10 backdrop-blur border border-primary/25 flex items-center justify-center">
                        <ShieldCheck size={20} weight="duotone" className="text-primary" />
                      </div>
                      <div className="size-full rounded-full bg-secondary/10 backdrop-blur border border-secondary/25 flex items-center justify-center">
                        <Lock size={20} weight="duotone" className="text-secondary" />
                      </div>
                      <div className="size-full rounded-full bg-primary/10 backdrop-blur border border-primary/25 flex items-center justify-center">
                        <CheckCircle size={20} weight="duotone" className="text-primary" />
                      </div>
                    </OrbitingCircles>
                  )}
                  <div className="relative z-10 w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/90 to-secondary/90 flex items-center justify-center shadow-[0_0_60px_hsl(var(--primary)/0.4)]">
                    <ShieldCheck size={48} weight="duotone" className="text-primary-foreground" />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-padding">
          <div className="container-custom">
            <ScrollReveal>
              <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-primary/10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.35),transparent_55%),radial-gradient(circle_at_80%_80%,hsl(var(--secondary)/0.3),transparent_55%)]" />
                <div className="absolute inset-0 backdrop-blur-xl" />
                <div className="relative z-10 px-6 py-14 md:px-16 md:py-20 text-center">
                  <h2
                    className="text-3xl md:text-5xl font-light tracking-tight text-foreground mb-5"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {t("about.ctaTitle")}
                  </h2>
                  <p className="text-lg text-foreground/65 mb-10 max-w-2xl mx-auto">
                    {t("about.ctaSubtitle")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Link
                      to="/auth"
                      className="btn-neumorphic text-primary-foreground inline-flex items-center gap-2"
                    >
                      {t("about.ctaCta")}
                      <ArrowRight size={18} weight="bold" />
                    </Link>
                    <a
                      href="/#pricing"
                      className="px-6 py-3 rounded-full border border-border/60 text-foreground/80 hover:text-foreground hover:border-primary/40 transition-colors text-sm font-medium"
                    >
                      {t("about.ctaSecondary")}
                    </a>
                  </div>
                  <p className="text-xs text-foreground/40 mt-6">{t("about.ctaMicro")}</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default About;
