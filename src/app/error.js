"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 font-mono">
      <p className="text-sm text-muted">
        <span className="text-accent">taiyo@devolio</span>
        <span className="text-muted">:</span>
        <span>~$ </span>
      </p>
      <p className="text-sm text-foreground">
        Something crashed. The details are in the console.
      </p>
      <button
        onClick={reset}
        className="mt-4 text-sm text-accent underline underline-offset-4 hover:text-accent-hover"
      >
        retry
      </button>
    </main>
  );
}
