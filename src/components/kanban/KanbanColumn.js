"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";
import { useState } from "react";

export default function KanbanColumn({ column, onAddCard, onEditCard, onDeleteCard, onDeleteColumn }) {
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  function handleAdd() {
    if (!newTitle.trim()) return;
    onAddCard(column.id, newTitle.trim());
    setNewTitle("");
    setAdding(false);
  }

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-gray-900 border border-gray-800">
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-300">
          {column.title}
          <span className="ml-2 text-xs text-gray-600">{column.cards.length}</span>
        </h3>
        <button
          onClick={() => onDeleteColumn(column.id)}
          className="text-xs text-gray-600 hover:text-red-400"
        >
          x
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 space-y-2 p-2 min-h-[60px]">
        <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <KanbanCard key={card.id} card={card} onEdit={onEditCard} onDelete={onDeleteCard} />
          ))}
        </SortableContext>
      </div>

      <div className="p-2 border-t border-gray-800">
        {adding ? (
          <div className="space-y-1">
            <input
              autoFocus
              
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") handleAdd(); }}
              placeholder="Card title..."
              className="w-full rounded bg-gray-800 px-2 py-1 text-sm text-gray-300 outline-none border border-gray-700 focus:border-blue-500"
            />
            <div className="flex gap-1">
              <button onClick={handleAdd} className="rounded bg-blue-600 px-2 py-0.5 text-xs text-white hover:bg-blue-500">
                Add
              </button>
              <button onClick={() => { setAdding(false); setNewTitle(""); }} className="text-xs text-gray-500 hover:text-gray-300 px-1">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full rounded py-1 text-xs text-gray-500 hover:bg-gray-800 hover:text-gray-300"
          >
            + Add card
          </button>
        )}
      </div>
    </div>
  );
}
