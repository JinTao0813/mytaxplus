# MyTax+ API (FastAPI)

## Local (uv)

```bash
cp .env.example .env   # optional
uv sync
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Docs: http://127.0.0.1:8000/docs

From the repository root you can run **`make dev`** (API + Next.js) or **`make dev-backend`** (API only).
