export default function PublicationCard({ publication }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-card-hover">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{publication.title}</h3>
          <p className="mt-1 text-sm text-muted">{publication.summary}</p>
        </div>
        <time className="shrink-0 text-xs text-muted">
          {new Date(publication.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          })}
        </time>
      </div>
      {publication.tags && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {publication.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-tag-bg px-2.5 py-0.5 text-xs font-medium text-tag-text"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
