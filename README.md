# northflank.fullstack

A fullstack **Todo** application deployable on [Northflank](https://northflank.com), consisting of:

- 🗄️ **Database** – PostgreSQL 16
- 🔌 **API** – Node.js / Express REST API
- 🖥️ **Frontend** – React (Vite) served by Nginx

---

## Project structure

```
northflank.fullstack/
├── api/                  # Express REST API
│   ├── src/
│   │   ├── index.js      # App entry-point & routes
│   │   └── db.js         # PostgreSQL pool & schema init
│   ├── tests/
│   │   └── todos.test.js # Jest/Supertest unit tests
│   ├── Dockerfile
│   └── package.json
├── frontend/             # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile        # Multi-stage: Vite build → Nginx
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml    # Local development stack
├── northflank.json       # Northflank deployment template
└── README.md
```

---

## API endpoints

| Method | Path            | Description       |
|--------|-----------------|-------------------|
| GET    | `/health`       | Health check      |
| GET    | `/api/todos`    | List all todos    |
| POST   | `/api/todos`    | Create a todo     |
| PUT    | `/api/todos/:id`| Update a todo     |
| DELETE | `/api/todos/:id`| Delete a todo     |

---

## Running locally

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose

### Start all services

```bash
docker compose up --build
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| API      | http://localhost:4000      |
| Database | localhost:5432             |

### Running tests

```bash
# API tests
cd api && npm install && npm test

# Frontend tests
cd frontend && npm install && npm test
```

---

## Deploying to Northflank

### Option 1 – Northflank Template (recommended)

1. Go to [app.northflank.com](https://app.northflank.com) → **Templates** → **New template**
2. Paste the contents of [`northflank.json`](./northflank.json)
3. Click **Run** – Northflank will sequentially:
   - Create the `todo-fullstack` project
   - Provision the PostgreSQL 16 add-on (`todo-db`)
   - Create a secret group that wires the add-on `CONNECTION_STRING` to `DATABASE_URL`
   - Build and deploy the `todo-api` service from `api/Dockerfile`
   - Build and deploy the `todo-frontend` service from `frontend/Dockerfile` (public port 80)

### Option 2 – Manual setup via the Northflank UI

1. **Create a project** in Northflank.
2. **Add a PostgreSQL add-on** (v16). Note the `CONNECTION_STRING` secret it generates.
3. **Create a deployment service** for the API:
   - Build from this GitHub repo
   - Dockerfile path: `api/Dockerfile`
   - Set `DATABASE_URL` to the add-on `CONNECTION_STRING`
   - Set `PORT=4000`
4. **Create a deployment service** for the frontend:
   - Build from this GitHub repo
   - Dockerfile path: `frontend/Dockerfile`
   - Expose port 80 publicly

### Environment variables

| Service  | Variable       | Description                         |
|----------|----------------|-------------------------------------|
| API      | `DATABASE_URL` | PostgreSQL connection string        |
| API      | `PORT`         | Port to listen on (default `4000`)  |
| API      | `NODE_ENV`     | `production` or `development`       |