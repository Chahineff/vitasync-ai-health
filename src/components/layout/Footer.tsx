import { Link } from "react-router-dom";
import { 
  InstagramLogo, 
  TwitterLogo, 
  LinkedinLogo, 
  YoutubeLogo 
} from "@phosphor-icons/react";

const footerLinks = {
  product: [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Tarifs", href: "#pricing" },
    { label: "Témoignages", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
  ],
  company: [
    { label: "À propos", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Carrières", href: "#" },
  ],
  legal: [
    { label: "Politique de confidentialité", href: "#" },
    { label: "Conditions d'utilisation", href: "#" },
    { label: "Mentions légales", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

const socialLinks = [
  { icon: InstagramLogo, href: "#", label: "Instagram" },
  { icon: TwitterLogo, href: "#", label: "Twitter" },
  { icon: LinkedinLogo, href: "#", label: "LinkedIn" },
  { icon: YoutubeLogo, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border/50">
      <div className="container-custom py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-lg">V</span>
              </div>
              <span className="text-xl font-medium tracking-tight text-foreground">VitaSync</span>
            </Link>
            <p className="text-sm text-foreground/50 mb-6 max-w-xs">
              Votre santé, propulsée par l'intelligence artificielle. Découvrez une approche personnalisée de la nutrition.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center text-foreground/50 hover:text-primary hover:border-primary/30 transition-all duration-200"
                >
                  <social.icon size={20} weight="light" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Produit</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Entreprise</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link
                      to={link.href}
                      className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Légal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-foreground/40">
            © {new Date().getFullYear()} VitaSync. Tous droits réservés.
          </p>
          <p className="text-sm text-foreground/40">
            Fait avec ❤️ pour votre santé
          </p>
        </div>
      </div>
    </footer>
  );
}
