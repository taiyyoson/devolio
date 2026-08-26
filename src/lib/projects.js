import projects from "@/data/projects.json";
import { isValidSlug } from "@/lib/blog";

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
