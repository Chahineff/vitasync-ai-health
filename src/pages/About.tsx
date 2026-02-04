import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";
import { motion } from "framer-motion";
import { 
  Brain, 
  Heart, 
  ShieldCheck, 
  Users 
} from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";

const valueIcons = [Brain, Heart, ShieldCheck, Users];

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

  const team = [
    { name: "Dr. Sarah Chen", role: "CEO & Co-fondatrice", bio: "PhD en bioinformatique, ex-Google Health" },
    { name: "Marc Durand", role: "CTO & Co-fondateur", bio: "Expert IA, ex-DeepMind" },
    { name: "Dr. Émilie Petit", role: "Directrice Scientifique", bio: "Médecin nutritionniste, 15 ans d'expérience" },
    { name: "Antoine Moreau", role: "VP Produit", bio: "Ex-Alan, spécialiste HealthTech" },
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
                {t("about.badge")}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-6">
                {t("about.title")}{" "}
                <span className="gradient-text">{t("about.titleHighlight")}</span>
              </h1>
              <p className="text-lg text-foreground/60">
                {t("about.subtitle")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <GlassCard className="p-8">
                  <div className="grid grid-cols-2 gap-8 text-center">
                    <div>
                      <span className="text-4xl md:text-5xl font-light gradient-text">500K+</span>
                      <p className="text-sm text-foreground/50 mt-2">{t("about.stat1")}</p>
                    </div>
                    <div>
                      <span className="text-4xl md:text-5xl font-light gradient-text-reverse">95%</span>
                      <p className="text-sm text-foreground/50 mt-2">{t("about.stat2")}</p>
                    </div>
                    <div>
                      <span className="text-4xl md:text-5xl font-light gradient-text">2M+</span>
                      <p className="text-sm text-foreground/50 mt-2">{t("about.stat3")}</p>
                    </div>
                    <div>
                      <span className="text-4xl md:text-5xl font-light gradient-text-reverse">50+</span>
                      <p className="text-sm text-foreground/50 mt-2">{t("about.stat4")}</p>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-gradient-subtle">
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

        {/* Team */}
        <section className="section-padding">
          <div className="container-custom">
            <ScrollReveal>
              <div className="text-center mb-16">
                <span className="text-sm text-secondary uppercase tracking-widest mb-4 block">
                  {t("about.teamBadge")}
                </span>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
                  {t("about.teamTitle")}
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <ScrollReveal key={member.name} delay={index * 0.1}>
                  <GlassCard hover className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl text-primary-foreground font-light">
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <h3 className="text-lg font-light text-foreground">{member.name}</h3>
                    <p className="text-sm text-primary mb-2">{member.role}</p>
                    <p className="text-sm text-foreground/50">{member.bio}</p>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-gradient-subtle">
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
    </div>
  );
};

export default About;
