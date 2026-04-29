import { useState } from "react";
import { XLogo, LinkedinLogo, FacebookLogo, LinkSimple, Check } from "@phosphor-icons/react";

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

export function ShareButtons({ url, title, className = "" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: XLogo,
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: LinkedinLogo,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FacebookLogo,
    },
  ];

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`} role="group" aria-label="Partager cet article">
      <span className="text-xs uppercase tracking-widest text-foreground/50 mr-1 hidden sm:inline">
        Partager
      </span>
      {links.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Partager sur ${name}`}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border/40 bg-card/50 dark:bg-white/[0.03] text-foreground/70 hover:text-primary hover:border-primary/40 transition-colors"
        >
          <Icon size={16} weight="regular" />
        </a>
      ))}
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copier le lien"
        className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border/40 bg-card/50 dark:bg-white/[0.03] text-foreground/70 hover:text-primary hover:border-primary/40 transition-colors"
      >
        {copied ? <Check size={16} weight="bold" /> : <LinkSimple size={16} weight="regular" />}
      </button>
    </div>
  );
}
