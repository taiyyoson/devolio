import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProjects, getProjectBySlug } from "@/lib/data";

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectDetail({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/projects"
        className="mb-8 inline-flex items-center text-sm text-muted transition-colors hover:text-foreground"
      >
        &larr; Back to projects
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
        {project.title}
      </h1>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-tag-bg px-2.5 py-0.5 text-xs font-medium text-tag-text"
          >
            {tag}
          </span>
        ))}
      </div>

      {project.image && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-xl border border-border">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <p className="mt-8 text-base leading-relaxed text-muted">
        {project.longDescription}
      </p>

      <div className="mt-8 flex gap-3">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
          >
            GitHub
          </a>
        )}
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Live Demo
          </a>
        )}
      </div>
    </div>
  );
}
