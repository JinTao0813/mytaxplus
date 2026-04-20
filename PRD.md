# Product Requirements Document (PRD)

## Project: MyTax+ — AI Personal Tax Agent

---

## 1. Product Overview

MyTax+ is an AI-powered tax assistant that helps individuals:

- Understand their tax situation
- Maximize eligible tax reliefs
- Prepare and simulate tax filing

It goes beyond Q&A by automatically extracting, analyzing, and generating actionable outputs such as tax summaries, recommendations, and filing-ready data.

---

## 2. Target Users

- First-time taxpayers
- University graduates / young professionals
- Busy working adults
- Individuals unfamiliar with tax reliefs

---

## 3. Core Value Proposition

"Upload your documents → Get optimized tax results → File faster with confidence"

---

## 4. Core Features (MVP Focus)

Must-build features:

1. Document Upload & Parsing (EA + Receipts)
2. AI Tax Profile Builder
3. Relief Detection & Optimization Engine
4. Tax Summary Generator (Before vs After Optimization)
5. Filing Assistant (Step-by-step / Pre-filled simulation)

---

## 5. System Modules + Acceptance Criteria

### Module 1: Document Ingestion & Parsing

**Description**  
Users upload tax-related documents:

- EA form
- Receipts (images/PDF)

**Features**

- File upload (image/PDF)
- AI extraction of structured data
- Categorization of expenses

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

inputs:
EA form
receipts

Process:
inputs'
extract data from inputs -> categorises against official tax reliefs table
data types may include:
income fields
expense amount
category

outputs:
???

function for batch uploading documents
where to store documents

---

### Module 2: AI Tax Profile Builder

**Description**  
Transforms raw extracted data into a usable tax profile

**Features**

- Aggregate income
- Aggregate expenses by category
- Basic user profile (optional input: marital status, etc.)

**Acceptance Criteria**

- Total income is calculated correctly
- Expenses are grouped into categories
- Profile summary is displayed clearly
- User can edit or correct extracted values

---

### Module 3: Relief Detection & Optimization Engine

**Description**  
Core intelligence layer that matches user data to tax reliefs

**Features**

- Match expenses to eligible relief categories
- Apply limits (e.g., capped relief amounts)
- Detect missed opportunities

**Acceptance Criteria**

- System identifies at least 5 relief categories
- Correctly applies limits (e.g., RM caps)
- Displays:
  - Claimed reliefs
  - Missed reliefs
- Provides at least 1 optimization suggestion

---

### Module 4: Tax Calculation & Comparison Engine

**Description**  
Calculates estimated tax payable

**Features**

- Compute:
  - Chargeable income
  - Tax payable
- Compare:
  - Before optimization
  - After optimization

**Acceptance Criteria**

- Tax is calculated using a correct (simplified) formula
- Shows side-by-side comparison
- Displays estimated savings clearly
- Updates dynamically when inputs change

---

### Module 5: Filing Assistant (Simulation)

**Description**  
Guides user through tax filing

**Features**

- Pre-filled tax form simulation
- Step-by-step instructions
- Checklist of required information

**Acceptance Criteria**

- Displays structured "filing-ready" summary
- Provides at least 3 step-by-step instructions
- Highlights missing data fields
- Output can be exported (PDF or text summary)

---

### Module 6: AI Assistant (Conversational Layer)

**Description**  
User can ask tax-related questions

**Features**

- Q&A using RAG (tax rules)
- Context-aware responses based on user profile

**Acceptance Criteria**

- Answers at least 3 types of queries:
  - "What reliefs can I claim?"
  - "Why is my tax high?"
  - "How to reduce tax?"
- Uses user data in responses
- Grounded in tax dataset (avoids hallucination)

---

## 6. Tech Stack

| Layer          | Technology             | Purpose                  | Notes                    |
| -------------- | ---------------------- | ------------------------ | ------------------------ |
| Frontend       | Next.js (TypeScript)   | UI + API routes          | Fullstack capability     |
| UI Styling     | Tailwind CSS + shadcn  | Fast UI components       | Recommended              |
| Authentication | Firebase Auth          | User authentication      | Easy integration         |
| Database       | Firestore              | Store tax profiles       | NoSQL                    |
| Storage        | Firebase Storage       | Store documents          | EA forms and receipts    |
| API Layer      | Next.js API or FastAPI | Handle requests          | Choose one entry point   |
| AI Processing  | FastAPI (Python)       | Parsing and calculations | Core AI logic            |
| Agent Layer    | Genkit (Node.js)       | Workflow orchestration   | Important for evaluation |
| RAG            | Vertex AI Search       | Tax knowledge base       | Grounding                |
| Hosting        | Cloud Run              | Backend deployment       | Scalable                 |
| AI Model       | Gemini API             | Reasoning and extraction | Core intelligence        |
| PDF Export     | Python or Node         | Generate reports         | Optional                 |

---

## 7. User Flow (End-to-End)

1. User uploads EA form and receipts
2. AI extracts and structures data
3. Tax profile is generated
4. AI detects reliefs and optimizations
5. Tax is calculated (before vs after)
6. User receives:
   - Savings insights
   - Filing-ready summary
7. User asks follow-up questions

---

## 8. Demo (What Judges Will See)

- Upload leads to instant AI parsing
- Display of income and expenses
- Identification of missed reliefs
- Optimized tax calculation
- Filing guidance output

---

## 9. Scope Control

**Focus on:**

- 3 to 5 relief categories
- Simplified tax calculation
- Clean and smooth demo flow

**Avoid:**

- Full tax law coverage
- Real integration with LHDN
- Overcomplicated UI

---

## 10. Future Enhancements

- Bank integration for automatic expense tracking
- Multi-year tax planning
- Business tax support
- Real tax submission integration

---

## Final Notes

Delivering these six modules cleanly provides:

- A complete end-to-end product story
- A clear AI-to-action pipeline
- Strong real-world applicability
