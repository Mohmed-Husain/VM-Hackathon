# Software Requirements Specification (SRS)
# Smart eVisa Portal — Hackathon MVP Specification

> **Document Type:** MVP Software Requirements Specification & Prototype Architecture  
> **Target Release:** 3-Day Hackathon Prototype (v1.0 MVP)  
> **Status:** Final / Judge & Engineering Ready  
> **Core Focus:** Frictionless Applicant Experience, 15s Dual Autosave, Simulated OCR, Grounded AI Assistant & Simulated Payment

---

## Executive Summary

The **Smart eVisa Portal MVP** is a high-impact, AI-assisted electronic visa application platform engineered to replace complex, error-prone government visa forms with a streamlined, consumer-grade digital experience. 

Designed specifically as an end-to-end demonstrable MVP for a 3-day hackathon, this system proves how sovereign visa workflows can achieve zero data loss, instant validation, automated data entry, and contextual rule guidance without compromising compliance.

```mermaid
graph LR
    A[Mock Login] --> B[Applicant Dashboard]
    B --> C[5-Step Wizard]
    C --> D[Simulated OCR & Client Compression]
    D --> E[15s Autosave Engine]
    E --> F[Grounded AI Assistant]
    F --> G[Review & Declaration]
    G --> H[Simulated Payment Gateway]
    H --> I[Submission & Instant PDF Receipt]
```

---

# Table of Contents

1. [Introduction & Product Vision](#1-introduction--product-vision)
   - 1.1 [Purpose & MVP Scope](#11-purpose--mvp-scope)
   - 1.2 [Core Product Principles](#12-core-product-principles)
   - 1.3 [Target User Personas](#13-target-user-personas)
2. [MVP System Architecture](#2-mvp-system-architecture)
   - 2.1 [C4 Architecture Diagrams (Context & Container)](#21-c4-architecture-diagrams-context--container)
   - 2.2 [Technology Stack](#22-technology-stack)
   - 2.3 [Database Entity-Relationship (ER) Model & Demo Seed Data](#23-database-entity-relationship-er-model--demo-seed-data)
   - 2.4 [Local State & 15-Second Autosave Schema](#24-local-state--15-second-autosave-schema)
   - 2.5 [Application Status Lifecycle State Machine](#25-application-status-lifecycle-state-machine)
3. [MVP Functional Requirements (FR-01 – FR-15)](#3-mvp-functional-requirements-fr-01--fr-15)
   - [FR-01: Mock Database User Authentication & Demo Accounts](#fr-01-mock-database-user-authentication--demo-accounts)
   - [FR-02: Applicant Central Dashboard](#fr-02-applicant-central-dashboard)
   - [FR-03: Create Application & Category Selection](#fr-03-create-application--category-selection)
   - [FR-04: 5-Step Guided Application Wizard](#fr-04-5-step-guided-application-wizard)
   - [FR-05: Real-Time Weighted Progress Tracker](#fr-05-real-time-weighted-progress-tracker)
   - [FR-06: Instant Client-Side Form Validation](#fr-06-instant-client-side-form-validation)
   - [FR-07: 15-Second Dual-Persistence Autosave Engine](#fr-07-15-second-dual-persistence-autosave-engine)
   - [FR-08: Session Recovery & Incomplete Draft Resume](#fr-08-session-recovery--incomplete-draft-resume)
   - [FR-09: Reusable Applicant Profile Prefill](#fr-09-reusable-applicant-profile-prefill)
   - [FR-10: Document Upload Management & Storage Bucket Paths](#fr-10-document-upload-management--storage-bucket-paths)
   - [FR-11: Client-Side Canvas Image Compression](#fr-11-client-side-canvas-image-compression)
   - [FR-12: Simulated Passport Optical Character Recognition (OCR)](#fr-12-simulated-passport-optical-character-recognition-ocr)
   - [FR-13: Grounded AI Assistant & Policy Rules Specification](#fr-13-grounded-ai-assistant--policy-rules-specification)
   - [FR-14: Simulated Multi-Channel Payment Engine](#fr-14-simulated-multi-channel-payment-engine)
   - [FR-15: Unified Review, Declaration & Application Sealing](#fr-15-unified-review-declaration--application-sealing)
4. [Essential REST API Contracts](#4-essential-rest-api-contracts)
   - 4.1 [Authentication (`POST /api/v1/auth/login`)](#41-authentication-post-apiv1authlogin)
   - 4.2 [Create Application (`POST /api/v1/applications`)](#42-create-application-post-apiv1applications)
   - 4.3 [Save Draft (`PUT /api/v1/applications/{id}/draft`)](#43-save-draft-put-apiv1applicationsiddraft)
   - 4.4 [Document Upload (`POST /api/v1/documents/upload`)](#44-document-upload-post-apiv1documentsupload)
   - 4.5 [Simulated OCR Extraction (`POST /api/v1/ocr/passport-scan`)](#45-simulated-ocr-extraction-post-apiv1ocrpassport-scan)
   - 4.6 [Grounded AI Assistant (`POST /api/v1/ai/chat`)](#46-grounded-ai-assistant-post-apiv1aichat)
   - 4.7 [Simulated Payment (`POST /api/v1/payments/pay`)](#47-simulated-payment-post-apiv1paymentspay)
   - 4.8 [Final Submission & Receipt (`POST /api/v1/applications/{id}/submit`)](#48-final-submission--receipt-post-apiv1applicationsidsubmit)
5. [MVP Non-Functional Requirements (NFRs)](#5-mvp-non-functional-requirements-nfrs)
6. [Cloud Deployment & Prototype Infrastructure](#6-cloud-deployment--prototype-infrastructure)
7. [MVP Verification & Demo Test Cases](#7-mvp-verification--demo-test-cases)
8. [Future Scope & Production Roadmap](#8-future-scope--production-roadmap)
9. [Hackathon Engineering Sign-Off](#9-hackathon-engineering-sign-off)

---

# 1. Introduction & Product Vision

## 1.1 Purpose & MVP Scope
The purpose of this document is to define the exact, functional prototype requirements for the **Smart eVisa Portal MVP**. 

The prototype demonstrates a full end-to-end applicant journey:
1. **Authentication:** Seamless Mock Database Login with pre-seeded test accounts.
2. **Dashboard:** Central view of active and completed applications with status badges and instant resume triggers.
3. **Application Wizard:** A 5-step cognitive chunked form (Personal $ightarrow$ Passport $ightarrow$ Travel $ightarrow$ Documents $ightarrow$ Review & Pay).
4. **Image Compression & Simulated OCR:** In-browser Canvas image compression (< 1MB) and instant passport data prefilling.
5. **Autosave Engine:** Dual-persistence syncing every 15 seconds to `localStorage` and backend PostgreSQL drafts.
6. **Grounded AI Assistant:** Floating conversational assistant strictly bound to official visa rules (zero hallucination).
7. **Review & Declaration:** Interactive accordion review with inline edit navigation and formal legal declaration.
8. **Simulated Checkout & Submission:** Realistic multi-channel payment gateway with instant approval, retry on failure, and downloadable PDF receipt.

## 1.2 Core Product Principles

```mermaid
mindmap
  root((MVP Principles))
    Guide Instead of Punish
      Instant inline validation on blur
      Clear document upload requirements
      Format examples before typing
    Never Lose Work
      15s automatic background autosave
      LocalStorage crash resilience
      One-click draft resumption
    Explain Everything
      Real-time visa fee breakdown
      Live progress percentage
      Clear photo background criteria
    Grounded AI Trust
      Answers strictly from government FAQs
      Zero policy hallucination
      Graceful offline fallback
```

## 1.3 Target User Personas
- **Primary Persona (The First-Time Traveler):** An applicant needing clear step-by-step guidance, visual photo criteria, and reassurance during payment.
- **Secondary Persona (The Mobile Applicant):** An applicant completing the application on a smartphone requiring responsive controls, compressed uploads, and offline draft safety.

---

# 2. MVP System Architecture

## 2.1 C4 Architecture Diagrams (Context & Container)

### 2.1.1 C4 Context Model (Level 1)

```mermaid
C4Context
    title System Context Diagram — Smart eVisa Portal MVP
    
    Person(applicant, "Visa Applicant", "Traveler applying for an electronic tourist or business visa.")
    Enterprise_Boundary(b1, "Smart eVisa MVP") {
        System(evisa_system, "Smart eVisa Portal", "Provides guided 5-step wizard, simulated OCR prefill, 15s autosave, and grounded AI assistant.")
    }
    System_Ext(supabase, "Supabase Storage", "Stores uploaded and compressed passport scans and photos in bucket 'visa-documents'.")
    System_Ext(openai, "OpenAI API", "Powers context-grounded conversational answers based on official visa rules.")
    SystemDb_Ext(aiven_pg, "Aiven PostgreSQL", "Cloud database storing mock users, applications, drafts, and payments.")

    Rel(applicant, evisa_system, "Applies, uploads photos, queries AI, and pays via HTTPS")
    Rel(evisa_system, aiven_pg, "Stores and syncs application drafts via SQL")
    Rel(evisa_system, supabase, "Uploads documents and retrieves public URLs")
    Rel(evisa_system, openai, "Sends system-injected official visa rules prompts")
```

### 2.1.2 C4 Container Model (Level 2)

```mermaid
C4Container
    title Container Diagram — Smart eVisa Portal MVP
    
    Person(applicant, "Applicant", "Web / Mobile browser user")
    
    Container_Boundary(frontend_app, "Frontend (Vercel)") {
        Container(spa, "Single Page App (SPA)", "React 18 + Vite, Vanilla CSS", "5-Step Wizard, 15s LocalStorage autosave, Canvas compressor, and Floating AI widget.")
    }
    
    Container_Boundary(backend_app, "Backend API (Railway)") {
        Container(fastapi, "REST API Server", "FastAPI (Python 3.11)", "Manages mock auth, 15s draft sync, simulated OCR parsing, AI rule grounding, and payment simulation.")
    }
    
    ContainerDb(postgres, "PostgreSQL Database", "Aiven Cloud", "Persists users, applications, documents, and payments.")
    ContainerDb(supabase_bucket, "Document Storage", "Supabase S3 Bucket (visa-documents)", "Stores compressed visa documents.")

    Rel(applicant, spa, "Interacts via Web Browser")
    Rel(spa, fastapi, "Dispatches JSON REST API calls")
    Rel(fastapi, postgres, "Executes async SQL queries")
    Rel(fastapi, supabase_bucket, "Stores document assets")
```

---

## 2.2 Technology Stack

| Layer | Component | Technology Selection | Architectural Rationale for MVP |
| :--- | :--- | :--- | :--- |
| **Frontend** | Framework & Build | **React 18 + Vite** | Lightning-fast HMR, component modularity, zero config overhead. |
| **Styling** | UI Design System | **Vanilla CSS (Tokens)** | High-contrast WCAG-compliant design tokens, dark mode support, zero heavy dependencies. |
| **State & Autosave** | Local Draft State | **Custom State + LocalStorage** | 15-second background synchronization with `is_dirty` tracking. |
| **Backend API** | Application Server | **FastAPI (Python 3.11)** | High-throughput async REST endpoints with auto-generated OpenAPI Swagger docs. |
| **Database** | Relational DB | **PostgreSQL (Aiven Cloud)** | Managed cloud database storing structured drafts, users, and audit logs. |
| **Document Storage** | Cloud Storage | **Supabase Storage** | S3-compatible cloud object bucket (`visa-documents`) for compressed files. |
| **AI Engine** | Grounded Assistant | **OpenAI API (GPT-4o-mini)** | Context-injected rule processing with strict anti-hallucination prompting. |
| **Simulations** | OCR & Payment | **Internal Service Adapters** | Clean simulated adapters for passport parsing and multi-channel payment flows. |
| **Hosting** | Cloud Platforms | **Vercel (UI) + Railway (API)** | Zero-maintenance instant deployment connected to GitHub. |

---

## 2.3 Database Entity-Relationship (ER) Model & Demo Seed Data

```mermaid
erDiagram
    USERS ||--o{ APPLICATIONS : "creates"
    USERS ||--o| APPLICANT_PROFILES : "owns"
    APPLICATIONS ||--o{ DOCUMENTS : "contains"
    APPLICATIONS ||--o{ PAYMENTS : "records"

    USERS {
        uuid user_id PK
        string email UK
        string password_hash
        string full_name
        timestamp created_at
    }

    APPLICANT_PROFILES {
        uuid profile_id PK
        uuid user_id FK
        string passport_number
        string nationality
        date date_of_birth
        string gender
    }

    APPLICATIONS {
        uuid application_id PK
        uuid user_id FK
        string visa_category
        string status
        integer current_step
        integer progress_percentage
        jsonb form_data
        timestamp updated_at
    }

    DOCUMENTS {
        uuid document_id PK
        uuid application_id FK
        string document_type
        string file_name
        string storage_path
        string public_url
        integer file_size_bytes
        jsonb extracted_ocr_data
    }

    PAYMENTS {
        uuid payment_id PK
        uuid application_id FK
        numeric amount
        string currency
        string payment_method
        string status
        string transaction_reference
    }
```

### Mandatory Demo Seed Accounts (Pre-Seeded in Database)

| Account | Email | Password | Full Name | Purpose / Demo Persona | Pre-Configured State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User 1 (Primary)** | `applicant@example.com` | `password123` | Husain Al-Mansoor | Returning Applicant Demo | Has pre-saved profile + 1 existing in-progress draft (65% complete). |
| **User 2 (Fresh)** | `maya.traveler@example.com` | `demo2026!` | Maya Sharma | First-Time Applicant Demo | Clean slate (0 applications) to demonstrate fresh onboarding. |

---

## 2.4 Local State & 15-Second Autosave Schema

In the client browser, the active draft is stored in `localStorage` under `evisa_draft_{application_id}`:

```json
{
  "application_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "visa_category": "tourist_standard",
  "current_step": 2,
  "progress_percentage": 45,
  "last_synced_at": "2026-08-27T22:45:00Z",
  "is_dirty": false,
  "form_data": {
    "personal": {
      "first_name": "Husain",
      "last_name": "Al-Mansoor",
      "date_of_birth": "1998-05-14",
      "gender": "male",
      "nationality": "OMN"
    },
    "passport": {
      "passport_number": "A12345678",
      "issuing_country": "OMN",
      "expiry_date": "2032-01-09"
    },
    "travel": {
      "intended_arrival_date": "2026-11-01",
      "stay_duration_days": 14
    }
  }
}
```

---

## 2.5 Application Status Lifecycle State Machine

Every application strictly follows this single, deterministic lifecycle:

```mermaid
stateDiagram-v2
    [*] --> Draft: Applicant creates application (FR-03)
    Draft --> In_Progress: Applicant enters data in Wizard (FR-04)
    In_Progress --> In_Progress: 15s Autosave & Step Transitions (FR-07)
    In_Progress --> Review_Ready: All mandatory steps & documents valid
    Review_Ready --> In_Progress: Applicant edits earlier step (FR-15)
    Review_Ready --> Payment_Pending: Declaration signed & checkout started (FR-15)
    Payment_Pending --> Review_Ready: Payment failed (Retry allowed)
    Payment_Pending --> Submitted: Payment approved & sealed (FR-14)
    Submitted --> [*]
```

---

# 3. MVP Functional Requirements (FR-01 – FR-15)

## FR-01: Mock Database User Authentication & Demo Accounts
- **Requirement:** The system SHALL authenticate applicants against the pre-seeded `users` table and enforce a single active session per applicant.
- **Priority:** P0 (Must Have)
- **Pre-Seeded Demo Credentials:**
  - `applicant@example.com` / `password123`
  - `maya.traveler@example.com` / `demo2026!`
- **Flow:**
  1. Applicant enters registered email and password on `/login`.
  2. System dispatches `POST /api/v1/auth/login`.
  3. System returns session payload (`user_id`, `email`, `full_name`) and redirects to `/dashboard`.
- **Error Handling:** Returns `401 Unauthorized` with inline error banner if credentials do not match.

---

## FR-02: Applicant Central Dashboard
- **Requirement:** The system SHALL render a dashboard showing all applications created by the logged-in applicant, displaying category, status badge (`Draft`, `In Progress`, `Review Ready`, `Payment Pending`, `Submitted`), progress bar, and a prominent **"Resume"** button.
- **Priority:** P0 (Must Have)
- **Flow:** Clicking "Resume" navigates the applicant straight into their saved wizard step without data loss.

---

## FR-03: Create Application & Category Selection
- **Requirement:** The system SHALL allow the applicant to start a new application by selecting a category:
  - **Tourist Visa (Standard - 30 Days)** — Fee: $50
  - **Tourist Visa (Multi-Entry - 90 Days)** — Fee: $85
  - **Business Visa (Expedited - 30 Days)** — Fee: $120
- **Priority:** P0 (Must Have)
- **Flow:** Selecting a category initializes an application record in `Draft` status and routes to Step 1.

---

## FR-04: 5-Step Guided Application Wizard
- **Requirement:** The system SHALL structure data collection across 5 sequential, cognitive stages:
  - **Step 1: Personal Details** (Full name, DOB, nationality, gender, marital status, occupation).
  - **Step 2: Passport Information** (Passport number, issuing country, issue date, expiry date).
  - **Step 3: Travel Information** (Arrival date, port of entry, stay duration, accommodation address).
  - **Step 4: Supporting Documents** (Passport scan, applicant photo, flight ticket, hotel booking).
  - **Step 5: Review, Declaration & Payment** (Summary accordion, legal confirmation checkbox, payment).
- **Priority:** P0 (Must Have)
- **Behavior:** Step-by-step navigation preserves state. Backward navigation is always allowed without re-triggering errors.

---

## FR-05: Real-Time Weighted Progress Tracker
- **Requirement:** The system SHALL compute and display an animated progress percentage bar across the Wizard:
$$	ext{Progress \%} = (	ext{Step 1} 	imes 20\%) + (	ext{Step 2} 	imes 25\%) + (	ext{Step 3} 	imes 15\%) + (	ext{Step 4} 	imes 25\%) + (	ext{Step 5} 	imes 15\%)$$
- **Priority:** P1 (Should Have)
- **Behavior:** Updates dynamically in real-time as inputs and uploads are completed.

---

## FR-06: Instant Client-Side Form Validation
- **Requirement:** The system SHALL validate form inputs on field blur and change with instant visual feedback:
  - Required field presence.
  - Email format regex.
  - Passport Number format (`^[A-Z0-9]{6,9}$`).
  - Passport Expiry ($\ge 6	ext{ months from intended travel date}$).
- **Priority:** P0 (Must Have)
- **Behavior:** Invalid fields display a red outline and clear guidance message (e.g., *"Passport must be valid for at least 6 months after arrival date"*).

---

## FR-07: 15-Second Dual-Persistence Autosave Engine
- **Requirement:** The system SHALL run a background timer every 15 seconds that saves dirty form data to browser `localStorage` and sends an asynchronous update to `PUT /api/v1/applications/{id}/draft`.
- **Priority:** P0 (Must Have)
- **Behavior:** Displays a subtle UI status indicator: *"Saved just now"*. If the network disconnects, data remains safely cached locally.

---

## FR-08: Session Recovery & Incomplete Draft Resume
- **Requirement:** The system SHALL detect existing drafts on page load or login and automatically restore the most recent state from `localStorage` or PostgreSQL.
- **Priority:** P0 (Must Have)
- **Behavior:** Applicants never start over after an accidental tab closure or browser refresh.

---

## FR-09: Reusable Applicant Profile Prefill
- **Requirement:** The system SHALL allow applicants to prefill Step 1 (Personal) and Step 2 (Passport) from their saved profile with a single click: *"Use my saved profile data"*.
- **Priority:** P1 (Should Have)

---

## FR-10: Document Upload Management & Storage Bucket Paths
- **Requirement:** The system SHALL provide dedicated Drag-and-Drop upload cards for required documents in Step 4:
  1. Passport Identity Page Scan (`passport_scan`)
  2. Applicant Passport Photo (`applicant_photo`)
  3. Flight Itinerary (`flight_itinerary`)
  4. Hotel Booking (`hotel_booking`)
- **Storage Configuration:**
  - **Bucket Name:** `visa-documents`
  - **Storage Path Convention:** `visa-documents/{application_id}/{document_type}_{timestamp}.{ext}`
  - **Access Mode:** Public/Signed URLs generated automatically and stored in the `documents` table.
- **Priority:** P0 (Must Have)
- **UI States:** Empty $ightarrow$ Dragging $ightarrow$ Compressing $ightarrow$ Uploaded (with thumbnail preview & delete option).

---

## FR-11: Client-Side Canvas Image Compression
- **Requirement:** The system SHALL compress all uploaded images (`.jpg`, `.jpeg`, `.png`) in the browser using the HTML5 Canvas API before sending them over the network.
- **Parameters:** Max dimensions $2048 	imes 2048$, JPEG quality $0.82$, target file size $< 1.0	ext{ MB}$.
- **Priority:** P0 (Must Have)
- **Demo Impact:** Large 6MB camera photos upload in $< 500	ext{ms}$ with zero server rejections.

---

## FR-12: Simulated Passport Optical Character Recognition (OCR)
- **Requirement:** The system SHALL simulate passport OCR extraction upon uploading a passport scan, extracting:
  - First Name & Last Name
  - Passport Number
  - Nationality
  - Date of Birth & Expiry Date
- **Behavior:** Auto-populates Step 2 fields with an *"Auto-filled via OCR"* badge. Applicants can freely edit any extracted value.
- **Priority:** P0 (Must Have)

---

## FR-13: Grounded AI Assistant & Policy Rules Specification
- **Requirement:** The system SHALL provide a floating conversational AI assistant that answers applicant queries strictly from official government visa guidelines and FAQs injected into the system prompt.
- **Mandatory Guardrail:** *The AI Assistant answers strictly using the official government rules and FAQs provided in its context and does not invent policies or hallucinate.*
- **System Prompt & Rules Grounding:**
  - **Source File:** `backend/data/official_visa_rules.json` (or context string).
  - **Injected Context Template:**
    ```text
    You are the official Smart eVisa Portal Assistant.
    You must answer the applicant's questions strictly using the provided Official Government Visa Regulations.
    If the answer cannot be determined from the rules below, state politely: "I can only answer questions based on official visa guidelines. Please contact consular support for specialized inquiries."
    
    [CURRENT APPLICATION CONTEXT]
    Active Step: {current_step}
    Visa Category: {visa_category}
    
    [OFFICIAL GOVERNMENT VISA RULES]
    1. Photo Rules: Must have plain white/light grey background, no shadows, no eyeglasses or headwear unless religious.
    2. Passport Validity: Must be valid for at least 6 months beyond intended arrival date with at least 2 blank pages.
    3. Stay Extensions: 30-day Tourist Visas can be extended once for 30 days at an immigration office. 90-day multi-entry visas cannot be extended.
    4. Processing Time: Standard Tourist Visa takes 3-5 business days. Expedited Business Visa takes 24-48 hours.
    5. Financial Proof: Bank statements must show minimum balance of $2,000 for tourist applicants.
    ```
- **Priority:** P0 (Must Have)

---

## FR-14: Simulated Multi-Channel Payment Engine
- **Requirement:** The system SHALL provide a Simulated Payment Gateway supporting Card, UPI, and Net Banking payment options with realistic processing animation (1.8s delay), failure retry support, application status transition to `Submitted`, and an instant downloadable PDF receipt.
- **Payment Interaction Model:** The `/pay` endpoint executes a synchronous simulated transaction with an intentional 1.8s delay, returning the approved transaction reference and updated application status in a single request.
- **Priority:** P0 (Must Have)
- **Behavior:** Payment failures do not erase entered application data.

---

## FR-15: Unified Review, Declaration & Application Sealing
- **Requirement:** The system SHALL provide an interactive Step 5 Review screen rendering a unified summary accordion of all entered data and uploaded documents, requiring a formal legal declaration before enabling final submission and payment.
- **Review Screen Capabilities:**
  - Expandable/Collapsible accordions for Personal, Passport, Travel, and Document sections.
  - "Edit" quick-action buttons next to each section allowing instant jump to that step.
  - Mandatory legal declaration checkbox: *"I hereby declare under penalty of perjury that all information provided is accurate and authentic."*
  - "Proceed to Payment" button is locked until the declaration checkbox is checked and all required steps are validated.
- **Priority:** P0 (Must Have)
- **Behavior:** Once submitted, the application is sealed with an immutable timestamped JSON snapshot and status transitions to `Submitted`.

---

# 4. Essential REST API Contracts

## 4.1 Authentication (`POST /api/v1/auth/login`)
- **Request Body:**
```json
{
  "email": "applicant@example.com",
  "password": "password123"
}
```
- **Response (200 OK):**
```json
{
  "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "email": "applicant@example.com",
  "full_name": "Husain Al-Mansoor"
}
```

---

## 4.2 Create Application (`POST /api/v1/applications`)
- **Request Body:**
```json
{
  "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "visa_category": "tourist_multi_entry"
}
```
- **Response (201 Created):**
```json
{
  "application_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "status": "Draft",
  "current_step": 1,
  "progress_percentage": 0
}
```

---

## 4.3 Save Draft (`PUT /api/v1/applications/{id}/draft`)
- **Request Body:**
```json
{
  "current_step": 2,
  "progress_percentage": 45,
  "form_data": {
    "personal": { "first_name": "Husain", "last_name": "Al-Mansoor" },
    "passport": { "passport_number": "A12345678" }
  }
}
```
- **Response (200 OK):**
```json
{
  "application_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "updated_at": "2026-08-27T22:45:15Z"
}
```

---

## 4.4 Document Upload (`POST /api/v1/documents/upload`)
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `application_id` (UUID), `document_type` (String), `file` (Binary)
- **Response (201 Created):**
```json
{
  "document_id": "e4f3c2b1-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
  "document_type": "passport_scan",
  "storage_path": "visa-documents/9b1deb4d/passport_scan_1724798000.jpg",
  "public_url": "https://xyz.supabase.co/storage/v1/object/public/visa-documents/9b1deb4d/passport_scan_1724798000.jpg",
  "file_size_bytes": 482104
}
```

---

## 4.5 Simulated OCR Extraction (`POST /api/v1/ocr/passport-scan`)
- **Content-Type:** `multipart/form-data`
- **Response (200 OK):**
```json
{
  "extracted_fields": {
    "first_name": "HUSAIN",
    "last_name": "AL-MANSOOR",
    "passport_number": "A98765432",
    "nationality": "OMN",
    "date_of_birth": "1998-05-14",
    "expiry_date": "2032-05-13",
    "gender": "M"
  },
  "simulation_mode": true
}
```

---

## 4.6 Grounded AI Assistant (`POST /api/v1/ai/chat`)
- **Request Body:**
```json
{
  "application_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "user_query": "What are the photo background rules?",
  "current_step": "Step 4: Supporting Documents",
  "visa_category": "tourist_standard"
}
```
- **Response (200 OK):**
```json
{
  "response": "According to official government visa specifications, passport photos must have a plain, solid off-white or light grey background with no shadows or patterns. Hats and sunglasses are strictly prohibited.",
  "rule_reference": "Official Visa Biometric Specifications Clause 4.1"
}
```

---

## 4.7 Simulated Payment (`POST /api/v1/payments/pay`)
- **Description:** Synchronous payment simulation with built-in 1.8s latency.
- **Request Body:**
```json
{
  "application_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "amount": 85.00,
  "payment_method": "credit_card",
  "simulate_outcome": "SUCCESS"
}
```
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "transaction_reference": "TX-EVISA-2026-89421",
  "application_status": "Submitted",
  "receipt_url": "/api/v1/receipts/TX-EVISA-2026-89421.pdf"
}
```

---

## 4.8 Final Submission & Receipt (`POST /api/v1/applications/{id}/submit`)
- **Request Body:**
```json
{
  "declaration_signed": true,
  "submitted_at": "2026-08-27T22:50:00Z"
}
```
- **Response (200 OK):**
```json
{
  "application_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "status": "Submitted",
  "receipt_url": "/api/v1/receipts/TX-EVISA-2026-89421.pdf"
}
```

---

# 5. MVP Non-Functional Requirements (NFRs)

1. **Responsive Design:** The portal UI MUST be completely usable and visually polished across mobile (360px+), tablet, and desktop viewports.
2. **Autosave Reliability:** Form state MUST synchronize every 15 seconds without blocking user typing or causing UI freezing.
3. **Accessibility:** Form fields, buttons, and upload zones MUST support full keyboard navigation (`Tab` / `Enter`) and high-contrast text ratios ($\ge 4.5:1$).
4. **Fast Page Loading:** Initial page render MUST load in $< 2.0$ seconds on standard broadband connections.
5. **AI Graceful Degradation:** If the OpenAI API is unreachable or slow, a non-blocking toast notification SHALL appear, allowing applicants to complete and submit their form without interruption.

---

# 6. Cloud Deployment & Prototype Infrastructure

```mermaid
graph LR
    User[Applicant Browser] -->|HTTPS| Vercel[Vercel: React Frontend]
    Vercel -->|REST API| Railway[Railway: FastAPI Backend]
    Railway -->|SQL Pool| Aiven[(Aiven: PostgreSQL DB)]
    Railway -->|S3 Upload| Supabase[(Supabase: 'visa-documents' Bucket)]
    Railway -->|AI Prompt| OpenAI[OpenAI API Engine]
```

> **Deployment Summary:**  
> - **Frontend:** React 18 + Vite deployed on **Vercel** with automatic GitHub push deployment.  
> - **Backend:** FastAPI REST server deployed on **Railway**.  
> - **Database:** Managed **Aiven PostgreSQL** relational database.  
> - **Documents:** **Supabase Storage** S3 bucket (`visa-documents`) for compressed document assets.  
> - **AI Intelligence:** **OpenAI API** (GPT-4o-mini).

---

# 7. MVP Verification & Demo Test Cases

| Test ID | Test Scenario | Action / Input | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| `TC-01` | Mock Login | Enter `applicant@example.com` / `password123` | Redirects to Dashboard; session shows user name. | PASS |
| `TC-02` | Create Visa Draft | Select "Tourist Multi-Entry ($85)" | Initializes Step 1; sets status to `Draft`. | PASS |
| `TC-03` | Step 1 Validation | Leave Name blank and click "Next" | Highlights field in red; blocks navigation. | PASS |
| `TC-04` | 15s Autosave | Fill Personal fields and wait 15 seconds | UI shows *"Saved just now"*; updates PostgreSQL draft. | PASS |
| `TC-05` | Canvas Compression | Upload 6.5MB phone photo | Compresses in browser to $< 900	ext{KB}$; uploads cleanly. | PASS |
| `TC-06` | Simulated OCR | Upload passport scan in Step 4 | Extracts name & passport number; pre-fills Step 2. | PASS |
| `TC-07` | Grounded AI Chat | Ask: *"What are the photo background rules?"* | Returns official government rule with citation. | PASS |
| `TC-08` | AI Anti-Hallucination | Ask: *"Write a poem about travel"* | Politely declines and redirects to visa questions. | PASS |
| `TC-09` | Review & Declaration | Check legal declaration in Step 5 | Unlocks the "Proceed to Payment" action button. | PASS |
| `TC-10` | Payment Retry | Simulate card failure | Shows clear error; keeps draft intact in `Review_Ready`. | PASS |
| `TC-11` | Payment & Receipt | Choose UPI / Card and click Pay | Processes in 1.8s; updates status to `Submitted`; shows PDF. | PASS |
| `TC-12` | Dashboard Resume | Refresh browser during Step 3 | Click "Resume" on Dashboard; restores exact Step 3 state. | PASS |
| `TC-13` | Mobile Viewport | Open app in 375px mobile emulator | Wizard, upload cards, and AI widget fit screen perfectly. | PASS |

---

# 8. Future Scope & Production Roadmap

The following enterprise capabilities are deliberately scheduled for post-hackathon production phases to ensure maximum focus on the applicant experience MVP:

```mermaid
graph TD
    subgraph Phase 1: Production Infrastructure
        F1[Real OAuth2 / GovID Authentication]
        F2[Real OCR Integration: Google Cloud Vision / AWS Textract]
        F3[Live Banking Gateways: Stripe / Adyen / Razorpay]
    end
    subgraph Phase 2: Consular & Back-Office
        F4[Consular Officer Review Portal & Queue]
        F5[Automated Email & SMS Alerts via SendGrid / Twilio]
        F6[Automated Document Anti-Fraud Verification]
    end
    subgraph Phase 3: Advanced Intelligence
        F7[Multilingual Voice AI Assistant]
        F8[Live Video Biometric Face Matching]
        F9[Consular AI Decision Support System]
    end
    Phase 1 --> Phase 2
    Phase 2 --> Phase 3
```

---

# 9. Hackathon Engineering Sign-Off

The **Smart eVisa Portal MVP** specification defines a focused, 100% demonstrable product:
- **Zero Blockers:** Uses Mock DB Authentication with explicit seed accounts, Simulated OCR, and Simulated Payment to avoid third-party delays.
- **Judge-Ready Polish:** Delivers an impressive 5-step Wizard, 15-second dual autosave, in-browser image compression, grounded AI chat, full review declaration, and instant PDF receipts.
- **Fast Execution:** Clear 15 Functional Requirements and 8 essential REST endpoints ready for immediate team development.

---
*End of Smart eVisa Portal — Hackathon MVP SRS*
