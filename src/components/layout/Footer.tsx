import { Link } from "react-router-dom";
import { InstagramLogo } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { Mail } from "lucide-react";
import { TextHoverEffect, FooterBackgroundGradient } from "@/components/ui/hover-footer";

const socialLinks: { icon: typeof InstagramLogo; href: string; label: string }[] = [];

export function Footer() {
  const { t } = useTranslation();

  const footerSections = [
    {
      title: t("footer.product"),
      links: [
        { label: t("footer.features"), href: "#features" },
        { label: t("footer.pricing"), href: "#pricing" },
        { label: t("footer.faq"), href: "#faq" },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { label: t("footer.about"), href: "/about" },
        { label: t("footer.blog"), href: "/blog" },
        { label: t("footer.contact"), href: "/contact" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: t("footer.privacy"), href: "/privacy" },
        { label: t("footer.terms"), href: "/terms" },
        { label: t("footer.legalNotice"), href: "/legal-notice" },
        { label: t("footer.cookies"), href: "/cookies" },
        { label: t("footer.cgv"), href: "/cgv" },
        { label: t("footer.disclaimer"), href: "/disclaimer" },
        { label: t("footer.shipping"), href: "/shipping" },
      ],
    },
  ];

  const contactInfo = [
    { icon: <Mail size={16} className="text-primary" />, text: "contact@vitasync.ai", href: "mailto:contact@vitasync.ai" },
  ];

  return (
    <footer className="relative z-20 bg-background/80 backdrop-blur-sm overflow-hidden">
      <div className="container-custom py-16 md:py-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img alt="VitaSync" className="w-10 h-10" src="/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png" />
              <span className="text-xl font-medium tracking-tight text-foreground">VitaSync</span>
            </Link>
            <p className="text-sm text-foreground/60 mb-6 max-w-xs">
              {t("footer.description")}
            </p>

            {/* Contact info */}
            <div className="space-y-3 mb-6">
              {contactInfo.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {item.icon}
                  {item.href ? (
                    <a href={item.href} className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-sm text-foreground/60">{item.text}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-background border border-border/50 dark:border-white/10 flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary/30 transition-all duration-200"
                >
                  <social.icon size={20} weight="light" />
                </a>
              ))}
            </div>
          </div>

          {/* Link sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-medium text-foreground mb-4">{section.title}</p>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link to={link.href} className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FDA Disclaimer */}
        <div className="mt-12 pt-6 border-t" style={{ borderColor: "#E2E8F0" }}>
          <p style={{ fontSize: 12, fontStyle: "italic", color: "#718096", lineHeight: 1.6 }}>
            * These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease. Consult your healthcare provider before starting any new supplement regimen.
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t" style={{ borderColor: "#E2E8F0" }}>
          <p className="text-center" style={{ fontSize: 12, color: "#718096" }}>
            © 2026 VitaSync. All rights reserved. Ships to the US only via Supliful.
          </p>
        </div>
      </div>

      {/* Text hover effect — smaller on mobile to prevent overflow */}
      <div className="relative z-10 h-20 md:h-32 lg:h-40 flex items-center justify-center mx-4 md:mx-0 overflow-hidden">
        <TextHoverEffect text="VITASYNC" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}
