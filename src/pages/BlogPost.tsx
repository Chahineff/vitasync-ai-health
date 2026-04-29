import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SplineBackground } from "@/components/sections/SplineBackground";
import { ArrowLeft, FilePdf, Clock } from "@phosphor-icons/react";
import {
  ACCENT_CLASSES,
  DISCLAIMERS,
  getPostBySlug,
  getRelatedPosts,
  type ContentBlock,
} from "@/data/blog/posts";
import { Callout } from "@/components/blog/Callout";
import { ChartFigure } from "@/components/blog/ChartFigure";
import { StatRow } from "@/components/blog/StatRow";
import { SourceList } from "@/components/blog/SourceList";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { renderInline } from "@/components/blog/blogShared";
import { useDocumentSEO } from "@/components/blog/useDocumentSEO";

function renderBlock(block: ContentBlock, idx: number) {
  switch (block.kind) {
    case "h2":
      return (
        <h2 key={idx} className="text-2xl md:text-3xl font-light tracking-tight text-foreground mt-12 mb-4">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={idx} className="text-xl md:text-2xl font-light tracking-tight text-foreground mt-8 mb-3">
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p key={idx} className="text-base md:text-lg text-foreground/75 leading-relaxed my-5">
          {renderInline(block.text)}
        </p>
      );
    case "ul":
      return (
        <ul key={idx} className="list-disc pl-6 space-y-2 my-5 text-foreground/75">
          {block.items.map((it, i) => (
            <li key={i} className="leading-relaxed">{renderInline(it)}</li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote
          key={idx}
          className="not-prose my-10 border-l-4 border-primary pl-5 py-2 text-xl md:text-2xl italic text-foreground/85 font-light leading-snug"
        >
          « {block.text} »
        </blockquote>
      );
    case "callout":
      return <Callout key={idx} variant={block.variant} title={block.title} body={block.body} />;
    case "chart":
      return <ChartFigure key={idx} block={block} />;
    case "table":
      return (
        <div key={idx} className="not-prose my-8 overflow-x-auto rounded-2xl border border-border/40 bg-card/30 dark:bg-white/[0.015]">
          <table className="w-full text-sm">
            {block.caption && (
              <caption className="caption-bottom text-xs italic text-foreground/50 py-3 px-4">{block.caption}</caption>
            )}
            <thead>
              <tr className="bg-card/50 dark:bg-white/[0.03]">
                {block.headers.map((h, i) => (
                  <th key={i} scope="col" className="text-left font-medium text-foreground px-4 py-3 border-b border-border/40">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/20 last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-foreground/75">{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

const BlogPost = () => {
  const params = useParams<{ slug?: string; articleHandle?: string }>();
  const slug = params.slug || params.articleHandle;

  // Legacy /blog/:blogHandle/:articleHandle → /blog/:slug
  if (!params.slug && params.articleHandle) {
    return <Navigate to={`/blog/${params.articleHandle}`} replace />;
  }

  const post = slug ? getPostBySlug(slug) : undefined;

  useEffect(() => {
    if (post) window.scrollTo({ top: 0, behavior: "auto" });
  }, [post]);

  const canonical =
    typeof window !== "undefined" && post
      ? `${window.location.origin}/blog/${post.slug}`
      : "";

  useDocumentSEO({
    title: post ? `${post.title} — Blog VitaSync` : "Article introuvable — Blog VitaSync",
    description: post?.metaDescription || "Article VitaSync.",
    canonical: canonical || "https://vitasyncai.lovable.app/blog",
    ogImage: post?.ogImage || "/placeholder.svg",
    ogType: "article",
    jsonLd: post
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.metaDescription,
          datePublished: post.publishedAt,
          dateModified: post.publishedAt,
          inLanguage: "fr-FR",
          keywords: post.keywords.join(", "),
          image: typeof window !== "undefined" ? `${window.location.origin}${post.ogImage}` : post.ogImage,
          mainEntityOfPage: canonical,
          author: { "@type": "Organization", name: "VitaSync" },
          publisher: {
            "@type": "Organization",
            name: "VitaSync",
            logo: { "@type": "ImageObject", url: "/favicon.svg" },
          },
        }
      : undefined,
  });

  if (!post) {
    return (
      <PageTransition className="min-h-screen bg-background">
        <SplineBackground />
        <FloatingThemeToggle />
        <Navbar />
        <main id="main" className="relative z-10 pt-32 pb-20">
          <div className="container-custom max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-light text-foreground mb-4">Article introuvable</h1>
            <p className="text-foreground/60 mb-8">Cet article n'existe pas ou a été déplacé.</p>
            <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all">
              <ArrowLeft size={16} weight="light" /> Retour au blog
            </Link>
          </div>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  const accent = ACCENT_CLASSES[post.accent];
  const related = getRelatedPosts(post);
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <PageTransition className="min-h-screen bg-background">
      <SplineBackground />
      <FloatingThemeToggle />
      <ScrollToTopButton />
      <Navbar />
      <main id="main" className="relative z-10 pt-32 pb-20">
        <div className="container-custom max-w-3xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-primary hover:gap-3 transition-all mb-8"
          >
            <ArrowLeft size={16} weight="light" />
            Retour au blog
          </Link>

          <article className="rounded-2xl border border-border/40 bg-white/50 dark:bg-transparent dark:border-white/[0.06] p-6 md:p-10 backdrop-blur">
            {/* Hero gradient cover */}
            <div
              aria-hidden="true"
              className={`h-40 md:h-56 rounded-xl bg-gradient-to-br ${accent.gradient} relative overflow-hidden mb-8`}
            >
              <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(circle_at_30%_30%,white_0%,transparent_60%)]" />
            </div>

            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60 mb-4">
                <span className={`text-xs uppercase tracking-widest px-2.5 py-1 rounded-full ${accent.bg} ${accent.text}`}>
                  {post.category}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} weight="light" /> {post.readingMinutes} min
                </span>
                <span>{formattedDate}</span>
                <a
                  href={post.pdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1.5 text-primary hover:underline"
                  aria-label="Télécharger la version magazine PDF"
                >
                  <FilePdf size={16} weight="light" /> PDF
                </a>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-4">
                {post.title}
              </h1>
              <p className="text-lg md:text-xl text-foreground/60 font-light leading-snug">{post.subtitle}</p>
            </header>

            {/* Lead */}
            <p className="text-lg md:text-xl text-foreground/80 italic leading-relaxed border-l-4 border-primary/40 pl-5 my-8">
              {renderInline(post.lead)}
            </p>

            {/* Stats */}
            <StatRow items={post.stats} />

            {/* Body */}
            <div>{post.body.map(renderBlock)}</div>

            {/* CTA */}
            <aside className={`not-prose my-12 rounded-2xl p-6 md:p-8 bg-gradient-to-br ${accent.gradient} border border-border/30`}>
              <h2 className="text-xl md:text-2xl font-light tracking-tight text-foreground mb-3">{post.cta.title}</h2>
              <p className="text-foreground/80 leading-relaxed mb-5">{post.cta.body}</p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Activer mon Coach IA
              </Link>
            </aside>

            {/* Bullets */}
            <section className="not-prose my-10">
              <h2 className="text-xl font-light text-foreground tracking-tight mb-4">Points clés à retenir</h2>
              <ul className="space-y-2">
                {post.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3 text-foreground/80 leading-relaxed">
                    <span className={`mt-2 inline-block w-1.5 h-1.5 rounded-full ${accent.bg.replace("/10", "")} flex-shrink-0`} />
                    <span>{renderInline(b)}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Sources */}
            <section className="not-prose my-10">
              <h2 className="text-xl font-light text-foreground tracking-tight mb-4">Sources</h2>
              <SourceList sources={post.sources} />
            </section>

            {/* Disclaimers */}
            <section className="not-prose mt-10 pt-6 border-t border-border/30 text-xs text-foreground/50 space-y-3 leading-relaxed">
              <p>{DISCLAIMERS.fdaFr}</p>
              <p lang="en">* {DISCLAIMERS.fdaEn}</p>
              <p>{DISCLAIMERS.medical}</p>
              <p>{DISCLAIMERS.ai}</p>
            </section>
          </article>

          <RelatedPosts posts={related} />
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default BlogPost;
