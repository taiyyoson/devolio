import Link from "next/link";

export default function BlogShell({ children, backHref = "/", backLabel = "index" }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <nav className="sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between text-sm">
          <Link
            href="/"
            className="font-mono text-muted hover:text-foreground transition-colors"
          >
            taiyo williamson
          </Link>
          <Link
            href={backHref}
            className="font-mono text-muted hover:text-foreground transition-colors"
          >
            ← {backLabel}
          </Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12">{children}</main>
    </div>
  );
}
