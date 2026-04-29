"use client";

import { useEffect, useState } from "react";
import PortfolioNav from "./PortfolioNav";
import PortfolioHero from "./PortfolioHero";
import PortfolioProjects from "./PortfolioProjects";
import PortfolioExperience from "./PortfolioExperience";
import PortfolioFooter from "./PortfolioFooter";

const TABS = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
];

export default function PortfolioView({ onSwitchToTerminal }) {
  const [tab, setTab] = useState("about");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans portfolio-fade-in">
      <PortfolioNav onSwitchToTerminal={onSwitchToTerminal} />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="md:grid md:grid-cols-[180px_1fr] md:gap-12">
          <aside className="mb-8 md:mb-0">
            <div className="md:sticky md:top-24">
              <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-mono text-sm mb-8">
                tw
              </div>
              <nav className="flex md:flex-col gap-2 text-sm">
                {TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex items-center gap-2 transition-colors text-left ${
                      tab === id ? "text-foreground" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        tab === id ? "bg-accent" : "bg-transparent"
                      }`}
                    />
                    {label}
                  </button>
                ))}
                <button
                  onClick={onSwitchToTerminal}
                  className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-left font-mono"
                  title="Open terminal (press `)"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                  {">"}_ Terminal
                </button>
              </nav>
            </div>
          </aside>
          <article className="max-w-prose text-lg leading-relaxed" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            {tab === "about" && <PortfolioHero />}
            {tab === "projects" && <PortfolioProjects />}
            {tab === "experience" && <PortfolioExperience />}
            <PortfolioFooter />
          </article>
        </div>
      </main>
    </div>
  );
}
