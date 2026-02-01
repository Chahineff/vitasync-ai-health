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

const values = [
  {
    icon: Brain,
    title: "Innovation",
    description: "Nous repoussons les limites de l'IA pour créer des solutions de santé révolutionnaires.",
  },
  {
    icon: Heart,
    title: "Bienveillance",
    description: "Chaque recommandation est pensée pour votre bien-être à long terme.",
  },
  {
    icon: ShieldCheck,
    title: "Transparence",
    description: "Vos données vous appartiennent. Nous garantissons une confidentialité totale.",
  },
  {
    icon: Users,
    title: "Accessibilité",
    description: "La santé personnalisée ne doit pas être un luxe réservé à quelques-uns.",
  },
];

const team = [
  { name: "Dr. Sarah Chen", role: "CEO & Co-fondatrice", bio: "PhD en bioinformatique, ex-Google Health" },
  { name: "Marc Durand", role: "CTO & Co-fondateur", bio: "Expert IA, ex-DeepMind" },
  { name: "Dr. Émilie Petit", role: "Directrice Scientifique", bio: "Médecin nutritionniste, 15 ans d'expérience" },
  { name: "Antoine Moreau", role: "VP Produit", bio: "Ex-Alan, spécialiste HealthTech" },
];

const About = () => {
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
                Notre mission
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-6">
                La santé propulsée par{" "}
                <span className="gradient-text">l'Intelligence Artificielle</span>
              </h1>
              <p className="text-lg text-foreground/60">
                Chez VitaSync, nous croyons que chaque individu mérite un accompagnement santé personnalisé, intelligent et accessible.
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
                    Notre histoire
                  </span>
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-6">
                    Née d'une frustration, construite avec passion
                  </h2>
                  <div className="space-y-4 text-foreground/60">
                    <p>
                      VitaSync est née en 2023 d'un constat simple : malgré les avancées scientifiques, l'accès à des conseils nutritionnels vraiment personnalisés reste réservé à une élite.
                    </p>
                    <p>
                      Nos fondateurs, issus du monde médical et de l'intelligence artificielle, ont uni leurs expertises pour créer un coach santé capable de comprendre les besoins uniques de chaque individu.
                    </p>
                    <p>
                      Aujourd'hui, notre IA a analysé plus de 500 000 profils et continue d'apprendre pour offrir des recommandations toujours plus précises.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <GlassCard className="p-8">
                  <div className="grid grid-cols-2 gap-8 text-center">
                    <div>
                      <span className="text-4xl md:text-5xl font-light gradient-text">500K+</span>
                      <p className="text-sm text-foreground/50 mt-2">Profils analysés</p>
                    </div>
                    <div>
                      <span className="text-4xl md:text-5xl font-light gradient-text-reverse">95%</span>
                      <p className="text-sm text-foreground/50 mt-2">Satisfaction client</p>
                    </div>
                    <div>
                      <span className="text-4xl md:text-5xl font-light gradient-text">2M+</span>
                      <p className="text-sm text-foreground/50 mt-2">Recommandations IA</p>
                    </div>
                    <div>
                      <span className="text-4xl md:text-5xl font-light gradient-text-reverse">50+</span>
                      <p className="text-sm text-foreground/50 mt-2">Experts santé</p>
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
                  Nos valeurs
                </span>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
                  Ce qui nous guide au quotidien
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
                  L'équipe
                </span>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
                  Les experts derrière VitaSync
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
                  Prêt à transformer votre santé ?
                </h2>
                <p className="text-lg text-foreground/60 mb-8">
                  Rejoignez les milliers de personnes qui ont déjà fait confiance à VitaSync.
                </p>
                <a href="/#pricing" className="btn-neumorphic text-primary-foreground">
                  Commencer gratuitement
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
