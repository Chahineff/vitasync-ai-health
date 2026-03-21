import { Link } from "react-router-dom";
import { InstagramLogo, TwitterLogo, LinkedinLogo, YoutubeLogo } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { Mail, MapPin } from "lucide-react";
import { TextHoverEffect, FooterBackgroundGradient } from "@/components/ui/hover-footer";

const socialLinks = [
  { icon: InstagramLogo, href: "#", label: "Instagram" },
  { icon: TwitterLogo, href: "#", label: "Twitter" },
  { icon: LinkedinLogo, href: "#", label: "LinkedIn" },
  { icon: YoutubeLogo, href: "#", label: "YouTube" },
];

export function Footer() {
  const { t } = useTranslation();

  const footerSections = [
    {
      title: t("footer.product"),
      links: [
        { label: t("footer.features"), href: "#features" },
        { label: t("footer.pricing"), href: "#pricing" },
        { label: t("footer.testimonials"), href: "#testimonials" },
        { label: t("footer.faq"), href: "#faq" },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { label: t("footer.about"), href: "/about" },
        { label: t("footer.blog"), href: "/blog" },
        { label: t("footer.contact"), href: "/contact" },
        { label: t("footer.careers"), href: "#" },
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
    { icon: <MapPin size={16} className="text-primary" />, text: "Paris, France" },
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

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-foreground/55">
            © {new Date().getFullYear()} VitaSync. {t("footer.copyright")}
          </p>
          <p className="text-sm text-foreground/55">
            {t("footer.madeWith")}
          </p>
        </div>
      </div>

      {/* Text hover effect */}
      <div className="relative z-10 h-32 md:h-40 flex items-center justify-center">
        <TextHoverEffect text="VITASYNC" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}
