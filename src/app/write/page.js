import { redirect } from "next/navigation";
import { isOwner } from "@/lib/api";
import { isGitHubConfigured } from "@/lib/github";
import Link from "next/link";
import PostEditor from "@/components/blog/PostEditor";

export const metadata = {
  title: "Write",
  robots: { index: false, follow: false },
};

export default async function WritePage() {
  if (!(await isOwner())) redirect("/");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="max-w-5xl mx-auto px-6 py-12">
      <Link
        href="/blog"
        className="text-xs font-mono text-muted hover:text-foreground transition-colors"
      >
        ← writing
      </Link>
      <h1 className="mt-6 font-ramaraja text-xl font-semibold tracking-wide mb-2">
        NEW POST
      </h1>
      <p className="text-xs text-muted font-mono mb-8">
        Commits a markdown file to the repo. Live after the next deploy.
      </p>

      {!isGitHubConfigured() && (
        <p
          role="alert"
          className="border border-red-900 bg-red-950 text-red-300 rounded px-3 py-2 mb-6 text-sm"
        >
          GITHUB_TOKEN and GITHUB_REPO are not set — publishing will fail.
        </p>
      )}

      <PostEditor />
      </main>
    </div>
  );
}
