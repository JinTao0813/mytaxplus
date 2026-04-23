# MyTax+ local stack (no Docker): Next.js app + route handlers.
# Port: Next.js http://localhost:3000 (UI + API)
#
# Prerequisites: Node.js/npm.
# Primary workflow: `make dev` (run app), `make dev-down` (stop process on 3000).

ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))

.PHONY: setup dev dev-down dev-frontend _ensure-env _free-port local

_ensure-env:
	@test -f $(ROOT)/src/.env.local || (echo "[mytax+] creating src/.env.local from .env.example" && cp $(ROOT)/src/.env.example $(ROOT)/src/.env.local)

setup: _ensure-env
	@echo "[mytax+] setup: installing Node dependencies (src)..."
	cd $(ROOT)/src && npm install
	@echo "[mytax+] setup: done."

# Run Next.js app (UI + API route handlers).
dev: dev-down _ensure-env
	@test -d $(ROOT)/src/node_modules || (echo "[mytax+] dev: first run — installing src dependencies..." && cd $(ROOT)/src && npm install)
	@echo "[mytax+] dev: starting Next.js (3000)."
	@echo "[mytax+] dev:   • Web UI  → http://localhost:3000"
	@echo "[mytax+] dev:   • API     → http://localhost:3000/api/v1/*"
	cd $(ROOT)/src && npm run dev -- --webpack --hostname 127.0.0.1 --port 3000

dev-frontend:
	@echo "[mytax+] dev-frontend: Next.js only → http://127.0.0.1:3000"
	cd $(ROOT)/src && npm install && npm run dev -- --webpack --hostname 127.0.0.1 --port 3000

# Kill whatever is listening on dev port (after Ctrl+C fails or stray process).
dev-down:
	@echo "[mytax+] dev-down: freeing host port 3000..."
	@if [ -f "$(ROOT)/src/.next/dev/lock" ]; then \
	  PID=$$(node -p "try{JSON.parse(require('fs').readFileSync('$(ROOT)/src/.next/dev/lock','utf8')).pid}catch(e){''}"); \
	  if [ -n "$$PID" ]; then \
	    echo "[mytax+] dev-down: stopping Next.js dev PID $$PID (from .next/dev/lock)..."; \
	    kill $$PID 2>/dev/null || true; \
	    sleep 0.4; \
	    kill -9 $$PID 2>/dev/null || true; \
	  fi; \
	  rm -f "$(ROOT)/src/.next/dev/lock"; \
	fi
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
