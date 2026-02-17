import Link from "next/link";
import { getFeaturedProjects } from "@/lib/data";
import ProjectCard from "@/components/ProjectCard";

export default function Home() {
  const featured = getFeaturedProjects();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      {/* Hero */}
      <section className="mb-20">
        <p className="mb-3 text-sm font-medium text-accent">Hi, I&apos;m</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Taiyo Williamson
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          CS student at the University of San Francisco pursuing a B.S./M.S.
          (4+1). Interested in systems, cloud infrastructure, and AI —
          from building Go-based tooling at Fastly to RAG-powered health
          coaching chatbots. Currently a research assistant and founding
          Hack4Impact USF.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/projects"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            View Projects
          </Link>
          <Link
            href="/experience"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
          >
            Experience
          </Link>
        </div>
      </section>

      {/* Featured Projects */}
      {featured.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Featured Projects</h2>
            <Link href="/projects" className="text-sm text-accent hover:text-accent-hover">
              View all &rarr;
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
