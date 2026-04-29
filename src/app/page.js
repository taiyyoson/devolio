"use client";

import { useEffect, useState } from "react";
import Terminal from "@/components/Terminal";
import PortfolioView from "@/components/portfolio/PortfolioView";

export default function Home() {
  const [view, setView] = useState("portfolio");

  useEffect(() => {
    if (view !== "portfolio") return;
    function onKey(e) {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;
      if (e.key === "`") {
        e.preventDefault();
        setView("terminal");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  if (view === "portfolio") {
    return <PortfolioView onSwitchToTerminal={() => setView("terminal")} />;
  }

  return <Terminal onToggleView={() => setView("portfolio")} />;
}
