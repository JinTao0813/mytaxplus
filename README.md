# MyTax+

MyTax+ is an AI-assisted personal tax application: upload tax documents, build a tax profile, detect reliefs, compare tax before/after optimization, and get a filing-style summary. This repository contains a **Next.js** web app, a **FastAPI** service for AI and tax logic, and **Firebase** (Auth, and Firestore/Storage as you wire them) for identity and data.

## Stack

| Area        | Technology |
|------------|------------|
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Base UI) |
| Backend    | Python 3.12+, FastAPI, [uv](https://github.com/astral-sh/uv) for dependencies |
| Auth / data| Firebase Auth; Firestore and Storage for persistence (integrate in app code) |
| API        | Browser calls FastAPI at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`) |

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS) and npm
- [uv](https://github.com/astral-sh/uv) (installs the Python version in `backend/.python-version` and project venv)
- Optional: [lsof](https://en.wikipedia.org/wiki/Lsof) (used by `make dev-down` to free ports 3000/8000 on macOS/Linux)

## Quick start

From the repository root:

```bash
make setup    # optional: copy env templates, uv sync, npm install
make dev      # FastAPI + Next.js in one terminal (Ctrl+C stops both)
```

Then open:

- Web app: [http://localhost:3000](http://localhost:3000)
- API docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

First run copies `frontend/.env.example` → `frontend/.env.local` and `backend/.env.example` → `backend/.env` if those files do not exist.

### Running services separately

```bash
make dev-backend    # FastAPI only (port 8000)
make dev-frontend   # Next.js only (port 3000)
```

### Stopping stray processes on dev ports

If something is still bound to 3000 or 8000 after stopping the servers:

```bash
make dev-down       # requires lsof for PID-based cleanup
```

## Environment variables

Copy the examples and fill in secrets (never commit real `.env` or Firebase service account keys).

### Frontend (`frontend/.env.local`)

See [`frontend/.env.example`](frontend/.env.example):

- `NEXT_PUBLIC_API_URL` — FastAPI base URL used by the browser.
- `NEXT_PUBLIC_FIREBASE_*` — Firebase Web App config from the Firebase console.
- `NEXT_PUBLIC_DEV_AUTH_BYPASS` — set to `true` only for local development without Firebase; never enable in production.

### Backend (`backend/.env`)

See [`backend/.env.example`](backend/.env.example):

- `ALLOWED_ORIGINS` — comma-separated origins for CORS (include `http://localhost:3000` for local UI).
- `GEMINI_API_KEY` — optional; for Gemini-backed features when implemented.

More detail: [`backend/README.md`](backend/README.md).

## Makefile targets

| Target          | Description |
|-----------------|-------------|
| `make setup`    | Ensure env files from examples, `uv sync` in `backend/`, `npm install` in `frontend/`. |
| `make dev`      | Sync backend deps, install frontend deps if missing, run API + web together. |
| `make dev-backend` | Run FastAPI with hot reload. |
| `make dev-frontend` | Run Next.js dev server. |
| `make dev-down` | Try to free ports 3000 and 8000 (uses `lsof` when available). |
| `make local`    | Alias for `make dev`. |

## Repository layout

```
mytaxplus/
├── Makefile              # Local dev orchestration
├── frontend/             # Next.js App Router UI
├── backend/              # FastAPI app (`app.main:app`), `/api/v1/*` routes
└── README.md             # This file
```

## Development notes

- The UI expects the API at the host URL in `NEXT_PUBLIC_API_URL` so the browser can reach FastAPI from your machine (not a container-only hostname).
- Firebase ID tokens can be attached to API calls via `getIdToken()` when you add Bearer verification on FastAPI.
- Run `npm run lint` and `npm run build` in `frontend/` before releases; run tests when you add them under `backend/tests/`.

## License

Add a license file when you decide how this project is distributed.
