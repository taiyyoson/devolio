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
      <h2 className="text-xs uppercase tracking-widest text-muted mb-6">Experience</h2>
      <ul className="space-y-6">
        {experience.map((exp, i) => (
          <li key={i}>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
              <span>
                <span className="font-medium text-foreground">{exp.role}</span>
                <span className="text-muted"> — </span>
                <span className="text-accent">{exp.company}</span>
              </span>
              <span className="text-xs text-muted font-mono whitespace-nowrap">
                {formatDate(exp.startDate)} – {formatDate(exp.endDate)}
              </span>
            </div>
            <p className="text-foreground/80 leading-relaxed mb-1">{exp.description}</p>
            <p className="text-xs text-muted font-mono">{exp.tags.join(" · ")}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
