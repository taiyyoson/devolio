"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Terminal from "@/components/Terminal";
import PortfolioView from "@/components/portfolio/PortfolioView";

const BOOT_HASH = /^#login=([a-z_]+)$/;

function subscribeToHash(onStoreChange) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

const getHash = () => window.location.hash;

// The server has no `location`. Returning "" here means both the server render
// and the hydration render agree on the portfolio; the real hash is read only
// after hydration, so there is no mismatch.
const getHashOnServer = () => "";

export default function Home() {
  const hash = useSyncExternalStore(subscribeToHash, getHash, getHashOnServer);
  const boot = BOOT_HASH.exec(hash)?.[1] ?? null;

  // Explicit user navigation wins over whatever the URL says.
  const [override, setOverride] = useState(null);
  const view = override ?? (boot ? "terminal" : "portfolio");

  useEffect(() => {
    if (view !== "portfolio") return;
    function onKey(e) {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;
      if (e.key === "`") {
        e.preventDefault();
        setOverride("terminal");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  if (view === "portfolio") {
    return <PortfolioView onSwitchToTerminal={() => setOverride("terminal")} />;
  }

  return <Terminal onToggleView={() => setOverride("portfolio")} boot={boot} />;
}
