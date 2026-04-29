import { useEffect } from "react";

interface SEO {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  ogType?: string;
  jsonLd?: Record<string, unknown>;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
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

function removeMeta(selector: string) {
  document.head.querySelectorAll(selector).forEach((el) => el.parentNode?.removeChild(el));
}

function absoluteUrl(maybeRelative: string): string {
  if (!maybeRelative) return maybeRelative;
  if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
  if (typeof window === "undefined") return maybeRelative;
  return `${window.location.origin}${maybeRelative.startsWith("/") ? "" : "/"}${maybeRelative}`;
}

export function useDocumentSEO(seo: SEO) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = seo.title;
    const absImage = absoluteUrl(seo.ogImage);
    setMeta(`meta[name="description"]`, "name", "description", seo.description);
    setMeta(`meta[property="og:title"]`, "property", "og:title", seo.title);
    setMeta(`meta[property="og:description"]`, "property", "og:description", seo.description);
    setMeta(`meta[property="og:image"]`, "property", "og:image", absImage);
    setMeta(`meta[property="og:image:alt"]`, "property", "og:image:alt", seo.title);
    setMeta(`meta[property="og:url"]`, "property", "og:url", seo.canonical);
    setMeta(`meta[property="og:site_name"]`, "property", "og:site_name", "VitaSync");
    setMeta(`meta[property="og:type"]`, "property", "og:type", seo.ogType || "article");
    setMeta(`meta[property="og:locale"]`, "property", "og:locale", "fr_FR");
    setMeta(`meta[name="twitter:card"]`, "name", "twitter:card", "summary_large_image");
    setMeta(`meta[name="twitter:title"]`, "name", "twitter:title", seo.title);
    setMeta(`meta[name="twitter:description"]`, "name", "twitter:description", seo.description);
    setMeta(`meta[name="twitter:image"]`, "name", "twitter:image", absImage);

    if (seo.keywords && seo.keywords.length > 0) {
      setMeta(`meta[name="keywords"]`, "name", "keywords", seo.keywords.join(", "));
    }

    // Article-specific OG tags
    removeMeta(`meta[property="article:tag"][data-blog-seo="true"]`);
    if ((seo.ogType || "article") === "article") {
      if (seo.publishedTime) {
        setMeta(`meta[property="article:published_time"]`, "property", "article:published_time", seo.publishedTime);
      }
      if (seo.modifiedTime) {
        setMeta(`meta[property="article:modified_time"]`, "property", "article:modified_time", seo.modifiedTime);
      }
      (seo.tags || []).forEach((tag) => {
        const m = document.createElement("meta");
        m.setAttribute("property", "article:tag");
        m.setAttribute("content", tag);
        m.dataset.blogSeo = "true";
        document.head.appendChild(m);
      });
    }

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
      removeMeta(`meta[property="article:tag"][data-blog-seo="true"]`);
    };
  }, [
    seo.title,
    seo.description,
    seo.canonical,
    seo.ogImage,
    seo.ogType,
    seo.jsonLd,
    seo.keywords,
    seo.publishedTime,
    seo.modifiedTime,
    seo.tags,
  ]);
}