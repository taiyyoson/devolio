"use client";

import { useState } from "react";
import Terminal from "@/components/Terminal";
import PortfolioView from "@/components/portfolio/PortfolioView";

export default function Home() {
  const [view, setView] = useState("terminal");

  if (view === "portfolio") {
    return <PortfolioView onSwitchToTerminal={() => setView("terminal")} />;
  }

  return <Terminal onToggleView={() => setView("portfolio")} />;
}
