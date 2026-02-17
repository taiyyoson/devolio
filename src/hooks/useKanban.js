"use client";

import { useState, useEffect, useCallback } from "react";

export function useKanban() {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch("/api/kanban/boards");
      if (!res.ok) throw new Error("Failed to fetch");
      const boards = await res.json();
      setBoard(boards[0] || null);
    } catch (err) {
      console.error("Kanban fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  async function addCard(columnId, title) {
    const column = board.columns.find((c) => c.id === columnId);
    const position = column ? column.cards.length : 0;

    // Optimistic update
    const tempId = "temp-" + Date.now();
    const tempCard = { id: tempId, column_id: columnId, title, description: "", position };
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((c) =>
        c.id === columnId ? { ...c, cards: [...c.cards, tempCard] } : c
      ),
    }));

    const res = await fetch("/api/kanban/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ column_id: columnId, title, position }),
    });
    const card = await res.json();

    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((c) =>
        c.id === columnId
          ? { ...c, cards: c.cards.map((cd) => (cd.id === tempId ? card : cd)) }
          : c
      ),
    }));
  }

  async function updateCard(cardId, updates) {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => ({
        ...c,
        cards: c.cards.map((cd) => (cd.id === cardId ? { ...cd, ...updates } : cd)),
      })),
    }));

    await fetch("/api/kanban/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cardId, ...updates }),
    });
  }

  async function deleteCard(cardId) {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => ({
        ...c,
        cards: c.cards.filter((cd) => cd.id !== cardId),
      })),
    }));

    await fetch("/api/kanban/cards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cardId }),
    });
  }

  async function moveCard(cardId, targetColumnId, targetPosition) {
    // Optimistic: remove from source, insert into target
    setBoard((prev) => {
      let card = null;
      const columns = prev.columns.map((c) => {
        const found = c.cards.find((cd) => cd.id === cardId);
        if (found) card = { ...found, column_id: targetColumnId, position: targetPosition };
        return { ...c, cards: c.cards.filter((cd) => cd.id !== cardId) };
      });

      if (!card) return prev;

      return {
        ...prev,
        columns: columns.map((c) => {
          if (c.id !== targetColumnId) return c;
          const cards = [...c.cards];
          cards.splice(targetPosition, 0, card);
          return { ...c, cards: cards.map((cd, i) => ({ ...cd, position: i })) };
        }),
      };
    });

    await fetch("/api/kanban/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cardId, column_id: targetColumnId, position: targetPosition }),
    });
  }

  async function addColumn(title) {
    const position = board ? board.columns.length : 0;
    const res = await fetch("/api/kanban/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board_id: board.id, title, position }),
    });
    const column = await res.json();
    setBoard((prev) => ({
      ...prev,
      columns: [...prev.columns, { ...column, cards: [] }],
    }));
  }

  async function deleteColumn(columnId) {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.id !== columnId),
    }));

    await fetch("/api/kanban/columns", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: columnId }),
    });
  }

  return { board, loading, addCard, updateCard, deleteCard, moveCard, addColumn, deleteColumn, refetch: fetchBoard };
}
