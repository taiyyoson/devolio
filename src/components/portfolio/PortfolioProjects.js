import projects from "@/data/projects.json";

export default function PortfolioProjects() {
  return (
    <section id="projects" className="mb-16">
      <h2 className="text-lg font-semibold text-foreground mb-6">projects</h2>
      <div className="divide-y divide-border">
        {projects.map((project) => (
          <div key={project.slug} className="py-4 first:pt-0">
            <div className="flex items-baseline gap-2 mb-1">
              {project.github ? (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:text-accent transition-colors"
                >
                  {project.title}
                </a>
              ) : (
                <span className="font-medium text-foreground">{project.title}</span>
              )}
              {project.featured && (
                <span className="text-xs text-accent">*</span>
              )}
            </div>
            <p className="text-sm text-muted mb-2">{project.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded bg-tag-bg text-tag-text"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
