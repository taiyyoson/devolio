import fs from "fs";
import path from "path";
import matter from "gray-matter";

const publicationsDir = path.join(process.cwd(), "src", "content", "publications");

export function getPublications() {
  const files = fs.readdirSync(publicationsDir).filter((f) => f.endsWith(".mdx"));

  const publications = files.map((filename) => {
    const raw = fs.readFileSync(path.join(publicationsDir, filename), "utf-8");
    const { data } = matter(raw);
    return {
      slug: filename.replace(/\.mdx$/, ""),
      title: data.title,
      date: data.date,
      summary: data.summary,
      tags: data.tags || [],
      published: data.published !== false,
    };
  });

  return publications
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPublicationBySlug(slug) {
  const filePath = path.join(publicationsDir, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    frontmatter: data,
    content,
  };
}
