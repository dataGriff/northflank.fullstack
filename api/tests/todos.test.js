const request = require("supertest");
const { app } = require("../src/index");

// Mock the database pool
jest.mock("../src/db", () => {
  const todos = [
    {
      id: 1,
      title: "Buy groceries",
      completed: false,
      created_at: new Date().toISOString(),
    },
  ];

  const pool = {
    query: jest.fn(async (sql, params) => {
      if (sql.includes("CREATE TABLE")) {
        return { rows: [] };
      }
      if (sql.includes("SELECT *")) {
        return { rows: todos };
      }
      if (sql.includes("INSERT")) {
        const newTodo = {
          id: 2,
          title: params[0],
          completed: false,
          created_at: new Date().toISOString(),
        };
        todos.push(newTodo);
        return { rows: [newTodo] };
      }
      if (sql.includes("UPDATE")) {
        const id = parseInt(params[2]);
        const todo = todos.find((t) => t.id === id);
        if (!todo) return { rowCount: 0, rows: [] };
        if (params[0] !== undefined) todo.title = params[0];
        if (params[1] !== undefined) todo.completed = params[1];
        return { rowCount: 1, rows: [todo] };
      }
      if (sql.includes("DELETE")) {
        const id = parseInt(params[0]);
        const idx = todos.findIndex((t) => t.id === id);
        if (idx === -1) return { rowCount: 0, rows: [] };
        todos.splice(idx, 1);
        return { rowCount: 1, rows: [{ id }] };
      }
      return { rows: [] };
    }),
  };

  return { pool, initDb: jest.fn() };
});

describe("Health check", () => {
  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("Todos API", () => {
  it("GET /api/todos returns list of todos", async () => {
    const res = await request(app).get("/api/todos");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/todos creates a new todo", async () => {
    const res = await request(app)
      .post("/api/todos")
      .send({ title: "Test todo" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Test todo");
    expect(res.body.completed).toBe(false);
  });

  it("POST /api/todos returns 400 when title is missing", async () => {
    const res = await request(app).post("/api/todos").send({});
    expect(res.status).toBe(400);
  });

  it("PUT /api/todos/:id updates a todo", async () => {
    const res = await request(app)
      .put("/api/todos/1")
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it("PUT /api/todos/:id returns 404 for unknown id", async () => {
    const res = await request(app)
      .put("/api/todos/999")
      .send({ completed: true });
    expect(res.status).toBe(404);
  });

  it("DELETE /api/todos/:id deletes a todo", async () => {
    const res = await request(app).delete("/api/todos/1");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Deleted successfully");
  });

  it("DELETE /api/todos/:id returns 404 for unknown id", async () => {
    const res = await request(app).delete("/api/todos/999");
    expect(res.status).toBe(404);
  });
});
