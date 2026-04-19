# MyTax+ local stack (no Docker): FastAPI (uv) + Next.js (npm).
# Ports: Next.js http://localhost:3000 — FastAPI http://localhost:8000 — API docs http://localhost:8000/docs
#
# Prerequisites: uv, Node.js/npm, Python 3.12+ for the backend venv via uv.
# Primary workflow: `make dev` (install + run both servers), `make dev-down` (stop processes on 3000/8000).

ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))

.PHONY: setup dev dev-down dev-backend dev-frontend _ensure-env _free-port local

_ensure-env:
	@test -f $(ROOT)/frontend/.env.local || (echo "[mytax+] creating frontend/.env.local from .env.example" && cp $(ROOT)/frontend/.env.example $(ROOT)/frontend/.env.local)
	@test -f $(ROOT)/backend/.env || (echo "[mytax+] creating backend/.env from .env.example" && cp $(ROOT)/backend/.env.example $(ROOT)/backend/.env)

setup: _ensure-env
	@echo "[mytax+] setup: syncing Python deps (backend)..."
	cd $(ROOT)/backend && uv sync
	@echo "[mytax+] setup: installing Node dependencies (frontend)..."
	cd $(ROOT)/frontend && npm install
	@echo "[mytax+] setup: done."

# Run FastAPI + Next.js in one terminal; Ctrl+C stops both child processes.
dev: _ensure-env
	@echo "[mytax+] dev: syncing backend (uv)..."
	cd $(ROOT)/backend && uv sync
	@test -d $(ROOT)/frontend/node_modules || (echo "[mytax+] dev: first run — installing frontend dependencies..." && cd $(ROOT)/frontend && npm install)
	@echo "[mytax+] dev: starting FastAPI (8000) + Next.js (3000). Press Ctrl+C to stop both."
	@echo "[mytax+] dev:   • API docs → http://localhost:8000/docs"
	@echo "[mytax+] dev:   • Web UI  → http://localhost:3000"
	@cd $(ROOT) && bash -c '\
	  (cd backend && uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000) & \
	  PID_API=$$!; \
	  (cd frontend && npm run dev -- --hostname 127.0.0.1 --port 3000) & \
	  PID_WEB=$$!; \
	  trap "echo \"\"; echo \"[mytax+] dev: shutting down...\"; kill $$PID_API $$PID_WEB 2>/dev/null; exit 0" INT TERM; \
	  wait $$PID_API $$PID_WEB'

dev-backend:
	@echo "[mytax+] dev-backend: FastAPI only → http://127.0.0.1:8000/docs"
	cd $(ROOT)/backend && uv sync && uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

dev-frontend:
	@echo "[mytax+] dev-frontend: Next.js only → http://127.0.0.1:3000"
	cd $(ROOT)/frontend && npm install && npm run dev -- --hostname 127.0.0.1 --port 3000

# Kill whatever is listening on dev ports (after Ctrl+C fails or stray processes).
dev-down:
	@echo "[mytax+] dev-down: freeing host ports 3000 and 8000..."
	@$(MAKE) _free-port PORT=3000
	@$(MAKE) _free-port PORT=8000
	@echo "[mytax+] dev-down: finished."

_free-port:
	@if command -v lsof >/dev/null 2>&1; then \
	  if lsof -ti :$(PORT) >/dev/null 2>&1; then \
	    echo "[mytax+] dev-down: port $(PORT) still bound — SIGTERM..."; \
	    lsof -ti :$(PORT) | xargs kill 2>/dev/null || true; \
	    sleep 0.4; \
	    if lsof -ti :$(PORT) >/dev/null 2>&1; then \
	      echo "[mytax+] dev-down: port $(PORT) still bound — SIGKILL..."; \
	      lsof -ti :$(PORT) | xargs kill -9 2>/dev/null || true; \
	    fi; \
	    echo "[mytax+] dev-down: port $(PORT) released."; \
	  else \
	    echo "[mytax+] dev-down: port $(PORT) already free."; \
	  fi; \
	else \
	  echo "[mytax+] dev-down: lsof not found — cannot verify port $(PORT)."; \
	fi

local: dev
