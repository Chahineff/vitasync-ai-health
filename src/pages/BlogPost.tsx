import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";
import { SplineBackground } from "@/components/sections/SplineBackground";
import { storefrontApiRequest } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "@phosphor-icons/react";
import DOMPurify from "dompurify";

const ARTICLE_QUERY = `
  query GetArticle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        id
        title
        contentHtml
        publishedAt
        image {
          url
          altText
        }
        authorV2 {
          name
        }
        blog {
          title
        }
      }
    }
  }
`;

interface ArticleDetail {
  id: string;
  title: string;
  contentHtml: string;
  publishedAt: string;
  image: { url: string; altText: string | null } | null;
  authorV2: { name: string } | null;
  blog: { title: string };
}

const BlogPost = () => {
  const { blogHandle, articleHandle } = useParams<{ blogHandle: string; articleHandle: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["shopify-article", blogHandle, articleHandle],
    queryFn: async () => {
      const data = await storefrontApiRequest(ARTICLE_QUERY, {
        blogHandle: blogHandle || "news",
        articleHandle: articleHandle || "",
      });
      return (data?.data?.blog?.articleByHandle || null) as ArticleDetail | null;
    },
    enabled: !!articleHandle,
  });

  return (
    <div className="min-h-screen bg-background">
      <SplineBackground />
      <FloatingThemeToggle />
      <Navbar />
      <main className="relative z-10 pt-32 pb-20">
        <div className="container-custom max-w-3xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-primary hover:gap-3 transition-all mb-8"
          >
            <ArrowLeft size={16} weight="light" />
            Retour au blog
          </Link>

          {isLoading && (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-foreground/50">Impossible de charger l'article.</p>
            </div>
          )}

          {article && (
            <article>
              {article.image && (
                <div className="rounded-2xl overflow-hidden mb-8">
                  <img
                    src={article.image.url}
                    alt={article.image.altText || article.title}
                    className="w-full h-auto max-h-[400px] object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-foreground/50 mb-4">
                <span>{article.blog.title}</span>
                {article.authorV2?.name && <span>par {article.authorV2.name}</span>}
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-8">
                {article.title}
              </h1>

              <div
                className="prose prose-lg dark:prose-invert max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(article.contentHtml),
                }}
              />
            </article>
          )}

          {!isLoading && !error && !article && (
            <div className="text-center py-20">
              <p className="text-foreground/50">Article introuvable.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
