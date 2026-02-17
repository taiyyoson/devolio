"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import CardModal from "./CardModal";
import { useKanban } from "@/hooks/useKanban";

export default function KanbanBoard() {
  const { board, loading, addCard, updateCard, deleteCard, moveCard, addColumn, deleteColumn } = useKanban();
  const [editingCard, setEditingCard] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const findColumnByCardId = useCallback(
    (cardId) => board?.columns.find((c) => c.cards.some((cd) => cd.id === cardId)),
    [board]
  );

  function handleDragStart(event) {
    const { active } = event;
    if (active.data.current?.type === "card") {
      setActiveCard(active.data.current.card);
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || !board) return;

    const activeData = active.data.current;
    if (activeData?.type !== "card") return;

    const sourceCol = findColumnByCardId(active.id);
    if (!sourceCol) return;

    // Dropped on a column directly
    let targetColId = over.id;
    let targetPos = 0;

    if (over.data.current?.type === "card") {
      const targetCol = findColumnByCardId(over.id);
      if (!targetCol) return;
      targetColId = targetCol.id;
      targetPos = targetCol.cards.findIndex((c) => c.id === over.id);
    } else if (over.data.current?.type === "column") {
      targetColId = over.data.current.column.id;
      const col = board.columns.find((c) => c.id === targetColId);
      targetPos = col ? col.cards.length : 0;
    }

    if (sourceCol.id === targetColId) {
      const oldIndex = sourceCol.cards.findIndex((c) => c.id === active.id);
      if (oldIndex === targetPos) return;
    }

    moveCard(active.id, targetColId, targetPos);
  }

  function handleEditSave(updates) {
    if (editingCard) {
      updateCard(editingCard.id, updates);
      setEditingCard(null);
    }
  }

  function handleAddColumn() {
    if (!newColumnTitle.trim()) return;
    addColumn(newColumnTitle.trim());
    setNewColumnTitle("");
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-500 text-sm">Loading board...</div>;
  }

  if (!board) {
    return <div className="flex items-center justify-center h-full text-gray-500 text-sm">No board found. Run the schema SQL and seed data first.</div>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-4 h-full items-start">
        {board.columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onAddCard={addCard}
            onEditCard={setEditingCard}
            onDeleteCard={deleteCard}
            onDeleteColumn={deleteColumn}
          />
        ))}

        {/* Add column */}
        <div className="flex w-72 shrink-0 flex-col gap-1">
          <input
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
            placeholder="New column..."
            className="rounded bg-gray-900 border border-gray-800 px-3 py-2 text-sm text-gray-400 outline-none focus:border-gray-600"
          />
        </div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <KanbanCard card={activeCard} onEdit={() => {}} onDelete={() => {}} />
        ) : null}
      </DragOverlay>

      {editingCard && (
        <CardModal card={editingCard} onSave={handleEditSave} onClose={() => setEditingCard(null)} />
      )}
    </DndContext>
  );
}
