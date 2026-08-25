import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "src", "content", "blog");

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug) {
  return typeof slug === "string" && slug.length <= 80 && SLUG_PATTERN.test(slug);
}

function readPostFile(filename) {
  const raw = fs.readFileSync(path.join(postsDir, filename), "utf-8");
  const { data, content } = matter(raw);
  const slug = filename.replace(/\.md$/, "");

  return {
    slug,
    title: data.title || slug,
    date: data.date ? new Date(data.date).toISOString() : null,
    summary: data.summary || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    draft: data.draft === true,
    content,
  };
}

function listPostFiles() {
  if (!fs.existsSync(postsDir)) return [];
  return fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
}

export function getPosts({ includeDrafts = false } = {}) {
  return listPostFiles()
    .map(readPostFile)
    .filter((p) => includeDrafts || !p.draft)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

export function getPostSlugs() {
  return getPosts().map((p) => p.slug);
}

/**
 * Slug is validated before it reaches the filesystem — it arrives from a route
 * param, and path.join would happily resolve "../../.env".
 */
export function getPostBySlug(slug) {
  if (!isValidSlug(slug)) return null;

  const filePath = path.join(postsDir, `${slug}.md`);
  if (!filePath.startsWith(postsDir) || !fs.existsSync(filePath)) return null;

  const post = readPostFile(`${slug}.md`);
  return post.draft ? null : post;
}

export function formatPostDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
