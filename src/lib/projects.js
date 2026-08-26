import fs from "fs";
import path from "path";
import matter from "gray-matter";
import projects from "@/data/projects.json";
import { isValidSlug } from "@/lib/blog";

const caseStudyDir = path.join(process.cwd(), "src", "content", "projects");

export function getProjects() {
  return projects;
}

export function getProjectSlugs() {
  return projects.map((p) => p.slug);
}

export function getProjectBySlug(slug) {
  if (!isValidSlug(slug)) return null;
  return projects.find((p) => p.slug === slug) ?? null;
}

/**
 * Returns null rather than throwing. These files are hand-written, and the
 * detail page maps this over every project at build time — one malformed case
 * study would otherwise fail `next build` and take the whole site down.
 *
 * Slug is validated before it reaches the filesystem: it arrives from a route
 * param, and path.join would happily resolve "../../.env".
 */
export function getCaseStudy(slug) {
  if (!isValidSlug(slug)) return null;

  const filePath = path.join(caseStudyDir, `${slug}.md`);
  if (!filePath.startsWith(caseStudyDir) || !fs.existsSync(filePath)) return null;

  try {
    const { content } = matter(fs.readFileSync(filePath, "utf-8"));
    return content.trim() ? content : null;
  } catch (err) {
    console.error(`[projects] skipping malformed case study ${slug}.md:`, err.message);
    return null;
  }
}
