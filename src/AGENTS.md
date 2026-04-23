<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:frontend-design-rules -->

# MyTax+ Frontend Coding Standards

## 1. CSS Token Naming

- All design system tokens use **bare semantic names** — no prefixes (no `ds-`, no `app-`).
- Variable names follow Material Design convention: `--surface`, `--on-surface`, `--surface-container-high`, `--tertiary-container`, etc.
- All tokens are defined in `app/globals.css` under `:root` and wired into `@theme inline` as `--color-*`.
- To use a token in JSX, use the matching Tailwind utility (e.g. `bg-surface`, `text-on-surface`, `text-secondary`).

## 2. No Inline Hex or RGBA Values

**Never** hardcode hex or rgba values directly in component files.

Bad:

```tsx
<div className="bg-[#4059aa] text-[#111c2d]">
```

Good:

```tsx
<div className="bg-secondary text-on-surface">
```

The complete token → utility mapping is:

| Token                         | Tailwind utility                       |
| ----------------------------- | -------------------------------------- |
| `--surface`                   | `bg-surface`                           |
| `--surface-container-lowest`  | `bg-surface-container-lowest`          |
| `--surface-container-low`     | `bg-surface-container-low`             |
| `--surface-container`         | `bg-surface-container`                 |
| `--surface-container-high`    | `bg-surface-container-high`            |
| `--surface-container-highest` | `bg-surface-container-highest`         |
| `--on-surface`                | `text-on-surface`                      |
| `--on-surface-variant`        | `text-on-surface-variant`              |
| `--secondary`                 | `bg-secondary` / `text-secondary`      |
| `--secondary-foreground`      | `text-secondary-foreground`            |
| `--on-primary-container`      | `bg-on-primary-container` (Amber CTA)  |
| `--on-primary-fixed`          | `text-on-primary-fixed`                |
| `--tertiary-container`        | `bg-tertiary-container` (Dark green)   |
| `--on-tertiary-container`     | `text-on-tertiary-container` (Emerald) |
| `--tertiary-fixed`            | `bg-tertiary-fixed` (Mint green)       |
| `--on-error-container`        | `text-on-error-container`              |
| `--error-container`           | `bg-error-container`                   |
| `--outline-variant`           | `border-outline-variant`               |
| `--outline`                   | `text-outline`                         |

For ghost borders and ambient shadows, use the custom utilities `.ghost-border`, `.ambient-shadow`, `.ambient-shadow-md`, `.ambient-shadow-lg` instead of arbitrary shadow values.

## 3. Server / Client Component Split Strategy

- **Page files** (`page.tsx`) must be **server components** (async, no `'use client'`).
  - Call service functions directly (`await getDashboardStatus()`).
  - Pass fetched data as props to client components.
- **Interactive sub-components** live in `_components/` collocated next to their page:
  ```
  app/(app)/dashboard/
    page.tsx                ← Server (async)
    _components/
      header-actions.tsx    ← 'use client' — has onClick
      status-hero-card.tsx  ← Server — display only
  ```
- Add `'use client'` **only at the lowest component** that actually needs it:
  - Has `useState`, `useEffect`, `useRef`, or other hooks
  - Has `onClick`, `onChange`, or any event handler passed as a prop
  - Uses browser APIs (drag events, `FileReader`, etc.)
- Display-only components (pure render, no state) must **not** have `'use client'`.

## 4. MatIcon Usage

- Always import `MatIcon` from `@/components/ui/mat-icon`.
- **Never** redefine `MatIcon` inline inside a component or page file.
- `MatIcon` is a server component; importing it does not force a component to become a client component.

```tsx
// ✅ Correct
import { MatIcon } from '@/components/ui/mat-icon'

// ❌ Wrong — don't copy-paste an inline function definition
function MatIcon({ name }: { name: string }) { ... }
```

## 5. No Brand Copy

- Do **not** use "Sovereign Ledger", "Sovereign AI", or any variation of this brand name anywhere in the UI.
- The product name is **MyTax+**. The AI assistant is **Ledger AI**.
<!-- END:frontend-design-rules -->
