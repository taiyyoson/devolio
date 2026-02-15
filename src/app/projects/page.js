import { getProjects } from "@/lib/data";
import { getPublications } from "@/lib/mdx";
import ProjectCard from "@/components/ProjectCard";
import PublicationCard from "@/components/PublicationCard";
import SectionHeading from "@/components/SectionHeading";

export const metadata = {
  title: "Projects & Publications",
  description: "A collection of projects and publications.",
};

export default function ProjectsPage() {
  const projects = getProjects();
  const publications = getPublications();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Projects Grid */}
      <SectionHeading
        title="Projects"
        subtitle="Things I've built — personal projects, open-source tools, and experiments."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>

      {/* Publications Section */}
      {publications.length > 0 && (
        <section className="mt-20">
          <SectionHeading
            title="Publications"
            subtitle="Writing about software, systems, and things I've learned."
          />
          <div className="space-y-3">
            {publications.map((pub) => (
              <PublicationCard key={pub.slug} publication={pub} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
