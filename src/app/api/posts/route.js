import matter from "gray-matter";
import { authenticate, dbError, fail, pick, readJson } from "@/lib/api";
import { commitFile, GitHubApiError, GitHubConfigError } from "@/lib/github";

const POSTS_DIR = "src/content/blog";

// A commit here triggers a rebuild, so this is deliberately far below the
// generic per-user cap.
const PUBLISH_LIMIT = { max: 10, windowMs: 60_000 };

export async function POST(request) {
  const { user, error } = await authenticate(PUBLISH_LIMIT);
  if (error) return error;

  const body = await readJson(request);
  if (!body) return fail(400, "Invalid JSON body");

  const { value, error: invalid } = pick(body, {
    required: ["slug", "title", "content"],
    optional: ["summary", "tags", "draft", "date", "overwrite"],
  });
  if (invalid) return invalid;

  const { slug, title, content, summary, tags, draft, date, overwrite } = value;

  // matter.stringify quotes and escapes every scalar itself. Hand-building the
  // frontmatter meant one unescaped field could close it early and take over the
  // body.
  const markdown = matter.stringify(`${content.trimEnd()}\n`, {
    title,
    date: date ?? new Date().toISOString().slice(0, 10),
    summary: summary ?? "",
    tags: tags ?? [],
    draft: draft === true,
  });

  const filePath = `${POSTS_DIR}/${slug}.md`;

  try {
    const result = await commitFile({
      path: filePath,
      content: markdown,
      message: `blog: ${slug}`,
      overwrite: overwrite === true,
    });

    return Response.json({ slug, path: filePath, ...result });
  } catch (err) {
    if (err instanceof GitHubConfigError) {
      console.error("[api] posts.POST config:", err.message);
      return fail(503, "Publishing is not configured");
    }
    if (err instanceof GitHubApiError) {
      console.error(`[api] posts.POST github (user ${user.id}):`, err.message);
      if (err.status === 409) return fail(409, "A post with that slug already exists");
      return fail(502, "Could not publish to the repository");
    }
    return dbError("posts.POST", err);
  }
}
