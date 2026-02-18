"use client";

import { useEffect, useState } from "react";

export default function PortfolioNav({ onSwitchToTerminal }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    const dark = document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
    setIsDark(dark);
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-border">
      <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
        <span className="font-mono text-sm text-foreground">taiyo williamson</span>
        <div className="flex items-center gap-4 text-sm">
          <a href="#projects" className="text-muted hover:text-foreground transition-colors hidden sm:inline">
            projects
          </a>
          <a href="#experience" className="text-muted hover:text-foreground transition-colors hidden sm:inline">
            experience
          </a>
          <button
            onClick={toggleTheme}
            className="text-muted hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? "☀" : "☾"}
          </button>
          <button
            onClick={onSwitchToTerminal}
            className="font-mono text-muted hover:text-foreground transition-colors"
          >
            {">"}_
          </button>
        </div>
      </div>
    </nav>
  );
}
