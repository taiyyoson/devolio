import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Mermaid from "./Mermaid";
import ProjectThumbnail from "./ProjectThumbnail";

const LINK = "text-accent underline underline-offset-2 hover:text-accent-hover transition-colors";

const CONTEXT_LABELS = [
  ["company", "Where"],
  ["team", "Team"],
  ["role", "My role"],
  ["timeline", "When"],
];

const isTodo = (value) => typeof value === "string" && value.startsWith("TODO");

function Value({ children }) {
  return isTodo(children) ? (
    <span className="text-muted/60 italic">{children}</span>
  ) : (
    <>{children}</>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-10 max-w-prose">
      <h2 className="text-xs uppercase tracking-widest text-muted mb-3">{title}</h2>
      {children}
    </section>
  );
}

const markdownComponents = {
  pre({ children }) {
    const child = Array.isArray(children) ? children[0] : children;
    const className = child?.props?.className;

    if (typeof className === "string" && className.includes("language-mermaid")) {
      return <Mermaid chart={String(child.props.children).trim()} />;
    }

    return <pre>{children}</pre>;
  },
};

export default function ProjectCaseStudy({ project, caseStudy }) {
  const { context, problem, solution, impact } = project;

  return (
    <article className="mb-16">
      <Link
        href="/projects"
        className="text-xs font-mono text-muted hover:text-foreground transition-colors"
      >
        ← projects
      </Link>

      <header className="mt-6 mb-10 flex gap-5">
        <ProjectThumbnail project={project} className="w-20 h-20" sizes="80px" />
        <div className="min-w-0 max-w-prose">
          <h1 className="font-ramaraja text-2xl font-semibold tracking-wide mb-2">
            {project.title}
          </h1>
          <p className="text-foreground/80 leading-relaxed mb-3">{project.description}</p>
          <p className="text-xs text-muted font-mono mb-3">{project.tags.join(" · ")}</p>
          <div className="flex gap-4 text-sm">
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer" className={LINK}>
                GitHub ↗
              </a>
            )}
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener noreferrer" className={LINK}>
                Live ↗
              </a>
            )}
          </div>
        </div>
      </header>

      {context && (
        <dl className="mb-10 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4 max-w-3xl">
          {CONTEXT_LABELS.filter(([key]) => context[key]).map(([key, label]) => (
            <div key={key}>
              <dt className="text-xs uppercase tracking-widest text-muted mb-1">{label}</dt>
              <dd className="text-sm text-foreground/90">
                <Value>{context[key]}</Value>
              </dd>
            </div>
          ))}
        </dl>
      )}

      {problem && (
        <Section title="Problem">
          <p className="leading-relaxed text-foreground/90">
            <Value>{problem}</Value>
          </p>
        </Section>
      )}

      {solution && (
        <Section title="Solution">
          <p className="leading-relaxed text-foreground/90">
            <Value>{solution}</Value>
          </p>
        </Section>
      )}

      {project.longDescription && (
        <Section title="Overview">
          <p className="leading-relaxed text-foreground/90">{project.longDescription}</p>
        </Section>
      )}

      {impact?.length > 0 && (
        <Section title="Impact">
          <ul className="space-y-2">
            {impact.map((item, i) => (
              <li key={i} className="flex gap-3 leading-relaxed text-foreground/90">
                <span className="text-accent shrink-0" aria-hidden="true">
                  ▸
                </span>
                <span>
                  <Value>{item}</Value>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {caseStudy && (
        <div className="prose prose-neutral dark:prose-invert max-w-none font-serif prose-headings:font-ramaraja prose-a:text-accent">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {caseStudy}
          </ReactMarkdown>
        </div>
      )}
    </article>
  );
}
