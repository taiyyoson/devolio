"use client";

import { useState, useEffect, useCallback } from "react";

async function request(url, options) {
  const res = await fetch(url, options);

  if (!res.ok) {
    let message = "Request failed";
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // non-JSON error response — keep the generic message
    }
    throw new Error(message);
  }

  return res.json();
}

export function useKanban() {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBoard = useCallback(async () => {
    try {
      const boards = await request("/api/kanban/boards");
      setBoard(boards[0] || null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  /**
   * Apply an optimistic update, then reconcile with the server. Any failure
   * resyncs from the server rather than replaying an inverse update — the
   * board is small, and a refetch cannot drift the way manual rollback can.
   */
  const mutate = useCallback(
    async (optimistic, send) => {
      setBoard(optimistic);
      try {
        await send();
        setError(null);
      } catch (err) {
        setError(err.message);
        await fetchBoard();
      }
    },
    [fetchBoard]
  );

  async function addCard(columnId, title) {
    if (!board) return;

    const column = board.columns.find((c) => c.id === columnId);
    const position = column ? column.cards.length : 0;
    const tempId = "temp-" + Date.now();
    const tempCard = { id: tempId, column_id: columnId, title, description: "", position };

    await mutate(
      (prev) => ({
        ...prev,
        columns: prev.columns.map((c) =>
          c.id === columnId ? { ...c, cards: [...c.cards, tempCard] } : c
        ),
      }),
      async () => {
        const card = await request("/api/kanban/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ column_id: columnId, title, position }),
        });
        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((c) =>
            c.id === columnId
              ? { ...c, cards: c.cards.map((cd) => (cd.id === tempId ? card : cd)) }
              : c
          ),
        }));
      }
    );
  }

  async function updateCard(cardId, updates) {
    await mutate(
      (prev) => ({
        ...prev,
        columns: prev.columns.map((c) => ({
          ...c,
          cards: c.cards.map((cd) => (cd.id === cardId ? { ...cd, ...updates } : cd)),
        })),
      }),
      () =>
        request("/api/kanban/cards", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: cardId, ...updates }),
        })
    );
  }

  async function deleteCard(cardId) {
    await mutate(
      (prev) => ({
        ...prev,
        columns: prev.columns.map((c) => ({
          ...c,
          cards: c.cards.filter((cd) => cd.id !== cardId),
        })),
      }),
      () =>
        request("/api/kanban/cards", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: cardId }),
        })
    );
  }

  async function moveCard(cardId, targetColumnId, targetPosition) {
    await mutate(
      (prev) => {
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
      },
      () =>
        request("/api/kanban/cards", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: cardId,
            column_id: targetColumnId,
            position: targetPosition,
          }),
        })
    );
  }

  async function addColumn(title) {
    if (!board) return;

    const position = board.columns.length;
    const boardId = board.id;
    const tempId = "temp-" + Date.now();

    await mutate(
      (prev) => ({
        ...prev,
        columns: [...prev.columns, { id: tempId, board_id: boardId, title, position, cards: [] }],
      }),
      async () => {
        const column = await request("/api/kanban/columns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ board_id: boardId, title, position }),
        });
        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((c) =>
            c.id === tempId ? { ...column, cards: [] } : c
          ),
        }));
      }
    );
  }

  async function deleteColumn(columnId) {
    await mutate(
      (prev) => ({
        ...prev,
        columns: prev.columns.filter((c) => c.id !== columnId),
      }),
      () =>
        request("/api/kanban/columns", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: columnId }),
        })
    );
  }

  return {
    board,
    loading,
    error,
    dismissError: () => setError(null),
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    addColumn,
    deleteColumn,
    refetch: fetchBoard,
  };
}
