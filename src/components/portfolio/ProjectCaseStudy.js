import Image from "next/image";
import Link from "next/link";
import Mermaid from "./Mermaid";
import ProjectThumbnail from "./ProjectThumbnail";

const LINK = "text-accent underline underline-offset-2 hover:text-accent-hover transition-colors";

const CONTEXT_LABELS = [
  ["company", "Where"],
  ["team", "Team"],
  ["role", "My role"],
  ["timeline", "When"],
];

const isTodo = (value) => typeof value === "string" && value.trimStart().startsWith("TODO");

const drop = (value) => (!value || isTodo(value) ? null : value);

// Authored as an array of lines so the mermaid source stays readable in JSON.
const toChart = (mermaid) => (Array.isArray(mermaid) ? mermaid.join("\n") : mermaid);

function Section({ title, wide = false, children }) {
  return (
    <section className={`mb-10 ${wide ? "" : "max-w-prose"}`}>
      <h2 className="text-xs uppercase tracking-widest text-muted mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default function ProjectCaseStudy({ project }) {
  const { context } = project;

  const problem = drop(project.problem);
  const solution = drop(project.solution);
  const overview = drop(project.longDescription);
  const impact = (project.impact ?? []).filter((item) => !isTodo(item));
  const diagrams = (project.diagrams ?? []).filter((d) => d?.mermaid || d?.image);
  const contextRows = CONTEXT_LABELS.filter(([key]) => drop(context?.[key]));

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

      {contextRows.length > 0 && (
        <dl className="mb-10 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4 max-w-3xl">
          {contextRows.map(([key, label]) => (
            <div key={key}>
              <dt className="text-xs uppercase tracking-widest text-muted mb-1">{label}</dt>
              <dd className="text-sm text-foreground/90">{context[key]}</dd>
            </div>
          ))}
        </dl>
      )}

      {problem && (
        <Section title="Problem">
          <p className="leading-relaxed text-foreground/90">{problem}</p>
        </Section>
      )}

      {solution && (
        <Section title="Solution">
          <p className="leading-relaxed text-foreground/90">{solution}</p>
        </Section>
      )}

      {diagrams.length > 0 && (
        <Section title="Architecture" wide>
          {diagrams.map((diagram, i) => (
            <figure key={i} className="mb-8 last:mb-0">
              {diagram.title && (
                <figcaption className="text-sm font-medium text-foreground/90 mb-2">
                  {diagram.title}
                </figcaption>
              )}
              {diagram.mermaid ? (
                <Mermaid chart={toChart(diagram.mermaid)} />
              ) : (
                // width/height only fix the intrinsic aspect ratio so the slot is
                // reserved before load; the rendered size is always the column width.
                <Image
                  src={diagram.image}
                  alt={diagram.title || diagram.caption || ""}
                  width={diagram.width ?? 1600}
                  height={diagram.height ?? 900}
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="w-full h-auto rounded-lg border border-border bg-card"
                />
              )}
              {diagram.caption && (
                <figcaption className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
                  {diagram.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </Section>
      )}

      {overview && (
        <Section title="Overview">
          <p className="leading-relaxed text-foreground/90">{overview}</p>
        </Section>
      )}

      {impact.length > 0 && (
        <Section title="Impact">
          <ul className="space-y-2">
            {impact.map((item, i) => (
              <li key={i} className="flex gap-3 leading-relaxed text-foreground/90">
                <span className="text-accent shrink-0" aria-hidden="true">
                  ▸
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}
