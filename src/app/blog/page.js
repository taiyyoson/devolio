import Link from "next/link";
import BlogShell from "@/components/blog/BlogShell";
import { getPosts, formatPostDate } from "@/lib/blog";

export const metadata = {
  title: "Blog",
  description: "Writing about systems, infrastructure, and whatever else.",
};

export default function BlogIndex() {
  const posts = getPosts();

  return (
    <BlogShell backHref="/" backLabel="portfolio">
      <h1 className="font-ramaraja text-xl font-semibold tracking-wide mb-8">
        WRITING
      </h1>

      {posts.length === 0 ? (
        <p className="text-muted">Nothing published yet.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
              >
                {post.title}
              </Link>
              <p className="text-xs text-muted font-mono mt-1">
                {formatPostDate(post.date)}
                {post.tags.length > 0 && ` · ${post.tags.join(" · ")}`}
              </p>
              {post.summary && (
                <p className="text-foreground/80 leading-relaxed mt-1">{post.summary}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </BlogShell>
  );
}
