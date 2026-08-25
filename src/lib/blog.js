import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "src", "content", "blog");

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug) {
  return typeof slug === "string" && slug.length <= 80 && SLUG_PATTERN.test(slug);
}

function toIsoDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/**
 * Returns null instead of throwing. These files are hand-written as often as
 * they are generated, and getPosts maps this over the whole directory — one
 * malformed post would otherwise fail `next build` and take the site down until
 * someone deleted the file by hand.
 */
function readPostFile(filename) {
  const slug = filename.replace(/\.md$/, "");

  try {
    const raw = fs.readFileSync(path.join(postsDir, filename), "utf-8");
    const { data, content } = matter(raw);

    return {
      slug,
      title: data.title || slug,
      date: toIsoDate(data.date),
      summary: data.summary || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      draft: data.draft === true,
      content,
    };
  } catch (err) {
    console.error(`[blog] skipping malformed post ${filename}:`, err.message);
    return null;
  }
}

function listPostFiles() {
  if (!fs.existsSync(postsDir)) return [];
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md") && isValidSlug(f.slice(0, -3)));
}

export function getPosts({ includeDrafts = false } = {}) {
  return listPostFiles()
    .map(readPostFile)
    .filter((p) => p !== null && (includeDrafts || !p.draft))
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
  return !post || post.draft ? null : post;
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
