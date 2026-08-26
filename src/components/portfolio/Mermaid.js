"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useIsDark } from "@/lib/useIsDark";

export default function Mermaid({ chart }) {
  const isDark = useIsDark();
  const rawId = useId();
  const containerRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // useId yields ":r1:", which is not a valid CSS selector — mermaid.render
    // uses the id to query the node it injects.
    const id = `mermaid${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: isDark ? "dark" : "neutral",
          fontFamily: "var(--font-geist-mono), monospace",
          themeVariables: { background: "transparent" },
        });
        const { svg } = await mermaid.render(id, chart);
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = svg;
        setFailed(false);
      } catch (err) {
        if (cancelled) return;
        console.error("[mermaid] render failed:", err?.message ?? err);
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, isDark, rawId]);

  if (failed) {
    return (
      <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 text-xs font-mono text-muted">
        {chart}
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Architecture diagram"
      className="my-8 overflow-x-auto rounded-lg border border-border bg-card p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
    />
  );
}
