import { getExperience } from "@/lib/data";
import SectionHeading from "@/components/SectionHeading";

export const metadata = {
  title: "Experience",
  description: "Work experience and education timeline.",
};

function formatDate(dateStr) {
  if (!dateStr) return "Present";
  const [year, month] = dateStr.split("-");
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export default function ExperiencePage() {
  const experience = getExperience();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading
        title="Experience"
        subtitle="Where I've worked and what I've studied."
      />

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-10">
          {experience.map((item, i) => (
            <div key={i} className="relative pl-8">
              {/* Timeline dot */}
              <div className="absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-2 border-accent bg-background" />

              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {item.role}
                </h3>
                <p className="text-sm text-muted">
                  {item.company} &middot; {item.location}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {formatDate(item.startDate)} &mdash; {formatDate(item.endDate)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-tag-bg px-2.5 py-0.5 text-xs font-medium text-tag-text"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
