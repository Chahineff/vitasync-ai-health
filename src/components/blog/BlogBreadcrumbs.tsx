import { Link } from "react-router-dom";
import { CaretRight, House } from "@phosphor-icons/react";
import { useEffect } from "react";

interface Crumb {
  label: string;
  href?: string; // last crumb has no href
}

interface Props {
  items: Crumb[];
  className?: string;
}

/**
 * Semantic breadcrumbs for blog pages.
 * Renders an ordered list with aria-label="Fil d'Ariane" and injects
 * BreadcrumbList JSON-LD for SEO. The last item is the current page (aria-current).
 */
export function BlogBreadcrumbs({ items, className = "" }: Props) {
  // Inject BreadcrumbList structured data
  useEffect(() => {
    if (typeof document === "undefined") return;
    const origin = window.location.origin;
    const ld = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.label,
        ...(it.href ? { item: `${origin}${it.href}` } : {}),
      })),
    };
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.dataset.breadcrumbsJsonld = "true";
    el.text = JSON.stringify(ld);
    document.head.appendChild(el);
    return () => {
      el.parentNode?.removeChild(el);
    };
  }, [items]);

  return (
    <nav aria-label="Fil d'Ariane" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-foreground/55">
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${it.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <CaretRight
                  size={12}
                  weight="light"
                  className="text-foreground/30 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              {isLast || !it.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="text-foreground/80 truncate max-w-[16rem] sm:max-w-xs"
                  title={it.label}
                >
                  {it.label}
                </span>
              ) : (
                <Link
                  to={it.href}
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                >
                  {i === 0 && <House size={12} weight="light" aria-hidden="true" />}
                  {it.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}