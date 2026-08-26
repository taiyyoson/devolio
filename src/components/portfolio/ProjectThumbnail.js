import Image from "next/image";

function initials(title) {
  const words = title.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : title.slice(0, 2);
  return letters.toLowerCase();
}

export default function ProjectThumbnail({ project, className = "w-16 h-16", sizes = "64px" }) {
  const shared = `${className} shrink-0 rounded-lg border border-border overflow-hidden`;

  if (project.thumbnail) {
    return (
      <div className={`${shared} relative bg-card`}>
        <Image
          src={project.thumbnail}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${shared} bg-tag-bg text-tag-text flex items-center justify-center font-mono text-sm tracking-tight`}
    >
      {initials(project.title)}
    </div>
  );
}
