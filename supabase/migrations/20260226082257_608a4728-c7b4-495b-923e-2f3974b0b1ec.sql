
-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  read_time TEXT DEFAULT '5 min',
  published BOOLEAN NOT NULL DEFAULT false,
  author_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Published posts are publicly readable"
ON public.blog_posts FOR SELECT
USING (published = true);

-- Authors can manage their own posts
CREATE POLICY "Authors can insert their own posts"
ON public.blog_posts FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts"
ON public.blog_posts FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own posts"
ON public.blog_posts FOR DELETE
USING (auth.uid() = author_id);

-- Authors can view their own unpublished drafts
CREATE POLICY "Authors can view their own drafts"
ON public.blog_posts FOR SELECT
USING (auth.uid() = author_id);

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
