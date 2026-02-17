"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function KanbanCard({ card, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group rounded-lg border border-gray-700 bg-gray-800 p-3 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-gray-200">{card.title}</p>
        <div className="hidden group-hover:flex gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(card); }}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
            className="text-xs text-red-500 hover:text-red-400"
          >
            del
          </button>
        </div>
      </div>
      {card.description && (
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{card.description}</p>
      )}
    </div>
  );
}
