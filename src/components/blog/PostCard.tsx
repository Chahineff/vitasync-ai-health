import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTranslation } from "@/hooks/useTranslation";
import { ACCENT_CLASSES, type BlogPost } from "@/data/blog/posts";

interface Props {
  post: BlogPost;
}

export function PostCard({ post }: Props) {
  const { t } = useTranslation();
  const accent = ACCENT_CLASSES[post.accent];
  const excerpt = post.lead.replace(/[*`]/g, "").slice(0, 150).trim() + "…";

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-3xl"
      aria-label={`Lire l'article : ${post.title}`}
    >
      <GlassCard hover className="h-full p-0 overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
        {/* Cover gradient */}
        <motion.div
          layoutId={`blog-cover-${post.slug}`}
          aria-hidden="true"
          className={`h-44 bg-gradient-to-br ${accent.gradient} relative overflow-hidden`}
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
        >
          <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(circle_at_30%_30%,white_0%,transparent_60%)]" />
        </motion.div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`text-xs uppercase tracking-widest px-2.5 py-1 rounded-full ${accent.bg} ${accent.text}`}
              aria-label={`Catégorie : ${post.category}`}
            >
              {post.category}
            </span>
            <span
              className="inline-flex items-center gap-1 text-xs text-foreground/50"
              aria-label={`${post.readingMinutes} minutes de lecture`}
            >
              <Clock size={12} weight="light" />
              {post.readingMinutes} min
            </span>
          </div>
          <h2 className="text-xl font-light tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
          <p className="text-sm text-foreground/60 mb-4 line-clamp-3">{excerpt}</p>
          <span className="inline-flex items-center gap-2 text-sm text-primary group-hover:gap-3 transition-all">
            {t("blog.readArticle")}
            <ArrowRight size={16} weight="light" />
          </span>
        </div>
      </GlassCard>
    </Link>
  );
}