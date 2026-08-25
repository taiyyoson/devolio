"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PortfolioNav from "./PortfolioNav";
import PortfolioFooter from "./PortfolioFooter";
import Terminal from "@/components/Terminal";

const RAIL = [
  { href: "/", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/blog", label: "Blogs" },
];

const BOOT_HASH = /^#login=([a-z_]+)$/;

function subscribeToHash(onStoreChange) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

const getHash = () => window.location.hash;

// The server has no `location`; returning "" keeps the server render and the
// hydration render in agreement. The real hash is read only after hydration.
const getHashOnServer = () => "";

function isActive(pathname, href) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function PortfolioChrome({ children }) {
  const pathname = usePathname();
  const hash = useSyncExternalStore(subscribeToHash, getHash, getHashOnServer);
  const boot = BOOT_HASH.exec(hash)?.[1] ?? null;

  const [override, setOverride] = useState(null);
  const showTerminal = override ?? boot !== null;

  useEffect(() => {
    if (showTerminal) return;
    function onKey(e) {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;
      if (e.key === "`") {
        e.preventDefault();
        setOverride(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showTerminal]);

  if (showTerminal) {
    return <Terminal onToggleView={() => setOverride(false)} boot={boot} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans portfolio-fade-in">
      <PortfolioNav onSwitchToTerminal={() => setOverride(true)} />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="md:grid md:grid-cols-[180px_1fr] md:gap-12">
          <aside className="mb-8 md:mb-0">
            <div className="md:sticky md:top-24">
              <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-mono text-sm mb-8">
                tw
              </div>
              <nav className="flex md:flex-col gap-2 text-sm">
                {RAIL.map(({ href, label }) => {
                  const active = isActive(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-2 transition-colors text-left ${
                        active ? "text-foreground" : "text-muted hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          active ? "bg-accent" : "bg-transparent"
                        }`}
                      />
                      {label}
                    </Link>
                  );
                })}
                <button
                  onClick={() => setOverride(true)}
                  className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-left font-mono"
                  title="Open terminal (press `)"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                  {">"}_ Terminal
                </button>
              </nav>
            </div>
          </aside>
          <article className="max-w-6xl font-serif text-lg leading-relaxed">
            {children}
            <PortfolioFooter />
          </article>
        </div>
      </main>
    </div>
  );
}
