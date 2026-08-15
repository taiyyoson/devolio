"use client";

import { useEffect } from "react";

// Replaces the root layout entirely, so it ships its own <html>/<body> and
// cannot rely on globals.css being loaded.
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          margin: 0,
          background: "#0e1116",
          color: "#e6edf3",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "0.875rem",
        }}
      >
        <p>The site failed to load.</p>
        <button
          onClick={reset}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: "#7ee787",
            font: "inherit",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          retry
        </button>
      </body>
    </html>
  );
}
