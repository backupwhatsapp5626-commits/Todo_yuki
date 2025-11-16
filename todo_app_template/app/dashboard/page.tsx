// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Todo = {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "completed" | string;
  createdAt: string;
  updatedAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchMe() {
    const r = await fetch("/api/auth/me");
    const d = await r.json();
    if (!d.user) router.replace("/");
  }

  async function loadTodos() {
    setError(null);
    const res = await fetch("/api/todos");
    if (res.status === 401) {
      router.replace("/");
      return;
    }
    const data = await res.json();
    setTodos(data.todos ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // check session and load data
    fetchMe().then(loadTodos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createTodo(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Failed to create to-do");
      return;
    }
    setTitle("");
    setDescription("");
    await loadTodos();
  }

  async function updateTodo(id: string, patch: Partial<Todo>) {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setBusyId(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d?.error || "Failed to update");
      return;
    }
    await loadTodos();
  }

  async function deleteTodo(id: string) {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d?.error || "Failed to delete");
      return;
    }
    await loadTodos();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Your To-Dos</h1>
          <button
            onClick={logout}
            className="text-sm px-3 py-1.5 rounded-md bg-gray-900 text-white"
          >
            Logout
          </button>
        </header>

        {/* Create form */}
        <form
          onSubmit={createTodo}
          className="bg-white rounded-2xl shadow p-4 space-y-3"
        >
          <h2 className="font-medium">Add To-Do</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Title"
            className="w-full border rounded-md px-3 py-2"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full border rounded-md px-3 py-2"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            className="rounded-md bg-blue-600 text-white px-3 py-2"
            type="submit"
          >
            Create
          </button>
        </form>

        {/* List */}
        {todos.length === 0 ? (
          <p className="text-sm text-gray-500">No to-dos yet.</p>
        ) : (
          <ul className="space-y-3">
            {todos.map((t) => (
              <li key={t.id} className="bg-white rounded-2xl shadow p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium break-words">{t.title}</div>
                    {t.description && (
                      <div className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                        {t.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={t.status}
                      onChange={(e) =>
                        updateTodo(t.id, {
                          status: e.target.value as Todo["status"],
                        })
                      }
                      className="text-sm border rounded-md px-2 py-1"
                      disabled={busyId === t.id}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => deleteTodo(t.id)}
                      disabled={busyId === t.id}
                      className="text-sm px-2 py-1 rounded-md border"
                    >
                      {busyId === t.id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
