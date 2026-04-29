export default function PortfolioHero() {
  return (
    <section id="about" className="pt-4 pb-16">
      <h1 className="text-xl font-semibold tracking-wide text-foreground mb-8">
        TAIYO WILLIAMSON
      </h1>
      <div className="space-y-5 text-foreground/90 leading-relaxed">
        <p>
          I&apos;m a CS student at the{" "}
          <a
            href="https://www.usfca.edu/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2 hover:text-accent-hover"
          >
            University of San Francisco
          </a>
          , pursuing a B.S./M.S. (4+1) in Computer Science.
        </p>
        <p>
          Today I spend most of my time on{" "}
          <a
            href="https://github.com/taiyyoson/nala"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2 hover:text-accent-hover"
          >
            Nala
          </a>
          , a RAG-powered health coaching chatbot with a coauthored CHI 2026 submission, and on cloud
          and systems work — most recently as an embedded software intern at{" "}
          <a
            href="https://www.fastly.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2 hover:text-accent-hover"
          >
            Fastly
          </a>
          , where I built Go-based cache testing tools on Kubernetes.
        </p>
        <p>
          I&apos;m most interested in systems, cloud infrastructure, and messing with AI, caching systems, backend systems, and emulating single-cycle processing units *wink* (look at my RISC-V emulator/analyzer).
        </p>
      </div>
    </section>
  );
}
