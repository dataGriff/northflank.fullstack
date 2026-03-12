import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import App from "../App";

const mockTodos = [
  { id: 1, title: "Buy groceries", completed: false, created_at: new Date().toISOString() },
  { id: 2, title: "Write tests", completed: true, created_at: new Date().toISOString() },
];

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn((url, options) => {
      if (!options || options.method === undefined || options.method === "GET") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTodos),
        });
      }
      if (options.method === "POST") {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 3,
              title: body.title,
              completed: false,
              created_at: new Date().toISOString(),
            }),
        });
      }
      if (options.method === "PUT") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ ...mockTodos[0], completed: true }),
        });
      }
      if (options.method === "DELETE") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: "Deleted successfully" }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    })
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App", () => {
  it("renders heading", async () => {
    render(<App />);
    expect(screen.getByText(/Todo App/i)).toBeInTheDocument();
  });

  it("loads and displays todos", async () => {
    render(<App />);
    await waitFor(() =>
      expect(screen.getByText("Buy groceries")).toBeInTheDocument()
    );
    expect(screen.getByText("Write tests")).toBeInTheDocument();
  });

  it("adds a new todo", async () => {
    render(<App />);
    await waitFor(() => screen.getByText("Buy groceries"));

    const input = screen.getByPlaceholderText(/Add a new todo/i);
    fireEvent.change(input, { target: { value: "New task" } });
    fireEvent.submit(input.closest("form"));

    await waitFor(() => expect(screen.getByText("New task")).toBeInTheDocument());
  });

  it("shows completed count in footer", async () => {
    render(<App />);
    await waitFor(() => screen.getByText("Buy groceries"));
    expect(screen.getByText(/1 \/ 2 completed/i)).toBeInTheDocument();
  });
});
