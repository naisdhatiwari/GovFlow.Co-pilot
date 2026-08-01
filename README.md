# GovFlow Copilot 🏛️✨
> **Next-Generation Civic Document Intake Platform & AI Caseworker Copilot**

GovFlow Copilot is a full-stack, enterprise-grade civic intake and caseworker automation portal. Built for state and municipal public sector agencies, it leverages **Gemini 1.5 Flash Vision**, **Local Regex PII Scrubbing**, a **4-Level AI Inspection Matrix**, and **DigiLocker e-KYC Fallback Overrides** to streamline intake submissions and eliminate manual casework bottlenecks.

---

## 📸 Key Features & Technical Highlights

### 1. 🛡️ Local PII Redaction & Privacy Engine
- Automatically masks sensitive citizen identifiers (National IDs, SSNs, Aadhaar numbers, Phone numbers, and Tax IDs) via local regex parsing before database persistence or API payload transmission.

### 2. 🤖 Gemini 1.5 Flash Vision & 4-Level Inspection Matrix
- **Level 1: Ingestion & Quality** — Evaluates scan resolution (DPI), tilt angles, lighting, and contrast.
- **Level 2: Photo Identity Match** — Validates facial vector alignment against national registries.
- **Level 3: Cross-Document Text Consistency** — Cross-checks applicant names, parcel numbers, and addresses against municipal GIS and tax databases.
- **Level 4: Policy & Subsidy Compliance** — Verifies eligibility criteria against active subsidy regulations.

### 3. 🟢 Confidence Badging & Threshold Rules
- 🟢 **Green Badge (Auto-Pass)**: Score $\ge 0.85$ (Ready for 1-click official issuance).
- 🟨 **Yellow Badge (Minor Review)**: $0.60 \le \text{Score} < 0.85$ (Handwriting or minor skew).
- 🔴 **Red Badge (Action Needed / Flagged)**: Score $< 0.60$ (Low confidence / photo mismatch).

### 4. 🔑 Mock e-KYC / DigiLocker Verification Fallback
- Solves the outdated ID photo mismatch edge case: If photo match or document confidence score is $< 0.60$, citizens receive a 1-click "Verify via DigiLocker e-KYC" trigger.
- Interactive OTP verification updates Level 2 Photo Identity status to `"Verified via DigiLocker"` and boosts confidence score to 🟢 0.95.

### 5. 🖥️ Split-Screen Caseworker Inspection Workspace
- Left Column: Interactive document viewer with zoom ($75\% - 250\%$), 90° rotation, and pan controls.
- Right Column:
  - 4-Level Inspection Matrix.
  - Field extraction table with dynamic confidence badges.
  - *"Why Gemini Flagged This"* accordion detailing AI reasoning.
  - 1-Click Action Bar (`"1-Click Approve & Issue Document"` + `"Generate Citizen Notice"` modal with pre-drafted Email & SMS templates).

### 6. 📊 Compliance & Audit Logs
- Tracks all civic actions in SQLite database (`govflow.db`).
- Features 1-click **Export Audit Log as CSV**.

---

## 🛠️ Tech Stack

- **Frontend (`/frontend`)**: Next.js 15 (App Router, React 19, TypeScript), Tailwind CSS, Lucide React Icons, Framer Motion, Recharts, Canvas-Confetti.
- **Backend (`/backend`)**: Python 3.11+ / 3.13 + FastAPI (`fastapi`, `uvicorn`), Google GenAI SDK (`google-genai` / `google-generativeai`), Pillow (`PIL`), Pydantic v2.
- **Database & Persistence**: SQLite (`sqlite3`) with rich regional seed data across Circle Offices (Zone 1 through Zone 4).

---

## 🚀 Quick Startup Instructions

### 1. Launch FastAPI Backend
```bash
cd backend

# Create & activate Python virtual environment
python -m venv venv
.\venv\Scripts\activate   # On Windows PowerShell

# Install requirements
pip install -r requirements.txt

# (Optional) Set your live Gemini API Key (Backend auto-simulates if key is omitted)
$env:GEMINI_API_KEY="your-gemini-api-key"

# Run Uvicorn dev server
uvicorn main:app --reload --port 8000
```

FastAPI server runs at: `http://127.0.0.1:8000` (Interactive Swagger Docs at `http://127.0.0.1:8000/docs`).

### 2. Launch Next.js 15 Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Next.js App Router runs at: `http://localhost:3000`.

---

## 🌐 Navigating the Portals

1. **Auth Portal (`/auth`)**:
   - Register as **Citizen** or sign in as **Caseworker** with assigned Circle Office (e.g. `Circle Office - Zone 4`).
2. **Citizen Self-Service (`/citizen/dashboard`)**:
   - View profile health score, top KPI cards, request new document intake with drag-and-drop & local blur check, DigiLocker e-KYC modal, sample guide modal, and download verified certificates with confetti.
3. **Caseworker Copilot (`/caseworker/dashboard`)**:
   - View jurisdiction-scoped queue, inspect documents in split-screen mode, review 4-level matrix, issue documents, and generate citizen notice emails/SMS.
4. **Audit Logs (`/caseworker/audit`)**:
   - Inspect historical ledger and export audit logs as CSV.
