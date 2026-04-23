# MyTax+

MyTax+ is an AI-assisted personal tax application: upload tax documents, build a tax profile, detect reliefs, compare tax before/after optimization, and get a filing-style summary. This repository is centered on a **Next.js** app that serves both UI and backend route handlers, with **Firebase** (Auth, Firestore, Storage) for identity and data.

## Stack

| Area        | Technology |
|------------|------------|
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Base UI) |
| Backend/API| Next.js Route Handlers (`/api/v1/*`) + domain DAL/service modules |
| Auth / data| Firebase Auth; Firestore and Storage for persistence |
| AI parsing | Google Document AI via Node client in API handlers |

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS) and npm
- Optional: [lsof](https://en.wikipedia.org/wiki/Lsof) (used by `make dev-down` to free dev ports)

## Quick start

From the repository root:

```bash
make setup    # optional: copy env templates, npm install
make dev      # Next.js app (UI + API route handlers)
```

Then open:

- Web app: [http://localhost:3000](http://localhost:3000)
- Health check: [http://localhost:3000/health](http://localhost:3000/health)

First run copies `frontend/.env.example` → `frontend/.env.local` if the file does not exist.

### Stopping stray processes on dev port

If something is still bound to 3000 after stopping the server:

```bash
make dev-down       # requires lsof for PID-based cleanup
```

## Environment variables

Copy the examples and fill in secrets (never commit real `.env` or Firebase service account keys).

### Frontend (`frontend/.env.local`)

See [`frontend/.env.example`](frontend/.env.example):

- `NEXT_PUBLIC_API_URL` — optional API base URL override; leave empty for same-origin route handlers.
- `NEXT_PUBLIC_FIREBASE_*` — Firebase Web App config from the Firebase console.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — optional Firebase Admin credentials for server route handlers.
- `FIREBASE_STORAGE_BUCKET` — Firebase Storage bucket for server-side file operations.
- `DOCAI_PROJECT_ID`, `DOCAI_LOCATION`, `DOCAI_RECEIPT_PROCESSOR_ID`, `DOCAI_EA_PROCESSOR_ID` — Document AI processing config.
- `NEXT_PUBLIC_DEV_AUTH_BYPASS` — set to `true` only for local development without Firebase; never enable in production.

## Makefile targets

| Target          | Description |
|-----------------|-------------|
| `make setup`    | Ensure env file from example and install frontend dependencies. |
| `make dev`      | Run Next.js dev server (UI + API handlers). |
| `make dev-down` | Try to free port 3000 (uses `lsof` when available). |
| `make local`    | Alias for `make dev`. |

## Repository layout

```
mytaxplus/
├── Makefile              # Local dev orchestration
├── frontend/             # Next.js App Router UI + `/api/v1/*` route handlers
└── README.md             # This file
```

## Development notes

- With empty `NEXT_PUBLIC_API_URL`, API calls use same-origin Next.js route handlers.
- Firebase ID tokens can be attached to API calls via `getIdToken()` for Bearer verification fallback.
- Run `npm run lint` and `npm run build` in `frontend/` before releases.

## License

Add a license file when you decide how this project is distributed.
