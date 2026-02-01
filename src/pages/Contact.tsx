import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";
import { motion } from "framer-motion";
import { 
  EnvelopeSimple, 
  MapPin, 
  Phone, 
  PaperPlaneTilt 
} from "@phosphor-icons/react";
import { useState } from "react";

const contactInfo = [
  {
    icon: EnvelopeSimple,
    label: "Email",
    value: "contact@vitasync.com",
    href: "mailto:contact@vitasync.com",
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: "+33 1 23 45 67 89",
    href: "tel:+33123456789",
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "42 Rue de l'Innovation, 75001 Paris",
    href: "#",
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

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
                Contact
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-6">
                Parlons de{" "}
                <span className="gradient-text">votre santé</span>
              </h1>
              <p className="text-lg text-foreground/60">
                Une question, une suggestion ou besoin d'aide ? Notre équipe est là pour vous accompagner.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Contact Info */}
              <div className="lg:col-span-2">
                <ScrollReveal>
                  <h2 className="text-2xl font-light tracking-tight text-foreground mb-8">
                    Nos coordonnées
                  </h2>
                  <div className="space-y-6">
                    {contactInfo.map((info) => (
                      <a
                        key={info.label}
                        href={info.href}
                        className="flex items-start gap-4 group"
                      >
                        <div className="icon-container flex-shrink-0">
                          <info.icon size={24} weight="light" className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-foreground/50 mb-1">{info.label}</p>
                          <p className="text-foreground group-hover:text-primary transition-colors">
                            {info.value}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>

                  <div className="mt-12">
                    <h3 className="text-lg font-light text-foreground mb-4">Horaires d'ouverture</h3>
                    <div className="space-y-2 text-sm text-foreground/60">
                      <p>Lundi - Vendredi : 9h00 - 18h00</p>
                      <p>Samedi : 10h00 - 14h00</p>
                      <p>Dimanche : Fermé</p>
                    </div>
                    <p className="mt-4 text-sm text-foreground/50">
                      <span className="text-secondary">Note :</span> Notre IA est disponible 24h/24, 7j/7 pour répondre à vos questions santé.
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <ScrollReveal delay={0.2}>
                  <GlassCard className="p-8 md:p-12">
                    <h2 className="text-2xl font-light tracking-tight text-foreground mb-8">
                      Envoyez-nous un message
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm text-foreground/70 mb-2">
                            Nom complet
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-6 py-4 rounded-xl glass-card bg-background border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="Votre nom"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm text-foreground/70 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-6 py-4 rounded-xl glass-card bg-background border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="votre@email.com"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm text-foreground/70 mb-2">
                          Sujet
                        </label>
                        <input
                          type="text"
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-6 py-4 rounded-xl glass-card bg-background border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="Comment pouvons-nous vous aider ?"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm text-foreground/70 mb-2">
                          Message
                        </label>
                        <textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={5}
                          className="w-full px-6 py-4 rounded-xl glass-card bg-background border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                          placeholder="Décrivez votre demande..."
                          required
                        />
                      </div>

                      <button type="submit" className="btn-neumorphic text-primary-foreground w-full sm:w-auto">
                        <span className="flex items-center gap-2">
                          Envoyer le message
                          <PaperPlaneTilt size={18} weight="light" />
                        </span>
                      </button>
                    </form>
                  </GlassCard>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
