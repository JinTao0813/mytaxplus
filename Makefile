# MyTax+ local stack (no Docker): Next.js app + route handlers.
# Port: Next.js http://localhost:3000 (UI + API)
#
# Prerequisites: Node.js/npm.
# Primary workflow: `make dev` (run app), `make dev-down` (stop process on 3000).

ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))

.PHONY: setup dev dev-down dev-frontend _ensure-env _free-port local

_ensure-env:
	@test -f $(ROOT)/frontend/.env.local || (echo "[mytax+] creating frontend/.env.local from .env.example" && cp $(ROOT)/frontend/.env.example $(ROOT)/frontend/.env.local)

setup: _ensure-env
	@echo "[mytax+] setup: installing Node dependencies (frontend)..."
	cd $(ROOT)/frontend && npm install
	@echo "[mytax+] setup: done."

# Run Next.js app (UI + API route handlers).
dev: _ensure-env
	@test -d $(ROOT)/frontend/node_modules || (echo "[mytax+] dev: first run — installing frontend dependencies..." && cd $(ROOT)/frontend && npm install)
	@echo "[mytax+] dev: starting Next.js (3000)."
	@echo "[mytax+] dev:   • Web UI  → http://localhost:3000"
	@echo "[mytax+] dev:   • API     → http://localhost:3000/api/v1/*"
	cd $(ROOT)/frontend && npm run dev -- --hostname 127.0.0.1 --port 3000

dev-frontend:
	@echo "[mytax+] dev-frontend: Next.js only → http://127.0.0.1:3000"
	cd $(ROOT)/frontend && npm install && npm run dev -- --hostname 127.0.0.1 --port 3000

# Kill whatever is listening on dev port (after Ctrl+C fails or stray process).
dev-down:
	@echo "[mytax+] dev-down: freeing host port 3000..."
	@$(MAKE) _free-port PORT=3000
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
