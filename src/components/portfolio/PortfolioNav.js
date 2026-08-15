"use client";

import { useSyncExternalStore } from "react";

function subscribeToTheme(onStoreChange) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getIsDark = () => document.documentElement.classList.contains("dark");

// Matches the inline script in layout.js, which defaults to dark.
const getIsDarkOnServer = () => true;

export default function PortfolioNav({ onSwitchToTerminal }) {
  const isDark = useSyncExternalStore(subscribeToTheme, getIsDark, getIsDarkOnServer);

  function toggleTheme() {
    const nextDark = !getIsDark();
    document.documentElement.classList.toggle("dark", nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
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
            {isDark ? "☀" : "☾"}
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
