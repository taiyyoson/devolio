"use client";

import { useState } from "react";

export default function CardModal({ card, onSave, onClose }) {
  const [title, setTitle] = useState(card?.title || "");
  const [description, setDescription] = useState(card?.description || "");

  function handleSave() {
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim() });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-4"
      >
        <h3 className="text-sm font-medium text-gray-300 mb-3">
          {card ? "Edit Card" : "New Card"}
        </h3>
        <input
          autoFocus
          onKeyDown={(e) => e.stopPropagation()}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded bg-gray-800 px-3 py-2 text-sm text-gray-300 outline-none border border-gray-700 focus:border-blue-500 mb-2"
        />
        <textarea
          onKeyDown={(e) => e.stopPropagation()}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="w-full rounded bg-gray-800 px-3 py-2 text-sm text-gray-300 outline-none border border-gray-700 focus:border-blue-500 mb-3 resize-none"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200">
            Cancel
          </button>
          <button onClick={handleSave} className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-500">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
