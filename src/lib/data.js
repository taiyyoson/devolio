import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "src", "data");

export function getProjects() {
  const raw = fs.readFileSync(path.join(dataDir, "projects.json"), "utf-8");
  return JSON.parse(raw);
}

export function getProjectBySlug(slug) {
  const projects = getProjects();
  return projects.find((p) => p.slug === slug) || null;
}

export function getFeaturedProjects() {
  return getProjects().filter((p) => p.featured);
}

export function getExperience() {
  const raw = fs.readFileSync(path.join(dataDir, "experience.json"), "utf-8");
  return JSON.parse(raw);
}
