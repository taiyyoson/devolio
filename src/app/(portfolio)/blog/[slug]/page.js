import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug, getPostSlugs, formatPostDate } from "@/lib/blog";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date || undefined,
    },
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mb-16">
      <Link
        href="/blog"
        className="text-xs font-mono text-muted hover:text-foreground transition-colors"
      >
        ← writing
      </Link>

      <header className="mt-6 mb-8">
        <h1 className="font-ramaraja text-2xl font-semibold tracking-wide mb-2">
          {post.title}
        </h1>
        <p className="text-xs text-muted font-mono">
          {formatPostDate(post.date)}
          {post.tags.length > 0 && ` · ${post.tags.join(" · ")}`}
        </p>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none font-serif prose-headings:font-ramaraja prose-a:text-accent">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
