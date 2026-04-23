# Document AI setup (MyTax+ Module 1)

This repo uses **Google Cloud Document AI** processors to extract structured data from:

- **EA forms**: **Custom Document Extractor** (Document AI Workbench) — label **Name** values must match the `id` fields in [`ea-form-schema-fields.json`](../ea-form-schema-fields.json) at the repo root (returned as `entity.type` in API responses).
- **Receipts** (Receipt/Invoice processor)

## Create processors (Google Cloud Console)

- **Enable APIs**
  - Document AI API

- **Create processors**
  - **Receipt**: pick a prebuilt processor suitable for receipts (or Invoice if that's what you have).
  - **EA form**: create a **Custom extractor** in [Document AI Workbench](https://console.cloud.google.com/ai/document-ai/workbench), define the schema (same field ids as `ea-form-schema-fields.json`), import labeled samples, train, and deploy. Set `DOCAI_EA_PROCESSOR_ID` to that processor’s ID.

Record the **processor IDs** for both. Note the **region** where each processor lives (for example `us`, `asia-southeast1`); it must match `DOCAI_LOCATION` below.

## Cloud Run service account permissions

If your Next.js app runs on Cloud Run, the runtime service account must have:

- `Document AI API User` (or equivalent permission to `documentai.processors.processOnline`)
- `Storage Object Viewer` for the Firebase Storage bucket (to download uploaded documents)
- `Storage Object Creator` for the same bucket (to write raw extraction payloads under `users/{uid}/documents_raw/…`)
- Firestore access (typically via Firebase Admin / default service account permissions; if locked down, grant the needed Firestore roles)

## Server environment variables

Set these env vars for the Next.js server (Cloud Run env vars or local `frontend/.env.local`):

- `GOOGLE_APPLICATION_CREDENTIALS` (recommended for local dev)
  - Absolute path to a **service account JSON** key file that has Document AI (and Firebase Admin) access on your GCP project.
  - Example (WSL/Linux): `/home/you/.config/mytaxplus/google-sa.json`
  - When this is set, `frontend/src/server/shared/firebase-admin.ts` uses **Application Default Credentials** from that file, so Document AI and Firebase Admin share the same identity.
  - Do **not** commit key files. Prefer a path under `~/.config/…` or a repo-local `.secrets/` directory listed in `.gitignore`.

- `FIREBASE_STORAGE_BUCKET` (optional but recommended)
  - Example: `mytaxplus-a273b.appspot.com`
  - Used by `frontend/src/server/shared/firebase-admin.ts` to set the default bucket for Admin SDK storage access.

- `DOCAI_PROJECT_ID` (required)
  - Your Google Cloud project id (same project as Firebase typically).
- `DOCAI_LOCATION` (optional; default: `us`)
  - Must match the **region** of your Document AI processors. If the processor was created in `eu`, set `DOCAI_LOCATION=eu`.
- `DOCAI_RECEIPT_PROCESSOR_ID` (required for receipts)
- `DOCAI_EA_PROCESSOR_ID` (required for EA forms)

Alternative local auth (no JSON path):

- **ADC**: `gcloud auth application-default login` (uses your user credentials; less ideal for teams than a shared service account file).

If you do **not** set `GOOGLE_APPLICATION_CREDENTIALS`, Firebase Admin can still use explicit `FIREBASE_*` env vars, while `@google-cloud/documentai` falls back to ADC — which can cause confusing “Storage works, Document AI fails” behaviour. Prefer one credential path for both.

## Where it’s used in code

- Processor routing + persistence:
  - `frontend/src/server/services/documents/document-processing.service.ts`
- Document AI client wrapper (normalizes responses for downstream code):
  - `frontend/src/server/dal/documents/document-ai.dal.ts`
    - Persists `text`, `entities` (custom extractors), **`kvPairs`** from Form Parser `pages[].formFields[]` (key/value text resolved via `textAnchor` + full-document `text`).
- Schema-driven extractors (EA + receipt):
  - `frontend/src/server/services/documents/extractors/` — `registry.ts` dispatches by `documentType`; **EA reads `entities` first** (Custom Extractor field ids); `kvPairs` may still be present for legacy/debug. Receipts use entity types from the receipt/invoice processor.

## Raw extraction artifacts

Successful runs gzip JSON (including `entities`, `kvPairs`, `text`) to Storage at `users/{uid}/documents_raw/{documentId}.docai.json.gz` for debugging and replay.

## Tax profile aggregation (EA)

Employment income in the profile prefers the field id `total_sum_section_b_and_c` when present (per document), so line-item income rows are not double-counted with the Section B+C total. See `EA_WORKBENCH_INCOME_TOTAL_ID` in `frontend/src/server/services/documents/extractors/ea-form.schema.ts`.
