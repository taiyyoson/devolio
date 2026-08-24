import projects from "@/data/projects.json";

export default function PortfolioProjects() {
  return (
    <section id="projects" className="max-w-prose mb-16">
      <h2 className="text-xs uppercase tracking-widest text-muted mb-6">Projects</h2>
      <ul className="space-y-6">
        {projects.map((project) => (
          <li key={project.slug}>
            <div className="flex items-baseline gap-2 mb-1">
              {project.github ? (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
                >
                  {project.title}
                </a>
              ) : (
                <span className="font-medium text-foreground">{project.title}</span>
              )}
              {project.featured && <span className="text-xs text-accent">*</span>}
            </div>
            <p className="text-foreground/80 leading-relaxed mb-1">{project.description}</p>
            <p className="text-xs text-muted font-mono">{project.tags.join(" · ")}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
