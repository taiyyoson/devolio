"use client";

import { useEffect, useRef } from "react";
import KanbanBoard from "./KanbanBoard";

export default function KanbanOverlay({ onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    containerRef.current?.focus();

    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      data-kanban-overlay
      role="dialog"
      aria-modal="true"
      aria-label="Kanban board"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col bg-black/80 outline-none"
    >
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2">
        <span className="text-sm font-medium text-gray-300">Kanban Board</span>
        <button
          onClick={onClose}
          className="rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-800 hover:text-gray-300"
        >
          Close (Esc)
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
