import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { ACCENT_CLASSES, type BlogPost } from "@/data/blog/posts";

export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-12 not-prose">
      <h2 className="text-xl font-light text-foreground tracking-tight mb-4">Articles liés</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {posts.map((p) => {
          const accent = ACCENT_CLASSES[p.accent];
          return (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="group rounded-2xl border border-border/40 bg-card/30 dark:bg-white/[0.02] p-5 hover:border-primary/30 transition-colors"
            >
              <span className={`text-xs uppercase tracking-widest ${accent.text}`}>{p.category}</span>
              <h3 className="text-base font-medium text-foreground mt-2 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {p.title}
              </h3>
              <span className="inline-flex items-center gap-1.5 text-sm text-primary">
                Lire <ArrowRight size={14} weight="light" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}