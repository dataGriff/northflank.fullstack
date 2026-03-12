import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/todos`
  : "/api/todos";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch todos");
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create todo");
      const todo = await res.json();
      setTodos((prev) => [todo, ...prev]);
      setNewTitle("");
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleTodo = async (todo) => {
    try {
      const res = await fetch(`${API_URL}/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete todo");
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h1>📝 Todo App</h1>

      {error && (
        <div className="error" role="alert">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <form onSubmit={addTodo} className="add-form">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new todo..."
          aria-label="New todo title"
        />
        <button type="submit" disabled={!newTitle.trim()}>
          Add
        </button>
      </form>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : todos.length === 0 ? (
        <p className="empty">No todos yet. Add one above!</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.completed ? "completed" : ""}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo)}
                aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
              />
              <span className="title">{todo.title}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                aria-label={`Delete "${todo.title}"`}
                className="delete-btn"
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer>
        <p>
          {todos.filter((t) => t.completed).length} / {todos.length} completed
        </p>
      </footer>
    </div>
  );
}

export default App;
