import { Link } from "react-router-dom";
import { ArrowLeft, MagnifyingGlass, Compass } from "@phosphor-icons/react";
import { POSTS, ACCENT_CLASSES } from "@/data/blog/posts";
import { PostCard } from "@/components/blog/PostCard";

interface BlogNotFoundProps {
  attemptedSlug?: string;
}

export function BlogNotFound({ attemptedSlug }: BlogNotFoundProps) {
  // Pick up to 3 suggestions (newest first)
  const suggestions = [...POSTS]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 3);

  return (
    <div className="container-custom max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-14">
        <div
          aria-hidden="true"
          className="mx-auto mb-8 w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 backdrop-blur"
        >
          <Compass size={32} weight="light" className="text-primary" />
        </div>

        <p className="text-xs uppercase tracking-[0.25em] text-primary/80 mb-4">
          Erreur 404 — Article
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-5">
          Cet article reste <span className="gradient-text">introuvable</span>
        </h1>
        <p className="text-lg text-foreground/65 max-w-xl mx-auto leading-relaxed">
          L'article que vous cherchez n'existe pas, a été renommé, ou n'est plus disponible.
          Pas d'inquiétude — voici quelques pistes pour reprendre votre lecture.
        </p>

        {attemptedSlug && (
          <p className="mt-5 text-xs text-foreground/40 font-mono break-all">
            /blog/{attemptedSlug}
          </p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <ArrowLeft size={16} weight="light" />
            Retour au blog
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border/60 bg-card/30 text-foreground/80 hover:text-foreground hover:border-border transition-all backdrop-blur"
          >
            <MagnifyingGlass size={16} weight="light" />
            Aller à l'accueil
          </Link>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section aria-labelledby="blog-404-suggestions" className="mt-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2
                id="blog-404-suggestions"
                className="text-2xl md:text-3xl font-light tracking-tight text-foreground"
              >
                Articles à découvrir
              </h2>
              <p className="text-sm text-foreground/55 mt-1">
                Une sélection de nos lectures fondatrices.
              </p>
            </div>
            <Link
              to="/blog"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-primary hover:gap-2 transition-all"
            >
              Voir tout
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((p) => {
              const accent = ACCENT_CLASSES[p.accent];
              // Use PostCard if compatible, else inline card
              return <PostCard key={p.slug} post={p} compact />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}