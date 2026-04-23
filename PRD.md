# Product Requirements Document (PRD)

## Project: MyTax+ — AI Personal Tax Agent

---

## 1. Product Overview

MyTax+ is an AI-powered tax assistant that helps individuals:

- Understand their tax situation
- Maximize eligible tax reliefs
- Prepare a filing-ready relief claim pack (with evidence)

It goes beyond Q&A by automatically extracting, analyzing, and generating actionable outputs such as tax summaries, recommendations, and filing-ready data.

---

## 2. Target Users

- First-time taxpayers
- University graduates / young professionals
- Busy working adults
- Individuals unfamiliar with tax reliefs

---

## 3. Core Value Proposition

"Upload your documents → Get the best relief claims (with evidence) → File with confidence"

---

## 4. Core Features (MVP Focus)

Must-build features:

1. Document Upload & Parsing (EA + Receipts)
2. Relief Claim Planner (Receipt → Relief mapping + cap enforcement)
3. Evidence-backed Relief Pack Export (filing-ready summary + checklist)

---

## 5. System Modules + Acceptance Criteria

### UI/UX changes (to match updated modules)

The new MVP prioritizes a **fast, linear flow**: upload → Gemini suggestions → user confirmation → reliefs dashboard → export pack. This requires a first-class “receipt mapping review queue” and removal of always-on assistant side panels.

- **Global UI policy**
  - Remove any persistent “AI assistant” side panels / chat widgets embedded in pages (e.g., upload dashboard side assistant).
  - Keep AI conversation only on the dedicated **AI Assistant page** (Module 6).
  - Allow only lightweight **inline help** in-flow (tooltips, small callouts, “Why?” links) that do not behave like a full chat assistant.

- **New first-class UI surface: Receipt Mapping Inbox / Review Queue**
  - A dedicated screen (or modal flow) where users review receipts that are:
    - waiting for Gemini classification
    - classified with low confidence / `bestReliefId: null`
    - classified but not yet confirmed (if confirmation is required)
    - failed due to Gemini error/timeouts (no regex fallback)
  - Core interactions:
    - View receipt preview + extracted fields (vendor/date/amount)
    - See Gemini suggestion + confidence + rationale + alternatives
    - Pick a `reliefId` from the closed YA catalog, then **Confirm**
    - Retry Gemini classification for a receipt (Gemini-only retry)
    - Batch actions (optional): “Accept all above confidence threshold”

- **Upload page changes**
  - Replace “AI ledger analysis” side assistant panel with:
    - a “Receipt mapping status” summary (e.g., Confirmed / Needs review / In progress)
    - a prominent action: **Review receipts (N)** to open the mapping inbox
  - For each uploaded receipt, show a mapping status chip:
    - “Classifying”
    - “Suggested”
    - “Needs review”
    - “Confirmed”

- **Reliefs page changes**
  - Reframe copy from “optimisation” to “claim planning”.
  - Add a top banner when receipts are pending review: **“N receipts need mapping”** → link to mapping inbox.
  - Ensure claim rows shown are evidence-backed and traceable; treat unconfirmed suggestions as “pending” until confirmed.

### Module 1: Document Ingestion & Parsing

**Description**  
Users upload tax-related documents:

- EA form
- Receipts (images/PDF)

**Features**

- File upload (image/PDF)
- AI extraction of structured data (Document AI)
- Receipt relief mapping via **Gemini** + YA catalog (not regex); EA remains structured field extraction

**Acceptance Criteria**

- User can upload at least 1 EA form and 1 receipt
- System extracts:
  - Income fields (salary, PCB, etc.)
  - Expense amount and type
- Extracted data is displayed in structured format
- System handles at least 3 categories:
  - Medical
  - Education
  - Lifestyle

**Implementation details (what to build)**

- **Document types**
  - **EA form**: employment income + statutory deductions (EPF, SOCSO) + PCB/MTD.
  - **Receipts**: line-item or total amount, vendor, date; optional structured fields for downstream matching (see Module 3).
- **Storage + metadata**
  - Store original files in **Firebase Storage**.
  - Persist document metadata in **Firestore** (user id, document type, processing status, createdAt, storage path, optional preview URL).
- **Extraction output (canonical rows)**
  - Persist extraction rows (per document) in Firestore with at least:
    - `documentId`, `category`, `label`, `amount`, optional `date`, `vendor`
    - for receipts: optional `reliefId` (canonical, after user confirm or auto-accept), optional `reliefBucket` / `subcapId` for pooled/sub-capped reliefs; optional **Gemini suggestion** fields (e.g. `suggestedReliefId`, `confidence`, `rationale`, `alternatives`) stored for audit and UI review
    - `sourceFieldId` for EA fields (so we can reliably compute totals and statutory fields).
- **User-facing review (“workbench”)**
  - Show parsed EA values in a structured grid (Section B/C totals, EPF/SOCSO, PCB/MTD).
  - Show receipts as a list with extracted totals + vendor/date and the proposed relief mapping.
  - Let user correct: amount, date, vendor, category/relief mapping, and optionally split a receipt across multiple reliefs.

**Acceptance Criteria (expanded)**

- **Upload**: user can upload multiple EA/receipts; each gets a processing status (queued → processed / failed).
- **Traceability**: every extracted row links back to a document and a preview (so user can verify evidence).
- **Correction loop**: user can edit incorrect fields and re-run relief analysis without re-uploading.
- **Receipt-to-relief hinting**: after OCR/structured extraction, the system calls **Gemini** with the **YA relief catalog** (allowed `reliefId`s + short eligibility text) and persists structured suggestions on each receipt row. **Do not** use regex or keyword heuristics to infer `reliefId` (see **Implementation delta** below).

---

### Module 2: Tax Context Builder (Normalization)

**Description**  
Normalizes extracted EA + receipt data into a consistent “tax context” used by the relief planner.

**Features**

- Aggregate income totals (from EA)
- Aggregate statutory fields (EPF/SOCSO/PCB-MTD) for reference
- Minimal user inputs that affect rule enforcement (e.g., YA, property price when applicable)

**Acceptance Criteria**

- Total income is calculated deterministically from EA extraction rows
- Statutory values (EPF/SOCSO/PCB-MTD) are available as reference fields
- User can correct extracted values at the source (document rows) and see relief analysis update
- Every displayed number can be traced back to a document row

**Implementation details (what to build)**

- **Tax context fields (minimum viable)**
  - **Income**: total income + income item list (from EA).
  - **Statutory reference**: EPF, SOCSO, PCB/MTD (from EA; reference only).
  - **Parameters for rule enforcement**: YA, optional property price, and any other fields required by a rule cap condition.
- **Derivation rules**
  - Prefer the EA document that contains “Section B+C total income” when multiple EAs exist.
  - When multiple documents exist, deterministic ordering (newest-first) so totals are stable.
- **Editing**
  - Prefer **extraction edits** (source-of-truth corrections tied to a document).
  - Optional: cache a normalized snapshot for faster loading, but always retain traceability to source rows.

**Acceptance Criteria (expanded)**

- **Multi-document support**: if user uploads more than one EA/receipt, the tax context remains deterministic.
- **Auditability**: user can see “where a number came from” (document + field/row).
- **Persisted snapshot (optional)**: tax context can be saved and reloaded without reprocessing every time.

---

### Module 3: Relief Claim Planner (Receipt → Relief mapping)

**Description**  
Core intelligence layer that converts receipts into the best set of valid relief claims (with caps enforced and evidence preserved).

**Features**

- Suggest relief mapping per receipt (and allow split across reliefs when needed)
- Apply caps/pools/subcaps (effective claim totals)
- Identify missing/uncertain receipts (needs user confirmation)

**Acceptance Criteria**

- System identifies at least 5 relief categories
- Correctly enforces caps/pools/subcaps for those categories
- Displays:
  - Proposed claims (draft)
  - Confirmed claims (approved by user)
  - Unassigned / uncertain receipts (needs review)
- Provides at least 1 “next best action” suggestion (e.g., map unassigned receipts, fill missing property price)

**Implementation details (what to build)**

- **Relief rules registry (Year of Assessment)**
  - Maintain a structured catalog of relief rules by YA (e.g., YA 2025), including:
    - relief `id`, display name, description, max cap, and limit logic (simple cap, pooled cap, conditional cap).
  - Expose a debug endpoint for raw rules by year.
  - This catalog is the **single source of allowed relief IDs** passed into Gemini (no invented categories).

- **Gemini-assisted receipt → relief matching (suggest; rules finalize)**
  - **Input to Gemini** (per receipt or batch):
    - Extracted fields: vendor, date, amount, line items / description text, document preview reference if useful.
    - **Closed set**: JSON list of allowed reliefs for the selected YA, each with `reliefId`, title, one-line “what qualifies”, and cap/pool summary where relevant.
  - **Output from Gemini** (strict structured JSON, validated with Zod or equivalent):
    - `bestReliefId`: must be `null` or one of the provided `reliefId`s (never a free-text category).
    - `confidence` (e.g. 0–1), `rationale` (short), optional `alternatives[]` with same constraint.
    - Optional `reliefBucket` / `subcapId` when the rule engine uses pooled caps.
    - Optional `split[]` only if product supports splitting one receipt across multiple reliefs.
  - **Prompt guardrails**
    - “Only choose from the provided `reliefId` list; if uncertain, return `bestReliefId: null` and ranked alternatives.”
    - “Do not invent reliefs or legal advice beyond the supplied descriptions.”
  - **Separation of concerns**
    - **Gemini**: interpretation + best-effort assignment to a canonical `reliefId` (or “needs review”).
    - **Rules engine** (`analyzeReliefs`, registry): **deterministic** cap/pool enforcement and effective totals; same claims in → same capped totals out.
  - **Persistence & UX**
    - Store suggestions on extraction rows; treat `reliefId` as **draft** until user confirms (or auto-accept above a configurable confidence threshold, if desired).
    - Backfill to Firestore relief claims only when a row has a **final** `reliefId` (today’s behavior); optionally add a “Apply suggestions” bulk action.

- **Failure handling — no regex fallback**
  - If the Gemini API fails, times out, or returns invalid/unparseable JSON: **do not** fall back to `classifyReceiptForRelief` (regex/heuristics) or any other automatic keyword mapper.
  - Required behavior instead:
    - Mark the receipt (or extraction row) as **needs relief mapping** with a visible reason (e.g. `gemini_error`, `gemini_invalid_response`, `timeout`).
    - Surface the receipt in the **review queue** so the user picks a `reliefId` from the closed YA catalog (or retries Gemini manually / via “Retry classification”).
    - Optionally support **automatic retry with backoff** (still Gemini-only); still no regex on failure.
  - Rationale: silent regex fallback produces confident-looking wrong claims and undermines trust; explicit human or retry is preferable.

- **Relief catalog UI**
  - Show relief categories as a checklist/dashboard:
    - **Status**: missed / partial / claimed (based on current claimed amount vs cap).
    - **Cap**: max allowable claim for that relief (and pooled/subcap explanations where applicable).
    - **Evidence**: list claim lines with vendor/date/amount and linked receipt preview when available.
- **Claims data model (user-entered + receipt-derived)**
  - Each relief contains **claim records** (line items) with:
    - amount, date, vendor, optional `documentId` + preview URL
    - optional `extractionId` (idempotency + traceability for auto-import from receipts)
    - optional `reliefBucket` / `subcapId` (for pooled reliefs like EPF + life insurance pools).
  - Persist claims per user per year in Firestore.
- **Auto-backfill from receipt extractions**
  - When a receipt extraction row has a **final** `reliefId` (after Gemini suggestion + user confirm, or direct user pick), auto-create a missing claim record (idempotent) so uploaded receipts become draft claims.
- **Engine enforcement**
  - Apply caps and limit logic during analysis so UI always shows **capped totals** (not just raw sums).
  - Keep both:
    - **raw totals** (sum of claim rows)
    - **effective claim** (after caps) used for chargeable income preview (MVP); tax payable is out of scope.
- **“Optimization suggestions” (MVP)**
  - Recommend actions the user can take based on gaps, e.g.:
    - “You have RM X receipts in lifestyle but only RM Y is mapped; review unassigned receipts.”
    - “Your pooled EPF/life insurance pool is under-capped; add life insurance premium receipt if any.”
    - “This relief requires additional info (e.g., property price) to cap correctly—prompt user to fill it.”

**Acceptance Criteria (expanded)**

- **At least 5 relief categories live** with real cap enforcement.
- **Receipt-derived claims appear automatically** after a receipt has a final `reliefId` (and do not duplicate on refresh).
- **Gemini**: each processed receipt either gets a confident `bestReliefId`, explicit alternatives, or “needs review” with rationale.
- **No silent heuristic mapping**: regex/keyword classifiers are **not** used for receipt → `reliefId` in the target architecture (including on Gemini failure).
- **Explainability**: each relief shows “why capped” (cap value, pool/subcap allocation if used).

---

### Implementation delta (current codebase → target specification)

This section documents what exists **today** vs what the PRD requires **next**, so engineering work is explicit.

| Area                  | Current implementation (post-refactor)                                                                                                                                                                                                      | Target (per this PRD) — status                                                                                                                                                                                                                                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Receipt → `reliefId`  | Extraction stores vendor/date/amount; **Gemini** suggestion in `suggest-receipt-mappings.ts`; mapping status + errors persisted; **confirm** sets final `reliefId` via `/api/v1/receipts/review/.../confirm`.                                  | Aligns with PRD: closed catalog, human confirm, no regex fallback.                                                                                                                                                                                                                                                                                      |
| Claim creation timing | Claims upsert from **confirmed** receipt mappings only (review service + sync).                                                                                                                                                             | Aligns with PRD.                                                                                                                                                                                                                                                                                                                                         |
| Gemini                | Wired for receipt suggestion; failures surface as `gemini_error` / `needs_review` with error codes.                                                                                                                                         | Aligns with PRD (retry + queue).                                                                                                                                                                                                                                                                                                                         |
| API / Gemini errors   | Review queue + retry endpoints live under `/api/v1/receipts/review/*`.                                                                                                                                                                        | Aligns with PRD.                                                                                                                                                                                                                                                                                                                                         |
| Tax context             | Normalized snapshot via `GET /api/v1/tax-context`; Reliefs UI consumes via `lib/api` where session present.                                                                                                                                  | Continue expanding traceability UI (source row links) as needed.                                                                                                                                                                                                                                                                                       |

---

### Module 4: Impact Preview (optional for MVP)

**Description**  
Shows the immediate effect of relief claims on chargeable income (without estimating final tax payable).

**Features**

- Compute:
  - Chargeable income
  - Total effective relief claimed (after caps)

**Acceptance Criteria**

- Chargeable income preview updates when claims change
- Clearly labels what is shown (income, effective relief totals, chargeable income)
- Updates dynamically when inputs change

**Implementation details (what to build)**

- **Chargeable income**
  - Compute \( \text{chargeableIncome} = \max(0, \text{totalIncome} - \sum(\text{effectiveReliefClaims})) \).
  - Show a “preview” number that updates immediately when claims change.
- **Two scenarios**
  - Optional: show “before vs after claims” for chargeable income only (no tax payable).
- **UI**
  - Top summary: total income, effective relief total, chargeable income, MTD/PCB reference.
  - Optional comparison card: baseline vs current (chargeable income only).

**Acceptance Criteria (expanded)**

- **Deterministic**: same relief claims and income produce the same chargeable income preview (relief caps are rule-based, not LLM-based).
- **Real-time**: recalculates on claim edits without a page refresh.
- **Clear definitions**: labels distinguish “chargeable income” and “MTD/PCB” reference (no tax payable shown in MVP).

---

### Module 5: Evidence-backed Relief Pack Export (MVP deliverable)

**Description**  
Produces a filing-ready relief summary and evidence pack the user can copy into LHDN e-Filing.

**Features**

- Filing-ready relief summary (effective totals per relief category)
- Evidence list per relief (receipts/EA references)
- Checklist of missing/ambiguous items that block confident claiming

**Acceptance Criteria**

- Displays structured “filing-ready” relief summary (per relief + effective totals)
- Highlights missing data fields / unassigned receipts
- Output can be exported (text first; PDF optional)

**Implementation details (what to build)**

- **Filing-ready packet (exportable)**
  - A structured output the user can follow while filing on LHDN e-Filing:
    - income totals (from EA)
    - list of relief categories with **effective claim totals** (capped)
    - per-relief evidence list (receipt links) for audit readiness
    - notes on assumptions and fields the user must confirm (e.g., YA, residency, marital status).
- **Checklist & prompts**
  - Detect missing or ambiguous items and prompt for them:
    - YA selection
    - marital status / spouse relief eligibility (if in scope)
    - property price (if required by a property-related relief cap rule)
    - any receipt without date/vendor/amount.
- **User guidance**
  - Provide an ordered sequence:
    - “Confirm EA totals” → “Review claims” → “Resolve missing items” → “Export summary”.

**Acceptance Criteria (expanded)**

- **Every number in the export is traceable** back to either EA fields or receipt claim lines.
- **No black-box**: export includes a short “How we computed this” section (caps, pooling).

---

### Module 6: AI Assistant (Conversational Layer)

**Description**  
User can ask tax-related questions

**Features**

- Q&A using RAG (tax rules)
- Context-aware responses based on user profile

**UI/UX constraints**

- AI assistant exists only on the dedicated assistant page (e.g., `/chat`).
- Other pages must not include a persistent assistant panel; use inline guidance instead.

**Acceptance Criteria**

- Answers at least 3 types of queries:
  - "What reliefs can I claim?"
  - "Why is my tax high?"
  - "How to reduce tax?"
- Uses user data in responses
- Grounded in tax dataset (avoids hallucination)

**Implementation details (what to build)**

- **Modes**
  - **Explain**: answer questions using the user’s profile + claims (numbers-first).
  - **Plan**: propose next-best actions to maximize reliefs based on uploaded receipts and missing categories.
  - **Verify**: help user validate a claim (“does this receipt count?”) with citations to the rules.
- **Inputs to the assistant**
  - Current YA, user profile totals, relief catalog + claimed lines, and a list of “unassigned / uncertain” receipts.
- **Outputs**
  - A prioritized action list (e.g., “Map these 3 receipts to lifestyle”, “Add EPF bucket split”, “Fill property price”).
  - Short explanations with references to the rule definitions used in the engine.

**Acceptance Criteria (expanded)**

- **Grounding**: assistant responses must cite which relief rule/cap it is using (by rule id/name) and never invent new categories.
- **Actionability**: each answer must end with a concrete next step the user can do in the UI.

---

## 6. Tech Stack

| Layer          | Technology             | Purpose                                                          | Notes                                                  |
| -------------- | ---------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| Frontend       | Next.js (TypeScript)   | UI + API routes                                                  | Fullstack capability                                   |
| UI Styling     | Tailwind CSS + shadcn  | Fast UI components                                               | Recommended                                            |
| Authentication | Firebase Auth          | User authentication                                              | Easy integration                                       |
| Database       | Firestore              | Store tax profiles                                               | NoSQL                                                  |
| Storage        | Firebase Storage       | Store documents                                                  | EA forms and receipts                                  |
| API Layer      | Next.js Route Handlers | Handle requests                                                  | Single entry point                                     |
| AI Processing  | Node.js + Document AI  | Parsing and calculations                                         | Implemented in Next.js                                 |
| Agent Layer    | Genkit (Node.js)       | Workflow orchestration                                           | Important for evaluation                               |
| RAG            | Vertex AI Search       | Tax knowledge base                                               | Grounding                                              |
| Hosting        | Cloud Run              | Fullstack deployment                                             | Scalable                                               |
| AI Model       | Gemini API             | Receipt → relief suggestions (closed `reliefId` set) + reasoning | Rules engine enforces caps; Gemini does not replace it |
| PDF Export     | Node.js                | Generate reports                                                 | Optional                                               |

### Current Implementation Status

- **Real data modules (live):**
  1. Module 1: Document Ingestion & Parsing (real Firebase Storage + Firestore + Document AI)
  2. Module 2: Tax Context Builder (normalization from extracted data)
- **Partially implemented (real, evolving):**
  1. Module 3: Relief Claim Planner
     - Relief rules registry by YA
     - Relief catalog generation + cap enforcement
     - Persisted relief claim records (per user/year)
     - Auto-backfill: receipt extractions → relief claim rows only after **confirmed** receipt → relief mapping (idempotent)
     - API endpoints: list reliefs, analyze relief caps, list rules (debug), **receipt mapping review** (`/api/v1/receipts/review/*`)
     - **Receipt → relief:** Gemini suggestion pass (closed YA catalog) + persisted suggestion fields; **no regex fallback** on failure; user confirm/clear/retry via review queue.
     - **Frontend:** Upload shows receipt mapping status + link to **Receipt mapping inbox** (`/receipts/review`); Reliefs page surfaces pending mapping count and uses **tax context** (`GET /api/v1/tax-context`) for income/statutory display where available.
  2. Module 4: Impact Preview
     - Chargeable income preview (income minus capped relief totals)
     - UI summary components for “income vs chargeable” context
- **Not yet implemented (planned):**
  1. Module 5: Evidence-backed export + checklist
  2. Module 6: Conversational assistant (grounded Q&A + action planning) — **dedicated `/chat` UI exists**; full RAG-grounded behaviour still planned

---

## 7. User Flow (End-to-End)

1. User uploads EA form and receipts
2. AI extracts and structures data
3. Tax context is normalized (income + statutory reference + parameters for caps)
4. Gemini proposes receipt → `reliefId` matches (from the YA catalog only); rules engine enforces caps and effective totals
5. User reviews: confirm claims, fix uncertain receipts, fill missing parameters
6. User receives:
   - Filing-ready relief pack (effective totals + evidence)
7. User asks follow-up questions

---

## 8. Demo (What Judges Will See)

- Upload leads to instant AI parsing
- Display of income and expenses
- Gemini-driven receipt → relief (`reliefId`) suggestions from the closed YA catalog, with user review where needed
- Caps enforced + clear “effective claim” totals per relief category
- Exportable filing-ready relief pack + checklist of missing/uncertain items

---

## 9. Scope Control

**Focus on:**

- 3 to 5 relief categories
- Evidence-backed claim planning from receipts (mapping + caps)
- Clean and smooth demo flow

**Avoid:**

- Full tax law coverage
- Real integration with LHDN
- Overcomplicated UI
- **Regex or keyword heuristics as fallback** when Gemini fails or errors (use explicit user mapping + retry instead)

---

## 10. Future Enhancements

- Bank integration for automatic expense tracking
- Multi-year tax planning
- Business tax support
- Real tax submission integration
- Estimated tax payable / refund computation (nice-to-have, not MVP)

---

## Final Notes

Delivering these six modules cleanly provides:

- A complete end-to-end product story
- A clear AI-to-action pipeline
- Strong real-world applicability
