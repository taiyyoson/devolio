import Image from "next/image";
import Link from "next/link";

export default function ProjectCard({ project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-xl border border-border bg-card p-5 transition-colors hover:bg-card-hover"
    >
      {project.image && (
        <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-border">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
      <p className="mt-1 text-sm text-muted line-clamp-2">{project.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-tag-bg px-2.5 py-0.5 text-xs font-medium text-tag-text"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
