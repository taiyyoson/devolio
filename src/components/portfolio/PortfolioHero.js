export default function PortfolioHero() {
  return (
    <section className="py-16">
      <h1 className="text-3xl font-bold text-foreground mb-4">Hi, I&apos;m Taiyo</h1>
      <p className="text-muted leading-relaxed max-w-lg">
        CS student at the University of San Francisco pursuing a B.S./M.S. (4+1).
        Interested in systems, cloud infrastructure, and AI — from building
        Go-based tooling at Fastly to RAG-powered health coaching chatbots.
      </p>
      <div className="flex gap-4 mt-6 text-sm">
        <a
          href="https://github.com/taiyyoson"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent-hover transition-colors"
        >
          github
        </a>
        <a
          href="https://linkedin.com/in/taiyowson"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent-hover transition-colors"
        >
          linkedin
        </a>
        <a
          href="mailto:tpwilliamson@dons.usfca.edu"
          className="text-accent hover:text-accent-hover transition-colors"
        >
          email
        </a>
      </div>
    </section>
  );
}
