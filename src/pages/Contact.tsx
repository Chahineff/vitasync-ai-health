import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/PageTransition";
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
import { useTranslation } from "@/hooks/useTranslation";
import { SplineBackground } from "@/components/sections/SplineBackground";

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const contactInfo = [
    {
      icon: EnvelopeSimple,
      label: t("contact.email"),
      value: "contact@vitasync.com",
      href: "mailto:contact@vitasync.com",
    },
    {
      icon: Phone,
      label: t("contact.phone"),
      value: "+33 1 23 45 67 89",
      href: "tel:+33123456789",
    },
    {
      icon: MapPin,
      label: t("contact.address"),
      value: "42 Rue de l'Innovation, 75001 Paris",
      href: "#",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <PageTransition className="min-h-screen bg-background">
      <SplineBackground />
      <FloatingThemeToggle />
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
                {t("contact.badge")}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-6">
                {t("contact.title")}{" "}
                <span className="gradient-text">{t("contact.titleHighlight")}</span>
              </h1>
              <p className="text-lg text-foreground/60">
                {t("contact.subtitle")}
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
                    {t("contact.infoTitle")}
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
                    <h3 className="text-lg font-light text-foreground mb-4">{t("contact.hoursTitle")}</h3>
                    <div className="space-y-2 text-sm text-foreground/60">
                      <p>{t("contact.hours1")}</p>
                      <p>{t("contact.hours2")}</p>
                      <p>{t("contact.hours3")}</p>
                    </div>
                    <p className="mt-4 text-sm text-foreground/50">
                      <span className="text-secondary">Note :</span> {t("contact.hoursNote")}
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <ScrollReveal delay={0.2}>
                  <GlassCard className="p-8 md:p-12">
                    <h2 className="text-2xl font-light tracking-tight text-foreground mb-8">
                      {t("contact.formTitle")}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm text-foreground/70 mb-2">
                            {t("contact.nameLabel")}
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-6 py-4 rounded-xl bg-background border border-border/50 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder={t("contact.namePlaceholder")}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm text-foreground/70 mb-2">
                            {t("contact.emailLabel")}
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-6 py-4 rounded-xl bg-background border border-border/50 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder={t("contact.emailPlaceholder")}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm text-foreground/70 mb-2">
                          {t("contact.subjectLabel")}
                        </label>
                        <input
                          type="text"
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-6 py-4 rounded-xl bg-background border border-border/50 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder={t("contact.subjectPlaceholder")}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm text-foreground/70 mb-2">
                          {t("contact.messageLabel")}
                        </label>
                        <textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={5}
                          className="w-full px-6 py-4 rounded-xl bg-background border border-border/50 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                          placeholder={t("contact.messagePlaceholder")}
                          required
                        />
                      </div>

                      <button type="submit" className="btn-neumorphic text-primary-foreground w-full sm:w-auto">
                        <span className="flex items-center gap-2">
                          {t("contact.send")}
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
