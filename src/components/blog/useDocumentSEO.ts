import { useEffect } from "react";

interface SEO {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  ogType?: string;
  jsonLd?: Record<string, unknown>;
}

function setMeta(selector: string, attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

export function useDocumentSEO(seo: SEO) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = seo.title;
    setMeta(`meta[name="description"]`, "name", "description", seo.description);
    setMeta(`meta[property="og:title"]`, "property", "og:title", seo.title);
    setMeta(`meta[property="og:description"]`, "property", "og:description", seo.description);
    setMeta(`meta[property="og:image"]`, "property", "og:image", seo.ogImage);
    setMeta(`meta[property="og:type"]`, "property", "og:type", seo.ogType || "article");
    setMeta(`meta[property="og:locale"]`, "property", "og:locale", "fr_FR");
    setMeta(`meta[name="twitter:card"]`, "name", "twitter:card", "summary_large_image");
    setMeta(`meta[name="twitter:title"]`, "name", "twitter:title", seo.title);
    setMeta(`meta[name="twitter:description"]`, "name", "twitter:description", seo.description);
    setMeta(`meta[name="twitter:image"]`, "name", "twitter:image", seo.ogImage);

    let canonical = document.head.querySelector<HTMLLinkElement>(`link[rel="canonical"]`);
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = seo.canonical;

    let ldEl: HTMLScriptElement | null = null;
    if (seo.jsonLd) {
      ldEl = document.createElement("script");
      ldEl.type = "application/ld+json";
      ldEl.text = JSON.stringify(seo.jsonLd);
      ldEl.dataset.blogJsonld = "true";
      document.head.appendChild(ldEl);
    }

    return () => {
      document.title = prevTitle;
      if (ldEl && ldEl.parentNode) ldEl.parentNode.removeChild(ldEl);
    };
  }, [seo.title, seo.description, seo.canonical, seo.ogImage, seo.ogType, seo.jsonLd]);
}