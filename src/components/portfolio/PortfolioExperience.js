import experience from "@/data/experience.json";

function formatDate(dateStr) {
  if (!dateStr) return "Present";
  const [year, month] = dateStr.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

export default function PortfolioExperience() {
  return (
    <section id="experience" className="mb-16">
      <h2 className="text-lg font-semibold text-foreground mb-6">experience</h2>
      <div className="divide-y divide-border">
        {experience.map((exp, i) => (
          <div key={i} className="py-4 first:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
              <span className="font-medium text-foreground">{exp.role}</span>
              <span className="text-xs text-muted whitespace-nowrap">
                {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
              </span>
            </div>
            <p className="text-sm text-accent mb-1">{exp.company}</p>
            <p className="text-sm text-muted mb-2">{exp.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {exp.tags.map((tag) => (
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
