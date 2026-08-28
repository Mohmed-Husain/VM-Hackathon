# Smart eVisa Portal — AI-Assisted Visa Application Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16_(React_19)-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_Async_SQLAlchemy-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

The **Smart eVisa Portal** is an AI-assisted, citizen-centric electronic visa application platform designed to modernize sovereign visa application workflows. It replaces complex, error-prone government visa forms with a streamlined, consumer-grade digital experience featuring zero data loss, instant client-side validation, automated passport data extraction, and contextual rule guidance without compromising sovereign compliance.

---

## Architecture Overview

```mermaid
graph TD
    subgraph Client ["Client Browser (Next.js 16 + React 19)"]
        UI["5-Step Guided Wizard"]
        COMP["HTML5 Canvas Image Compressor"]
        AUTO["15s LocalStorage Autosave Engine"]
        AI_UI["Floating Grounded AI Assistant Widget"]
        REV["Review and Sealed Application Panel"]
    end

    subgraph API ["Backend API Server (FastAPI / Python 3.11)"]
        AUTH["Mock Authentication and Session Guard"]
        APPS["Application and Draft Management"]
        DOCS["Document Upload and Storage Service"]
        OCR["Simulated Passport OCR Engine"]
        AI_SRV["Grounded AI Assistant and Rule Engine"]
        PAY["Payment Gateway Adapter Placeholder"]
    end

    subgraph Persistence ["Persistence & External Services"]
        PG[("PostgreSQL Database")]
        STORAGE[("Supabase Storage or Local S3 Bucket")]
        RULES["official_visa_rules.json"]
        OPENAI["OpenAI GPT-4o-mini API"]
    end

    UI -->|JSON REST Calls| APPS
    UI -->|Authentication Flow| AUTH
    COMP -->|Pre-compressed under 1MB files| DOCS
    AUTO -->|15s background sync| APPS
    AI_UI -->|Contextual queries| AI_SRV
    REV -->|Submission review| APPS

    AUTH --> PG
    APPS --> PG
    DOCS --> PG
    DOCS --> STORAGE
    OCR --> PG
    AI_SRV --> RULES
    AI_SRV -.->|Optional| OPENAI
```

---

## Key Features

1. **5-Step Cognitive Wizard:** Chunked into *Personal*, *Passport*, *Travel*, *Documents*, and *Review & Declaration* stages with seamless backward and forward navigation.
2. **15-Second Dual-Persistence Autosave:** Unsaved dirty form data automatically synchronizes every 15 seconds to both browser `localStorage` and PostgreSQL drafts with optimistic conflict resolution.
3. **In-Browser Canvas Image Compression:** Compresses camera and scanner photos (`.jpg`, `.png`) on the client using the HTML5 Canvas API down to $< 1.0\text{ MB}$ before network upload.
4. **Simulated Passport OCR:** Automatically extracts applicant name, passport number, nationality, and expiry dates upon passport scan upload, pre-filling Step 2 with an *"Auto-filled via OCR"* indicator.
5. **Grounded AI Visa Assistant:** Floating conversational assistant strictly grounded in official visa guidelines (`official_visa_rules.json`) with deterministic fallback to ensure zero policy hallucination.
6. **Reusable Applicant Profile Prefill:** Returning applicants can pre-fill personal and passport data with a single click (*"Use my saved profile data"*).
7. **Unified Review, Legal Declaration & Application Sealing:** Accordion summary review with inline step jump navigation, perjury declaration checkbox, and immutable timestamped JSON snapshot generation.

---

## Pre-Seeded Demo Accounts

The database is pre-seeded on startup with two test accounts:

| Demo Account | Email | Password | Persona / Purpose | Pre-Configured State |
| :--- | :--- | :--- | :--- | :--- |
| **User 1 (Primary)** | `applicant@example.com` | `password123` | Returning Applicant (Husain Al-Mansoor) | Has pre-saved profile + 1 existing in-progress draft (63% complete). |
| **User 2 (Fresh)** | `maya.traveler@example.com` | `demo2026!` | First-Time Applicant (Maya Sharma) | Clean slate (0 applications) to demonstrate fresh onboarding. |

---

## Project Directory Structure

```text
VM-Hackathon/
├── docs/                                # Core Project & SRS Documentation
│   ├── Smart_eVisa_Portal_SRS_v1.0.md   # Initial SRS v1.0 specification
│   ├── VM Hakathon MVP SRS.md           # Consolidated Hackathon MVP SRS (v1.0)
│   ├── VM Hakathon SRS.md               # Full IEEE 830 / ISO 29148 Standard SRS (v2.0)
│   └── module-breakdown.md              # Engineering module architecture breakdown
│
├── backend/                             # FastAPI Application Server (Python 3.11)
│   ├── alembic/                         # Database schema migrations
│   │   └── versions/                    # 5 versioned migration scripts
│   ├── app/
│   │   ├── api/routes/                  # REST route controllers (auth, applications, docs, ocr, ai)
│   │   ├── core/                        # Configuration & security utilities
│   │   ├── data/                        # official_visa_rules.json rule corpus
│   │   ├── db/                          # Database connection & session setup
│   │   ├── dependencies/                # FastAPI dependency injection helpers
│   │   ├── models/                      # SQLAlchemy ORM models (User, Application, Document, Profile)
│   │   ├── repositories/                # Database repository layer
│   │   ├── schemas/                     # Pydantic v2 request/response models
│   │   └── services/                    # Business logic services (AI, OCR, Drafts, Seeds)
│   ├── docs/                            # Backend module documentation
│   ├── requirements.txt                 # Python dependencies
│   └── alembic.ini                      # Alembic configuration
│
└── frontend/                            # Next.js 16 App Router Client
    ├── src/
    │   ├── app/                         # App Router pages (/login, /dashboard, /applications/[id])
    │   ├── components/                  # React UI components (wizard, assistant, auth, dashboard)
    │   ├── content/                     # Visa category and content definitions
    │   ├── lib/                         # Client API client, autosave storage, canvas image compression
    │   └── types/                       # TypeScript interfaces and data types
    ├── docs/                            # Frontend module documentation
    └── package.json                     # NPM packages & build scripts
```

---

## Getting Started & Local Development

### Prerequisites
- **Python:** 3.11 or higher
- **Node.js:** 18.x or higher (Node 20+ recommended)
- **PostgreSQL:** Running PostgreSQL instance (or cloud instance like Aiven / Supabase)

---

### 1. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Linux / macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (create .env file)
# Example .env:
# DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/evisa_db
# SECRET_KEY=your-secret-key
# AUTO_CREATE_TABLES=true
# OPENAI_API_KEY=optional-openai-key

# Run database migrations (or let auto_create_tables handle initial setup)
alembic upgrade head

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

Backend API documentation will be available at:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Configure environment variables (optional, defaults to http://localhost:8000)
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Start the development server
npm run dev
```

The frontend portal will be accessible at:
- **Web Application:** [http://localhost:3000](http://localhost:3000)

---

## Essential REST API Contracts

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate applicant & issue session payload |
| `GET` | `/api/v1/applications` | List active applications for logged-in user |
| `POST` | `/api/v1/applications` | Initialize a new application draft |
| `GET` | `/api/v1/applications/{id}` | Retrieve application draft details & form state |
| `PUT` | `/api/v1/applications/{id}/draft` | Update draft form data, current step, and progress (15s autosave) |
| `POST` | `/api/v1/documents/upload` | Upload supporting document (`passport_scan`, `applicant_photo`, etc.) |
| `DELETE`| `/api/v1/documents/{id}` | Remove an uploaded document |
| `POST` | `/api/v1/ocr/passport-scan` | Trigger simulated passport OCR data extraction |
| `POST` | `/api/v1/ai/chat` | Query grounded AI assistant with injected rules & context |
| `GET` | `/api/v1/profile` | Retrieve reusable applicant profile |
| `POST` | `/api/v1/applications/{id}/submit` | Seal application and create immutable submission snapshot |

---

## Documentation Index

- **Core SRS & Architecture:**
  - [Hackathon MVP SRS](docs/VM%20Hakathon%20MVP%20SRS.md) — The primary MVP requirements specification
  - [Full Standard SRS v2.0](docs/VM%20Hakathon%20SRS.md) — Comprehensive IEEE 830 system specification
  - [Initial SRS v1.0](docs/Smart_eVisa_Portal_SRS_v1.0.md) — Initial foundation specification
  - [Module Breakdown](docs/module-breakdown.md) — Technical module architecture plan
- **Backend Services:**
  - [Auth Service](backend/docs/auth-service.md)
  - [Application & Draft Service](backend/docs/application-service.md)
  - [Document Service](backend/docs/document-service.md)
  - [Simulated OCR Service](backend/docs/ocr-service.md)
  - [AI Assistant Service](backend/docs/ai-assistant-service.md)
  - [Validation Rules](backend/docs/validation-rules.md)
- **Frontend Modules:**
  - [Wizard Shell](frontend/docs/wizard.md)
  - [Autosave & Recovery](frontend/docs/autosave-recovery.md)
  - [Image Processing & Canvas Compression](frontend/docs/image-processing.md)
  - [AI Assistant UI Widget](frontend/docs/ai-assistant.md)
  - [Review & Sealed Submission](frontend/docs/review-submission.md)

---

## License

Internal Hackathon Project — All rights reserved.

