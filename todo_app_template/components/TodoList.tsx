"use client";

import { useState } from "react";

export type Todo = {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "completed" | string;
  createdAt: string;
  updatedAt: string;
};

type TodoListProps = {
  todos: Todo[];
  reload: () => void;            // reload list from parent
  onEdit?: (todo: Todo) => void; // optional edit handler (opens editor)
};

export default function TodoList({ todos, reload, onEdit }: TodoListProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(id: string, status: "pending" | "completed") {
    setBusyId(id);
    setError(null);

    const res = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setBusyId(null);

    if (!res.ok) {
      const d = await res.json().catch(() => {});
      setError(d?.error || "Failed to update status");
      return;
    }

    reload();
  }

  async function deleteTodo(id: string) {
    setBusyId(id);
    setError(null);

    const res = await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });

    setBusyId(null);

    if (!res.ok) {
      const d = await res.json().catch(() => {});
      setError(d?.error || "Failed to delete todo");
      return;
    }

    reload();
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}

      {todos.length === 0 ? (
        <p className="text-sm text-gray-500">No to-dos yet.</p>
      ) : (
        todos.map((t) => (
          <div
            key={t.id}
            className="bg-white p-4 rounded-xl shadow flex justify-between items-start gap-4"
          >
            <div className="min-w-0">
              <p className="font-medium break-words">{t.title}</p>
              {t.description && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                  {t.description}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(t.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">

              {/* ✅ STATUS SELECT */}
              <select
                disabled={busyId === t.id}
                value={t.status}
                onChange={(e) =>
                  updateStatus(
                    t.id,
                    e.target.value as "pending" | "completed"
                  )
                }
                className="text-sm border rounded-md px-2 py-1"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              {/* ✅ EDIT BUTTON (optional) */}
              {onEdit && (
                <button
                  disabled={busyId === t.id}
                  onClick={() => onEdit(t)}
                  className="text-sm px-2 py-1 rounded-md border w-full"
                >
                  Edit
                </button>
              )}

              {/* ✅ DELETE BUTTON */}
              <button
                disabled={busyId === t.id}
                onClick={() => deleteTodo(t.id)}
                className="text-sm px-2 py-1 rounded-md border w-full text-red-600"
              >
                {busyId === t.id ? "…" : "Delete"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
