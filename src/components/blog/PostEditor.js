"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Truncate before trimming — slicing an already-trimmed string can reintroduce
// the trailing hyphen the server rejects.
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 80)
    .replace(/^-+|-+$/g, "");
}

const FIELD = "w-full bg-transparent border border-border rounded px-3 py-2 outline-none focus:border-accent";

export default function PostEditor() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [draft, setDraft] = useState(false);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const effectiveSlug = slugTouched ? slug : slugify(title);

  async function publish() {
    setBusy(true);
    setStatus(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: effectiveSlug,
          title,
          summary,
          content,
          draft,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus({ ok: false, message: data.error || `Failed (${res.status})` });
      } else {
        setStatus({
          ok: true,
          message: `Committed ${data.path}. It goes live on the next deploy.`,
        });
      }
    } catch {
      setStatus({ ok: false, message: "Network error" });
    } finally {
      setBusy(false);
    }
  }

  const slugOk = SLUG_PATTERN.test(effectiveSlug) && effectiveSlug.length <= 80;
  const canPublish = title.trim() && content.trim() && slugOk && !busy;

  return (
    <div className="space-y-4 font-sans text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-muted">Title</span>
          <input className={FIELD} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-muted">Slug</span>
          <input
            className={FIELD}
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            aria-invalid={effectiveSlug !== "" && !slugOk}
          />
          {effectiveSlug !== "" && !slugOk && (
            <span className="block text-red-400">
              Lowercase letters, numbers, and single hyphens only.
            </span>
          )}
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-muted">Summary</span>
        <input className={FIELD} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-muted">Tags (comma separated)</span>
          <input className={FIELD} value={tags} onChange={(e) => setTags(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 pt-6">
          <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} />
          <span className="text-muted">Save as draft</span>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-1">
          <span className="text-muted">Markdown</span>
          <textarea
            className={`${FIELD} h-96 font-mono resize-y`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
        <div className="space-y-1">
          <span className="text-muted">Preview</span>
          <div className="border border-border rounded px-4 py-3 h-96 overflow-y-auto prose prose-neutral dark:prose-invert max-w-none font-serif prose-headings:font-ramaraja prose-a:text-accent">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={publish}
          disabled={!canPublish}
          className="border border-accent text-accent rounded px-4 py-1.5 hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {busy ? "Committing…" : "Commit post"}
        </button>
        {status && (
          <span role="status" className={status.ok ? "text-accent" : "text-red-400"}>
            {status.message}
          </span>
        )}
      </div>
    </div>
  );
}
