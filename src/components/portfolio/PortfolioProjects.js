import Link from "next/link";
import { getProjects } from "@/lib/projects";
import ProjectThumbnail from "./ProjectThumbnail";

export default function PortfolioProjects() {
  const projects = getProjects();

  return (
    <section id="projects" className="mb-16">
      <h2 className="text-xs uppercase tracking-widest text-muted mb-6">Projects</h2>
      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/projects/${project.slug}`}
              className="group flex gap-4 rounded-lg border border-transparent p-3 -mx-3 transition-colors hover:border-border hover:bg-card"
            >
              <ProjectThumbnail project={project} />
              <div className="min-w-0 max-w-prose">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-medium text-accent group-hover:text-accent-hover transition-colors">
                    {project.title}
                  </span>
                  {project.featured && <span className="text-xs text-accent">*</span>}
                </div>
                <p className="text-foreground/80 leading-relaxed mb-1">{project.description}</p>
                <p className="text-xs text-muted font-mono">{project.tags.join(" · ")}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
