"use client";

import { useState, useEffect } from "react";

type TodoEditorProps = {
  initialTitle?: string;
  initialDescription?: string;
  initialStatus?: "pending" | "completed";
  todoId?: string; // if provided → edit mode
  onSave: () => void; // call after saving
  onCancel?: () => void;
};

export default function TodoEditor({
  initialTitle = "",
  initialDescription = "",
  initialStatus = "pending",
  todoId,
  onSave,
  onCancel,
}: TodoEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState<"pending" | "completed">(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(todoId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isEdit
      ? `/api/todos/${todoId}`
      : `/api/todos`;

    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        status,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data?.error || "Something went wrong");
      return;
    }

    onSave(); // parent should reload list
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-xl shadow space-y-3"
    >
      <h2 className="font-medium text-lg">
        {isEdit ? "Edit To-Do" : "Create To-Do"}
      </h2>

      <input
        type="text"
        placeholder="Title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded-md px-3 py-2"
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border rounded-md px-3 py-2"
      />

      {isEdit && (
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "pending" | "completed")
          }
          className="w-full border rounded-md px-3 py-2"
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          {loading
            ? isEdit
              ? "Updating…"
              : "Creating…"
            : isEdit
            ? "Update"
            : "Create"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md border"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
