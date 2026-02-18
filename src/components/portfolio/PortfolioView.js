"use client";

import { useEffect } from "react";
import PortfolioNav from "./PortfolioNav";
import PortfolioHero from "./PortfolioHero";
import PortfolioProjects from "./PortfolioProjects";
import PortfolioExperience from "./PortfolioExperience";
import PortfolioFooter from "./PortfolioFooter";

export default function PortfolioView({ onSwitchToTerminal }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans portfolio-fade-in">
      <PortfolioNav onSwitchToTerminal={onSwitchToTerminal} />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <PortfolioHero />
        <PortfolioProjects />
        <PortfolioExperience />
        <PortfolioFooter onSwitchToTerminal={onSwitchToTerminal} />
      </main>
    </div>
  );
}
