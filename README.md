# Vehicle Service Management System (VSMS)

Full-stack project: Express + Prisma + Postgres backend, React frontend, JWT auth, role-based access (USER / ADMIN).

- **Users** manage their own vehicles and create service requests.
- **Admins** view all data and update service request status.

## 🔗 Live Demo

| | URL |
|---|---|
| **Frontend (Vercel)** | _add your Vercel URL here after deploy_ |
| **Backend API**       | https://primetrade-internship-hwfr.onrender.com/api/v1 |
| **Swagger docs**      | https://primetrade-internship-hwfr.onrender.com/api-docs |
| **Health check**      | https://primetrade-internship-hwfr.onrender.com/health |

> ⚠️ The backend runs on Render's free tier and **spins down after ~15 min of inactivity**. The very first request after sleep can take **~50 seconds** to wake the instance. Subsequent requests are fast. If login appears to hang on first try, just wait — it's the cold start, not a bug.

Use the [pre-seeded accounts](#pre-seeded-accounts) below to log in.

---

## Tech Stack

Node.js · Express · Prisma · PostgreSQL (Neon or local) · JWT · bcrypt · Zod · Helmet · React · React Router · axios · Swagger

---

## Prerequisites

- Node.js >= 18
- A Postgres database — either a Neon project or a local Postgres / Docker

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env       # then edit DATABASE_URL and JWT_SECRET
npx prisma db push         # create tables in your database
node prisma/seed.js        # create admin + 3 demo users + sample data
npm run dev                # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm start                  # http://localhost:3000
```

Open `http://localhost:3000` and log in with one of the seeded accounts below.

---

## Pre-seeded Accounts

| Role  | Email                | Password    |
|-------|----------------------|-------------|
| ADMIN | `admin@vsms.dev`     | `Admin@123` |
| USER  | `alice@vsms.dev`     | `User@123`  |
| USER  | `bob@vsms.dev`       | `User@123`  |
| USER  | `charlie@vsms.dev`   | `User@123`  |

Public registration always creates `USER` accounts. Admins are seeded only.

---

## Run with Docker (alternative)

From the repo root:

```bash
docker compose up --build
```

Brings up Postgres + the backend (auto-runs migrations and seed). Then start the frontend separately with `cd frontend && npm install && npm start`.

---

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
DATABASE_URL="postgresql://user:pwd@host/dbname?sslmode=require"
JWT_SECRET="any-long-random-string"
JWT_EXPIRES_IN="7d"
PORT=5000
CORS_ORIGIN="http://localhost:3000"
```

Frontend optionally reads `REACT_APP_API_URL` (defaults to `http://localhost:5000/api/v1`).

---

## API

- Base URL: `http://localhost:5000/api/v1`
- Swagger UI: `http://localhost:5000/api-docs`
- Postman collection: `postman_collection.json` at the repo root
  - Set `{{base_url}}` to `http://localhost:5000`
  - Login → copy `data.token` → paste into `{{token}}`

### Routes

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST   | `/auth/register`     | public | Creates a USER (role is fixed server-side) |
| POST   | `/auth/login`        | public | Returns JWT |
| GET    | `/vehicles`          | user  | Owner-only; ADMIN sees all |
| POST   | `/vehicles`          | user  | Create vehicle |
| PUT    | `/vehicles/:id`      | user  | Update (owner or ADMIN) |
| DELETE | `/vehicles/:id`      | user  | Delete (owner or ADMIN) |
| GET    | `/services`          | user  | Owner-only; ADMIN sees all |
| POST   | `/services`          | user  | Create service request |
| PUT    | `/services/:id`      | user  | Owner edits fields; only ADMIN can change `status` |
| DELETE | `/services/:id`      | user  | USER only if `status=PENDING`; ADMIN unrestricted |

All non-auth routes require `Authorization: Bearer <jwt>`.

### Response shape

```json
{ "success": true,  "message": "...", "data": { ... } }
{ "success": false, "message": "...", "error": "..." }
```

---

## Validation Rules

| Field          | Rule                                                                 |
|----------------|----------------------------------------------------------------------|
| `phone`        | exactly 10 digits (e.g. `9876543210`)                                |
| `licensePlate` | Indian RTO format `TN 20 BC 3424` (state · RTO · series · number)    |
| `vin`          | ISO 3779 — 17 alphanumeric chars, **no I/O/Q** (e.g. `1HGBH41JXMN109186`) |
| `password`     | min 6 characters                                                     |

---

## Project Structure

```
backend/
  prisma/
    schema.prisma   # User, Vehicle, ServiceRequest + enums + indexes
    seed.js         # admin + 3 demo users + sample data
  src/
    config/         # prisma client, swagger spec
    controllers/    # thin HTTP layer
    services/       # business logic + Prisma queries
    routes/         # /auth, /vehicles, /services
    middleware/     # auth, validate, errorHandler
    validators/     # Zod schemas
    utils/          # ApiError, asyncHandler, jwt helpers
    app.js          # express wiring (helmet, rate-limit, cors)
    server.js       # entrypoint

frontend/
  src/
    components/     # Navbar, Notice, ProtectedRoute, sections
    pages/          # Login, Register, Dashboard
    services/       # axios client (401 interceptor), auth helpers
    styles/         # global theme

docker-compose.yml
postman_collection.json
scalability.md
```

---

## Security

- Passwords hashed with bcrypt
- JWT with `Authorization: Bearer` scheme
- `helmet` security headers
- Rate limit on `/auth/*` (20 req / 15 min / IP)
- Public registration cannot escalate to ADMIN
- Zod validation on every request body
- Request body capped at 100 kB

See `scalability.md` for horizontal scaling, caching, and microservices notes.

---

## Deployment

| Layer | Host | Notes |
|---|---|---|
| Database | Neon (managed Postgres) | Pooled connection string |
| Backend  | Render (free web service) | Auto-deploys on push to `main`. Cold start ~50s after idle. |
| Frontend | Vercel (CRA preset) | Reads `REACT_APP_API_URL` at build time |

### Backend env vars (set in Render dashboard)

```
DATABASE_URL      = <Neon pooled connection string>
JWT_SECRET        = <long random string>
JWT_EXPIRES_IN    = 7d
CORS_ORIGIN       = <your Vercel URL, e.g. https://vsms.vercel.app>
```

### Frontend env vars (set in Vercel dashboard)

```
REACT_APP_API_URL = https://primetrade-internship-hwfr.onrender.com/api/v1
```

> If you change `REACT_APP_API_URL` after the first Vercel deploy, trigger a redeploy — CRA inlines env vars at build time.
