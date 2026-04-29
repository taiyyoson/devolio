"use client";

import { useEffect, useState } from "react";

export default function PortfolioNav({ onSwitchToTerminal }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const nextDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
    setIsDark(nextDark);
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <span className="font-mono text-sm text-muted">taiyo williamson</span>
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={toggleTheme}
            className="text-muted hover:text-foreground transition-colors"
            aria-label="Toggle theme"
            suppressHydrationWarning
          >
            {mounted ? (isDark ? "☀" : "☾") : "☾"}
          </button>
          <button
            onClick={onSwitchToTerminal}
            className="font-mono text-muted hover:text-foreground transition-colors"
            aria-label="Open terminal"
            title="Open terminal (press `)"
          >
            {">"}_
          </button>
        </div>
      </div>
    </nav>
  );
}
