# Software Requirements Specification (SRS)
# Smart eVisa Portal — AI-Assisted Government Visa Experience Redesign

> **Document Identifier:** SRS-EVISA-2026-V2.0  
> **Standard Compliance:** IEEE 830 / ISO/IEC/IEEE 29148 Standard for Software Requirements Engineering  
> **Classification:** Project Specification & Technical Architecture Blueprint  
> **Status:** Approved / Hackathon Submission Ready  
> **Author:** Smart eVisa Engineering & Product Team  
> **Target Release:** Hackathon Prototype v1.0 (with Production Evolution Blueprint)

---

## Document Revision History

| Version | Date | Author / Role | Summary of Changes |
| :--- | :--- | :--- | :--- |
| **v0.1** | 2026-08-20 | Product Management | Initial problem statement, user pain points, and product philosophy definition. |
| **v0.5** | 2026-08-22 | Frontend & UX Lead | Drafted Wizard flow, client-side validation rules, and persona definitions. |
| **v1.0** | 2026-08-24 | Systems Architect | Added C4 architecture models, FastAPI backend specs, and PostgreSQL schemas. |
| **v1.5** | 2026-08-26 | AI & Security Eng | Integrated Grounded AI Assistant specifications, Supabase storage, and OWASP controls. |
| **v2.0** | 2026-08-27 | Lead Technical Architect | **Full Professional Consolidation:** Standardized all 17 Functional Requirements (`FR-001` to `FR-017`) into formal IEEE SRS format; unified application status lifecycle; enforced Mock Database Authentication with single-session control; standardized Simulated OCR and Simulated Payment Gateway; enforced 15-second dual-persistence autosave; converted SVG diagrams to standard Mermaid; consolidated database DDL, API contracts, testing matrix, and DevOps architecture. |

---

## Executive Summary

The **Smart eVisa Portal** is an AI-assisted, citizen-centric digital visa application platform designed to modernize the government visa application process. Traditional government visa portals suffer from alarming abandonment rates (exceeding 45%), widespread user anxiety, silent data loss, and rigid validation errors.

This specification outlines a transformative architecture that preserves strict sovereign compliance and document validation while delivering a consumer-grade user experience. The solution introduces a **5-step guided Wizard**, an **offline-resilient 15-second dual-persistence autosave engine**, **client-side image compression**, **Simulated Passport OCR prefill**, **Simulated Multi-Channel Payment processing**, and a **strictly grounded AI Visa Assistant** that answers queries strictly from official government visa rules.

```mermaid
graph LR
    A[Applicant Initiates] --> B[Mock Database Auth]
    B --> C[Applicant Dashboard]
    C --> D[5-Step Guided Wizard]
    D --> E[Simulated OCR & Client Compression]
    E --> F[Dual-Persistence Autosave: 15s]
    F --> G[Grounded AI Assistant Support]
    G --> H[Simulated Payment Gateway]
    H --> I[Submitted Application & PDF Receipt]
```

---

# Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Purpose & Scope](#11-purpose--scope)
   - 1.2 [Document Conventions & Requirement Formatting](#12-document-conventions--requirement-formatting)
   - 1.3 [Intended Audience & Reading Suggestions](#13-intended-audience--reading-suggestions)
   - 1.4 [Product Philosophy & Design Principles](#14-product-philosophy--design-principles)
2. [Overall Description & System Context](#2-overall-description--system-context)
   - 2.1 [Business Problem & Root Cause Analysis](#21-business-problem--root-cause-analysis)
   - 2.2 [Redesigned User Journey vs. Legacy Experience](#22-redesigned-user-journey-vs-legacy-experience)
   - 2.3 [User Personas](#23-user-personas)
   - 2.4 [Stakeholder Matrix](#24-stakeholder-matrix)
   - 2.5 [System Architecture & Technology Stack](#25-system-architecture--technology-stack)
   - 2.6 [Design & Implementation Constraints](#26-design--implementation-constraints)
   - 2.7 [Assumptions, Dependencies & Prototype Delimitations](#27-assumptions-dependencies--prototype-delimitations)
   - 2.8 [Unified Application Lifecycle & State Machine](#28-unified-application-lifecycle--state-machine)
3. [System Architecture & Data Design](#3-system-architecture--data-design)
   - 3.1 [C4 Architecture Models](#31-c4-architecture-models)
   - 3.2 [PostgreSQL Database Schema & Data Dictionary](#32-postgresql-database-schema--data-dictionary)
   - 3.3 [Local Client State & Storage Schema](#33-local-client-state--storage-schema)
   - 3.4 [Core System Sequence Diagrams](#34-core-system-sequence-diagrams)
4. [Specific Functional Requirements (FR-001 – FR-017)](#4-specific-functional-requirements-fr-001--fr-017)
   - [FR-001: Mock Database User Authentication & Session Control](#fr-001-mock-database-user-authentication--session-control)
   - [FR-002: Applicant Central Dashboard](#fr-002-applicant-central-dashboard)
   - [FR-003: Application Initialization & Visa Category Selection](#fr-003-application-initialization--visa-category-selection)
   - [FR-004: Multi-Step Guided Application Wizard](#fr-004-multi-step-guided-application-wizard)
   - [FR-005: Dynamic Progress Calculation & Completion Tracker](#fr-005-dynamic-progress-calculation--completion-tracker)
   - [FR-006: Dual-Layer Client/Server Validation Engine](#fr-006-dual-layer-clientserver-validation-engine)
   - [FR-007: 15-Second Dual-Persistence Autosave Engine](#fr-007-15-second-dual-persistence-autosave-engine)
   - [FR-008: Crash Recovery & Session State Restoration](#fr-008-crash-recovery--session-state-restoration)
   - [FR-009: Applicant Profile & Prefill Management](#fr-009-applicant-profile--prefill-management)
   - [FR-010: Resume Application Workflow & Deep Linking](#fr-010-resume-application-workflow--deep-linking)
   - [FR-011: Document Management & Multi-File Upload Engine](#fr-011-document-management--multi-file-upload-engine)
   - [FR-012: Supabase Cloud Object Storage Integration](#fr-012-supabase-cloud-object-storage-integration)
   - [FR-013: Client-Side Canvas Image Compression Engine](#fr-013-client-side-canvas-image-compression-engine)
   - [FR-014: Simulated Passport Optical Character Recognition (OCR) Engine](#fr-014-simulated-passport-optical-character-recognition-ocr-engine)
   - [FR-015: Grounded Context-Aware AI Visa Assistant](#fr-015-grounded-context-aware-ai-visa-assistant)
   - [FR-016: Simulated Multi-Channel Payment Gateway & Transaction Engine](#fr-016-simulated-multi-channel-payment-gateway--transaction-engine)
   - [FR-017: Comprehensive Review, Declaration & Final Submission Engine](#fr-017-comprehensive-review-declaration--final-submission-engine)
5. [System Interfaces & REST API Specifications](#5-system-interfaces--rest-api-specifications)
   - 5.1 [Global API Standards & Response Format](#51-global-api-standards--response-format)
   - 5.2 [Authentication & Session Endpoints](#52-authentication--session-endpoints)
   - 5.3 [Application & Draft Endpoints](#53-application--draft-endpoints)
   - 5.4 [Document Upload & Storage Endpoints](#54-document-upload--storage-endpoints)
   - 5.5 [Simulated OCR Extraction Endpoint](#55-simulated-ocr-extraction-endpoint)
   - 5.6 [Grounded AI Assistant Endpoint](#56-grounded-ai-assistant-endpoint)
   - 5.7 [Simulated Payment Gateway Endpoints](#57-simulated-payment-gateway-endpoints)
   - 5.8 [Unified Error Code Catalog](#58-unified-error-code-catalog)
6. [Non-Functional Requirements (NFRs)](#6-non-functional-requirements-nfrs)
   - 6.1 [Performance & Scalability Requirements](#61-performance--scalability-requirements)
   - 6.2 [Security & Privacy Architecture (OWASP Top 10)](#62-security--privacy-architecture-owasp-top-10)
   - 6.3 [Reliability, Availability & Fault Tolerance](#63-reliability-availability--fault-tolerance)
   - 6.4 [Accessibility Standards (WCAG 2.1 AA)](#64-accessibility-standards-wcag-21-aa)
   - 6.5 [Usability & Responsive Form Factor Specifications](#65-usability--responsive-form-factor-specifications)
7. [DevOps, Deployment & Monitoring Architecture](#7-devops-deployment--monitoring-architecture)
   - 7.1 [Cloud Infrastructure Topography](#71-cloud-infrastructure-topography)
   - 7.2 [Environment Configuration Matrix](#72-environment-configuration-matrix)
   - 7.3 [CI/CD Pipeline & GitHub Strategy](#73-cicd-pipeline--github-strategy)
   - 7.4 [Analytics Instrumentation & Funnel Tracking](#74-analytics-instrumentation--funnel-tracking)
   - 7.5 [Structured Logging & Observability](#75-structured-logging--observability)
8. [Quality Assurance & Verification Strategy](#8-quality-assurance--verification-strategy)
   - 8.1 [Testing Strategy & Test Pyramid](#81-testing-strategy--test-pyramid)
   - 8.2 [Detailed Test Suite Matrix](#82-detailed-test-suite-matrix)
   - 8.3 [Requirements Traceability Matrix](#83-requirements-traceability-matrix)
9. [Project Roadmaps & Engineering Governance](#9-project-roadmaps--engineering-governance)
   - 9.1 [3-Day Hackathon Sprint Implementation Roadmap](#91-3-day-hackathon-sprint-implementation-roadmap)
   - 9.2 [Post-Hackathon Production Transition Roadmap](#92-post-hackathon-production-transition-roadmap)
   - 9.3 [Prototype Acceptance Criteria & Sign-Off](#93-prototype-acceptance-criteria--sign-off)
10. [Appendices](#10-appendices)
    - 10.1 [Comprehensive Unified Glossary](#101-comprehensive-unified-glossary)
    - 10.2 [Recommended Companion Specifications (UXDS)](#102-recommended-companion-specifications-uxds)

---

# 1. Introduction

## 1.1 Purpose & Scope
This Software Requirements Specification (SRS) establishes the complete functional, technical, architectural, behavioral, and quality standards for the **Smart eVisa Portal**. 

The scope encompasses:
- A responsive, accessible single-page application (SPA) built with React and Vite.
- A high-performance asynchronous REST API backend powered by FastAPI (Python 3.11+).
- A robust persistence layer utilizing PostgreSQL (via Aiven) and cloud object storage (via Supabase).
- An intelligent, grounded AI conversational assistant providing in-situ guidance strictly sourced from official government visa regulations.
- High-fidelity simulated service adapters for Optical Character Recognition (OCR) and Payment Gateway processing to ensure an end-to-end demonstrable workflow.

## 1.2 Document Conventions & Requirement Formatting
This document strictly adheres to IEEE 830 / ISO/IEC/IEEE 29148 standards:
- **Requirement Identifiers:** All functional requirements are cataloged with unique permanent identifiers (`FR-001` through `FR-017`).
- **Normative Terminology (RFC 2119):**
  - **SHALL / MUST:** Absolute, mandatory requirement.
  - **SHOULD:** Recommended practice; justifiable exceptions may exist.
  - **MAY:** Optional or future capability.
- **Priority Classifications:**
  - **P0 (Critical):** Core prototype blocker; mandatory for hackathon demonstration.
  - **P1 (High):** Significant user experience or architectural feature.
  - **P2 (Medium):** Value-add enhancement; secondary deliverable.

## 1.3 Intended Audience & Reading Suggestions
- **Hackathon Judges & Evaluators:** Focus on Section 1.4 (*Product Philosophy*), Section 2.2 (*Redesigned Journey*), Section 4 (*Functional Requirements*), and Section 9.3 (*Sign-Off Summary*).
- **Frontend Engineers:** Prioritize Section 3.3 (*Local State Schema*), Section 4 (*FR-001 through FR-017 UI specifications*), Section 6.4 (*Accessibility*), and Section 7.2 (*Environment Variables*).
- **Backend Engineers:** Focus on Section 3.2 (*Database Schema*), Section 5 (*REST API Specifications*), Section 6.2 (*Security*), and Section 7.5 (*Logging*).
- **QA Engineers:** Utilize Section 8 (*Quality Assurance & Verification Strategy*) and Section 8.2 (*Test Suite Matrix*).

## 1.4 Product Philosophy & Design Principles
The Smart eVisa Portal redesign is grounded in four fundamental product engineering principles:

```mermaid
mindmap
  root((Product Philosophy))
    Principle 1: Guide Instead of Punish
      Contextual inline hints
      Immediate validation on blur
      Clear document upload requirements
    Principle 2: Never Lose Work
      15-second dual autosave
      LocalStorage fallback
      One-click session resume
    Principle 3: Explain Everything
      Real-time breakdown of fees
      Explicit photo crop criteria
      Transparent status pipeline
    Principle 4: Grounded Trust
      Zero AI hallucination
      Deterministic government FAQs
      Single active session security
```

1. **Principle 1 — Guide Instead of Punish:** Validate inputs early with clear, constructive error messages. Provide instant format examples rather than failing submissions silently at the final step.
2. **Principle 2 — Never Lose Applicant Work:** Implement resilient dual-persistence autosave that synchronizes state to LocalStorage and the backend every 15 seconds. Ensure users can safely disconnect and resume at any point.
3. **Principle 3 — Explain Everything:** Eliminate ambiguity surrounding visa costs, processing times, photo cropping specifications, and required supporting documents.
4. **Principle 4 — Establish Uncompromising Trust:** Provide an intelligent AI assistant that draws strictly upon official government rules and never invents policies or speculative legal advice.

---

# 2. Overall Description & System Context

## 2.1 Business Problem & Root Cause Analysis
Legacy electronic visa portals exhibit systemic usability flaws leading to high friction, failed submissions, and significant administrative overhead.

| Problem Area | Legacy Portal Flaw | Root Cause | Smart eVisa Solution |
| :--- | :--- | :--- | :--- |
| **Form Fatigue** | 60+ unchunked form inputs on a single sprawling page. | Monolithic legacy government architecture. | 5-step cognitive chunked Wizard with dynamic step-by-step progress tracking. |
| **Data Loss** | Browser crashes or session timeouts erase entire applications. | Stateless, submit-only architecture without intermediate drafts. | Dual-layer 15-second autosave to LocalStorage and PostgreSQL backend drafts. |
| **Upload Rejections** | Uploaded documents fail silently due to strict server-side file size limits. | Lack of client-side image processing. | In-browser Canvas compression (< 1MB) and format normalization before upload. |
| **Manual Data Entry** | Tedious retyping of passport numbers, expiration dates, and names. | No document parsing capability. | Simulated Passport OCR that automatically extracts and pre-fills verified fields. |
| **Payment Anxiety** | Opaque payment steps with no receipt confirmation or retry recovery. | Disjointed third-party redirects with no fallback state. | Simulated Multi-Channel Payment Gateway with deterministic state transitions and instant receipts. |
| **Policy Ambiguity** | Users navigate external multi-page PDF guidelines for eligibility. | Static, unsearchable FAQ pages. | Grounded AI Assistant providing contextual, official rule-based answers inside the portal. |

## 2.2 Redesigned User Journey vs. Legacy Experience

```mermaid
journey
    title Applicant Experience: Legacy vs. Smart eVisa Portal
    section Initiation
      Find visa website: 3: Applicant
      Decide visa category: 2: Legacy, 5: Smart eVisa
    section Form Filling
      Enter Personal & Passport Data: 1: Legacy, 5: Smart eVisa (Simulated OCR)
      Upload Documents & Photos: 1: Legacy (Size limits), 5: Smart eVisa (Auto-compress)
      Consult Rules & Regulations: 2: Legacy (PDFs), 5: Smart eVisa (Grounded AI)
    section Autosave & Recovery
      Accidental Browser Refresh: 1: Legacy (Data Lost!), 5: Smart eVisa (Auto-Restored)
    section Review & Payment
      Validate Application Details: 2: Legacy, 5: Smart eVisa (Interactive Accordion)
      Execute Fee Payment: 1: Legacy (Failure drops draft), 5: Smart eVisa (Simulated Gateway Retry)
    section Submission
      Receive Confirmation & Receipt: 2: Legacy, 5: Smart eVisa (Instant PDF & Dashboard)
```

## 2.3 User Personas

### Persona A: The First-Time International Traveler
- **Profile:** Maya S., 24, Graphic Designer applying for her first international tourist visa.
- **Pain Points:** Overwhelmed by legal jargon, fearful of uploading an incorrectly formatted photo, anxious about payment failure.
- **Needs:** Step-by-step guidance, clear photo upload requirements with live preview, immediate validation feedback.

### Persona B: The Frequent Business Traveler
- **Profile:** David K., 42, Regional Sales Director requiring a 90-day multi-entry business visa.
- **Pain Points:** Frustrated by repetitive data entry across multiple applications.
- **Needs:** Rapid profile prefill, automated passport data extraction via Simulated OCR, fast one-click checkout.

### Persona C: The Mobile-First Applicant
- **Profile:** Tariq A., 31, Freelance Consultant completing his visa application on a smartphone during transit.
- **Pain Points:** Unresponsive desktop-only forms, giant image uploads exhausting mobile cellular data.
- **Needs:** Fully responsive mobile UI, client-side photo compression, offline draft resilience.

### Persona D: The Family Application Coordinator
- **Profile:** Elena R., 38, Mother managing visa applications for a family of four.
- **Pain Points:** Losing track of multiple drafts, confusion over which documents belong to which applicant.
- **Needs:** Centralized applicant dashboard, clear draft status indicators, distinct session tracking.

### Persona E: The Senior Citizen Traveler
- **Profile:** Arthur M., 68, Retired Educator traveling for cultural tourism.
- **Pain Points:** Small font sizes, low-contrast buttons, confusing error banners.
- **Needs:** WCAG 2.1 AA accessibility, high-contrast UI, full keyboard navigation, conversational AI assistance.

## 2.4 Stakeholder Matrix

```mermaid
graph TD
    subgraph Primary Stakeholders
        A[Visa Applicant] -->|Fills, uploads, pays| Portal[Smart eVisa Portal]
        B[Consular Review Officer] -->|Reviews verified applications| DB[(Central PostgreSQL)]
        C[System Administrator] -->|Monitors health & audit logs| Infrastructure[Railway / Aiven / Supabase]
    end
    subgraph Secondary Stakeholders
        D[Government Immigration Agency] -->|Defines policy & compliance| AI_Context[Grounded Rule Base]
        E[Technical Support Team] -->|Investigates transaction logs| Error_Catalog[Error Handling System]
    end
```

## 2.5 System Architecture & Technology Stack

| Layer | Component | Technology Selection | Architectural Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend** | Framework & Build Tool | **React 18 + Vite** | High-performance SPA with instant HMR, optimized bundle chunking, and modular component architecture. |
| **Styling** | Design System | **Vanilla CSS (Design Tokens)** | Zero-dependency design system with CSS custom properties for dark mode, glassmorphism, and WCAG AA contrast. |
| **Form Management** | State & Validation | **Custom State + LocalStorage** | Reactive form state management with dirty checking, automatic schema validation, and 15s local persistence. |
| **Backend API** | Application Server | **FastAPI (Python 3.11+)** | High-throughput asynchronous REST API with automatic OpenAPI documentation and strict Pydantic validation. |
| **Database** | Relational Persistence | **PostgreSQL (Aiven Cloud)** | ACID-compliant relational storage for applicant profiles, draft applications, payment logs, and audit trails. |
| **Object Storage** | Document Storage | **Supabase Storage (S3-compatible)**| Secure, scalable cloud storage for compressed passport scans and supporting visa documentation. |
| **AI Intelligence** | LLM Engine | **OpenAI API (GPT-4o-mini)** | High-speed, context-injected reasoning strictly constrained to official visa rule prompts. |
| **Simulated OCR** | Document Parser | **Simulated OCR Adapter** | High-fidelity mock OCR engine returning structured passport metadata; designed for drop-in Tesseract/Vision replacement. |
| **Simulated Payment** | Transaction Engine | **Simulated Payment Gateway** | Realistic multi-channel payment engine modeling success, card failure, network timeout, and instant receipt generation. |
| **Hosting & CI/CD** | Cloud Infrastructure | **Vercel (UI) + Railway (API)** | Automated GitHub CI/CD deployments with edge caching, global CDN, and zero-downtime rolling updates. |

## 2.6 Design & Implementation Constraints
1. **Zero External Billing Dependencies:** For hackathon demonstration reliability, payment processing must utilize the internal Simulated Payment Gateway without requiring live banking credentials.
2. **Deterministic AI Boundaries:** The AI assistant must operate within strict system prompt boundaries and only reference supplied government guidelines, prohibiting speculative travel advice.
3. **Responsive Viewport Support:** The application must deliver complete functional parity across mobile viewports (360px width minimum), tablet viewports, and desktop resolutions (up to 4K).

## 2.7 Assumptions, Dependencies & Prototype Delimitations
- **Mock Database Authentication:** The prototype implements Mock Database Authentication supporting single active sessions per applicant (one device at a time) rather than complex multi-tenant JWT OAuth workflows.
- **Simulated OCR:** Passport OCR is simulated using representative document parsing algorithms. The software architecture strictly isolates this adapter behind an interface to allow seamless plug-and-play replacement with Google Cloud Vision, AWS Textract, or Tesseract in production.
- **Simulated Payment Gateway:** Payment transactions simulate realistic processing latencies (1.5s - 3.0s) and state transitions without connecting to live merchant accounts.
- **Official Rules AI Scoping:** The AI assistant receives government visa requirements and FAQs via system prompt context injection, ensuring deterministic and policy-compliant outputs.

## 2.8 Unified Application Lifecycle & State Machine
Every application within the Smart eVisa Portal adheres to a single, strict, deterministic lifecycle state machine:

```mermaid
stateDiagram-v2
    [*] --> Draft: Applicant initializes application (FR-003)
    Draft --> In_Progress: Applicant enters personal/passport info (FR-004)
    In_Progress --> In_Progress: 15s Autosave / Step Transitions (FR-007)
    In_Progress --> Review_Ready: All mandatory steps & documents valid (FR-017)
    Review_Ready --> In_Progress: Applicant edits prior step
    Review_Ready --> Payment_Pending: Declaration signed & checkout started (FR-016)
    Payment_Pending --> Review_Ready: Payment failed / Applicant retries
    Payment_Pending --> Submitted: Payment verified successfully (FR-016)
    Submitted --> Completed: Consular processing finished & Visa issued
    Completed --> [*]
```

### Application Lifecycle State Definitions

| Status Identifier | Formal Definition | Permitted Actions | Transition Trigger |
| :--- | :--- | :--- | :--- |
| `Draft` | Application initialized with visa category; no personal data persisted. | Edit Category, Delete Draft | Category confirmed -> `In_Progress` |
| `In_Progress` | Active application undergoing data entry or document upload. | Edit Steps 1–4, Upload, Autosave | All required fields valid -> `Review_Ready` |
| `Review_Ready` | All steps (Personal, Passport, Travel, Documents) passed validation. | Review summary, Edit steps, Sign | Declaration confirmed -> `Payment_Pending` |
| `Payment_Pending`| Applicant has proceeded to fee payment; transaction initiated. | Select method, Pay, Cancel | Payment successful -> `Submitted` |
| `Submitted` | Payment confirmed; immutable snapshot sealed for review. | View summary, Download PDF receipt | Application approved -> `Completed` |
| `Completed` | Final consular review completed and e-Visa issued. | Download official e-Visa PDF | Final state |

---

# 3. System Architecture & Data Design

## 3.1 C4 Architecture Models

### 3.1.1 C4 Context Diagram (Level 1)

```mermaid
C4Context
    title System Context Diagram for Smart eVisa Portal
    
    Person(applicant, "Visa Applicant", "Citizen or traveler applying for an electronic travel visa.")
    Enterprise_Boundary(b1, "Smart eVisa Ecosystem") {
        System(evisa_system, "Smart eVisa Portal", "Provides guided application wizard, automated OCR prefill, document management, and AI assistance.")
    }
    System_Ext(supabase, "Supabase Storage", "Encrypted S3-compatible cloud storage for passport photos and documents.")
    System_Ext(openai, "OpenAI API", "Provides context-grounded conversational assistance for visa queries.")
    SystemDb_Ext(aiven_pg, "Aiven PostgreSQL", "Cloud-hosted relational database storing application state, profiles, and audit logs.")

    Rel(applicant, evisa_system, "Fills applications, uploads documents, pays fees, and queries AI via HTTPS")
    Rel(evisa_system, aiven_pg, "Reads/Writes applicant data, drafts, and payments via async SQL pool")
    Rel(evisa_system, supabase, "Uploads compressed documents and generates signed URLs")
    Rel(evisa_system, openai, "Dispatches grounded prompts with system context")
```

### 3.1.2 C4 Container Diagram (Level 2)

```mermaid
C4Container
    title Container Diagram for Smart eVisa Portal
    
    Person(applicant, "Applicant", "Web/Mobile browser user")
    
    Container_Boundary(frontend_app, "Frontend Layer (Vercel)") {
        Container(spa, "Single Page Application", "React 18, Vite, Vanilla CSS", "Provides 5-step Wizard, 15s LocalStorage autosave, Canvas image compressor, and AI chat widget.")
    }
    
    Container_Boundary(backend_app, "Backend Layer (Railway)") {
        Container(api_gateway, "FastAPI REST Server", "Python 3.11, Pydantic, SQLAlchemy", "Handles authentication, validation, draft synchronization, simulated OCR, and payments.")
        Container(ai_service, "AI Context Service", "Python Async Engine", "Injects current form context into strict government prompt templates.")
        Container(sim_services, "Simulation Services", "Python Modules", "Executes simulated OCR parsing and payment state machine.")
    }
    
    ContainerDb(postgres, "PostgreSQL Database", "Aiven Cloud PostgreSQL 15", "Persists users, applications, applicant profiles, payments, and document metadata.")
    ContainerDb(object_store, "Supabase Object Store", "S3 Storage Bucket", "Stores compressed document binaries in structured application folders.")
    
    Rel(applicant, spa, "Interacts using HTTPS/TLS")
    Rel(spa, api_gateway, "Makes REST API calls JSON/HTTPS")
    Rel(api_gateway, postgres, "Executes parameterized SQL queries")
    Rel(api_gateway, object_store, "Stores and retrieves document assets")
    Rel(api_gateway, ai_service, "Delegates assistant queries")
    Rel(api_gateway, sim_services, "Invokes OCR and payment simulations")
```

### 3.1.3 C4 Component Diagram — Backend Architecture (Level 3)

```mermaid
C4Component
    title Component Diagram for FastAPI Backend Application
    
    Container_Boundary(api, "FastAPI Backend Application") {
        Component(auth_router, "Auth Router", "FastAPI APIRouter", "Handles mock database authentication and session status.")
        Component(app_router, "Application Router", "FastAPI APIRouter", "Manages application creation, wizard steps, and 15s draft sync.")
        Component(doc_router, "Document Router", "FastAPI APIRouter", "Coordinates file uploads, validations, and Supabase persistence.")
        Component(ocr_router, "Simulated OCR Router", "FastAPI APIRouter", "Parses uploaded passport images and extracts structured JSON.")
        Component(ai_router, "AI Assistant Router", "FastAPI APIRouter", "Provides context-aware conversational guidance with strict rule gating.")
        Component(pay_router, "Payment Router", "FastAPI APIRouter", "Processes simulated payment transactions and issues receipts.")
        
        Component(val_engine, "Validation Engine", "Pydantic Schemas", "Enforces strict input validation on all payloads.")
        Component(repo_layer, "Repository Layer", "SQLAlchemy ORM / Core", "Abstracts database queries and transaction boundaries.")
    }
    
    Rel(auth_router, repo_layer, "Validates credentials")
    Rel(app_router, repo_layer, "Saves draft state")
    Rel(doc_router, repo_layer, "Stores metadata")
    Rel(pay_router, repo_layer, "Updates payment logs")
```

---

## 3.2 PostgreSQL Database Schema & Data Dictionary

The PostgreSQL database architecture is normalized to 3NF, utilizing UUID primary keys, strict foreign key referential integrity with cascading deletes where appropriate, and optimized B-tree indexes.

```mermaid
erDiagram
    USERS ||--o{ APPLICATIONS : "creates"
    USERS ||--o| APPLICANT_PROFILES : "owns"
    APPLICATIONS ||--o{ DOCUMENTS : "contains"
    APPLICATIONS ||--o{ PAYMENTS : "records"
    APPLICATIONS ||--o{ AI_CHATS : "logs"

    USERS {
        uuid user_id PK
        string email UK
        string password_hash
        string full_name
        string phone_number
        timestamp created_at
        timestamp last_login_at
    }

    APPLICANT_PROFILES {
        uuid profile_id PK
        uuid user_id FK
        string passport_number
        string nationality
        date date_of_birth
        string gender
        timestamp updated_at
    }

    APPLICATIONS {
        uuid application_id PK
        uuid user_id FK
        string visa_category
        string status
        integer current_step
        integer progress_percentage
        jsonb form_data
        timestamp created_at
        timestamp updated_at
        timestamp submitted_at
    }

    DOCUMENTS {
        uuid document_id PK
        uuid application_id FK
        string document_type
        string file_name
        string storage_path
        string public_url
        integer file_size_bytes
        string mime_type
        jsonb extracted_ocr_data
        timestamp uploaded_at
    }

    PAYMENTS {
        uuid payment_id PK
        uuid application_id FK
        numeric amount
        string currency
        string payment_method
        string status
        string transaction_reference
        timestamp created_at
        timestamp completed_at
    }

    AI_CHATS {
        uuid chat_id PK
        uuid application_id FK
        uuid user_id FK
        string user_query
        string ai_response
        string step_context
        timestamp timestamp
    }
```

### Complete SQL Data Definition Language (DDL) Script

```sql
-- PostgreSQL DDL Specification for Smart eVisa Portal

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: USERS (Mock Database Authentication)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Table 2: APPLICANT_PROFILES (Reusable Applicant Information)
CREATE TABLE applicant_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    passport_number VARCHAR(50),
    nationality VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    passport_expiry DATE,
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_profile UNIQUE(user_id)
);

-- Table 3: APPLICATIONS (Central Application Entity & Form State)
CREATE TABLE applications (
    application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    visa_category VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Draft',
    current_step INTEGER NOT NULL DEFAULT 1,
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_app_status CHECK (status IN ('Draft', 'In Progress', 'Review Ready', 'Payment Pending', 'Submitted', 'Completed')),
    CONSTRAINT chk_progress_range CHECK (progress_percentage BETWEEN 0 AND 100)
);

-- Table 4: DOCUMENTS (Uploaded Supporting Evidence & Metadata)
CREATE TABLE documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    public_url TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    extracted_ocr_data JSONB DEFAULT '{}'::jsonb,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_doc_type CHECK (document_type IN ('passport_scan', 'applicant_photo', 'flight_itinerary', 'hotel_booking', 'bank_statement'))
);

-- Table 5: PAYMENTS (Simulated Gateway Transaction Audit Log)
CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'INITIATED',
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_payment_status CHECK (status IN ('INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED'))
);

-- Table 6: AI_CHATS (Conversational Audit Trail)
CREATE TABLE ai_chats (
    chat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(application_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    user_query TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    step_context VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Optimization: B-Tree Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_documents_app_id ON documents(application_id);
CREATE INDEX idx_payments_app_id ON payments(application_id);
CREATE INDEX idx_payments_tx_ref ON payments(transaction_reference);
CREATE INDEX idx_ai_chats_app_id ON ai_chats(application_id);
```

---

## 3.3 Local Client State & Storage Schema

To ensure seamless offline resilience, client-side state is synchronized every 15 seconds into browser `localStorage` under a standardized key: `evisa_draft_{application_id}`.

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
      "nationality": "OMN",
      "marital_status": "single",
      "occupation": "Software Engineer"
    },
    "passport": {
      "passport_number": "A12345678",
      "issuing_country": "OMN",
      "issue_date": "2022-01-10",
      "expiry_date": "2032-01-09",
      "place_of_issue": "Muscat"
    },
    "travel": {
      "intended_arrival_date": "2026-11-01",
      "port_of_entry": "DXB",
      "stay_duration_days": 14,
      "accommodation_address": "Grand Hyatt Dubai"
    }
  },
  "uploaded_documents": {
    "passport_scan": {
      "document_id": "c3d9a101-...",
      "file_name": "passport_scan_compressed.jpg",
      "public_url": "https://xyz.supabase.co/storage/v1/object/public/...",
      "status": "verified"
    }
  }
}
```

---

## 3.4 Core System Sequence Diagrams

### 3.4.1 15-Second Dual-Persistence Autosave Flow

```mermaid
sequenceDiagram
    autonumber
    actor Applicant as Applicant (UI)
    participant Timer as Autosave Timer (15s)
    participant LS as LocalStorage Engine
    participant API as FastAPI Draft Router
    participant DB as Aiven PostgreSQL

    Applicant->>Applicant: Modifies form input (e.g. Passport Number)
    Applicant->>LS: Instantly flags draft state as dirty (`is_dirty: true`)
    Timer->>Timer: 15-second interval expires
    opt If draft is dirty (`is_dirty == true`)
        Timer->>LS: Writes updated form snapshot to `evisa_draft_{id}`
        Timer->>API: Dispatches async `PUT /api/v1/applications/{id}/draft`
        API->>DB: Updates `applications.form_data`, `updated_at`, `progress_percentage`
        DB-->>API: Returns 200 OK (updated timestamp)
        API-->>Applicant: Returns sync confirmation
        Applicant->>Applicant: Updates UI badge ("All changes saved at 22:45:00")
        Applicant->>LS: Clears dirty flag (`is_dirty: false`)
    end
```

### 3.4.2 Simulated Passport OCR Data Extraction Flow

```mermaid
sequenceDiagram
    autonumber
    actor Applicant as Applicant
    participant Canvas as Canvas Compressor
    participant UI as Document Upload Card
    participant API as FastAPI OCR Router
    participant SimOCR as Simulated OCR Engine
    participant DB as Aiven PostgreSQL

    Applicant->>UI: Selects passport image file (e.g. 5.4MB JPEG)
    UI->>Canvas: Passes image file to HTML5 Canvas
    Canvas->>Canvas: Resizes to max 2048x2048 & compresses to JPEG (quality 0.82)
    Canvas-->>UI: Returns normalized file (< 850KB)
    UI->>API: Dispatches `POST /api/v1/ocr/passport-scan` (Multipart FormData)
    API->>SimOCR: Parses passport image format & runs extraction
    SimOCR-->>API: Returns structured data (Names, Passport No, DOB, Expiry, Nationality)
    API->>DB: Stores extracted payload in `documents.extracted_ocr_data`
    API-->>UI: Returns JSON extraction response
    UI->>UI: Displays OCR Success banner & automatically pre-fills Step 2 fields
    UI->>Applicant: Prompts applicant to review and verify pre-filled data
```

### 3.4.3 Grounded AI Visa Assistant Query Flow

```mermaid
sequenceDiagram
    autonumber
    actor Applicant as Applicant
    participant ChatUI as Floating AI Widget
    participant API as FastAPI AI Router
    participant Prompt as Context Injector
    participant LLM as OpenAI Engine
    participant DB as Aiven PostgreSQL

    Applicant->>ChatUI: Enters query ("Can I stay longer than 30 days on a Tourist Visa?")
    ChatUI->>API: Dispatches `POST /api/v1/ai/chat` with `{query, current_step, visa_category}`
    API->>Prompt: Injects current form context + Official Government Visa Policy Rules
    Note over Prompt: Strict Rule: Do not hallucinate. Use ONLY official context.
    Prompt->>LLM: Dispatches structured system + user prompt
    LLM-->>API: Returns concise, policy-compliant answer
    API->>DB: Logs interaction in `ai_chats` table
    API-->>ChatUI: Returns 200 OK with `{response, references}`
    ChatUI->>Applicant: Renders assistant bubble with cited government regulation clause
```

### 3.4.4 Simulated Payment Gateway Transaction Flow

```mermaid
sequenceDiagram
    autonumber
    actor Applicant as Applicant
    participant Review as Review Step
    participant PayUI as Simulated Payment Gateway UI
    participant API as FastAPI Payment Router
    participant SimPay as Simulated Gateway Engine
    participant DB as Aiven PostgreSQL

    Applicant->>Review: Signs declaration checkbox and clicks "Proceed to Payment"
    Review->>PayUI: Transitions state to `Payment_Pending`
    Applicant->>PayUI: Selects Payment Method (Card/UPI/NetBanking) & clicks "Pay $85.00"
    PayUI->>API: Dispatches `POST /api/v1/payments/initialize`
    API->>DB: Inserts payment record with status `INITIATED`
    API-->>PayUI: Returns transaction reference `TX-984210`
    PayUI->>PayUI: Displays realistic processing spinner (1.8s delay)
    PayUI->>API: Dispatches `POST /api/v1/payments/verify` with `{transaction_reference}`
    API->>SimPay: Evaluates simulated payment state
    alt Simulated Success Case
        SimPay-->>API: Transaction Approved
        API->>DB: Updates payment status to `SUCCESS` & application to `Submitted`
        API-->>PayUI: Returns 200 OK with Payment Receipt
        PayUI->>PayUI: Renders Success Screen with downloadable PDF receipt link
    else Simulated Failure / Insufficient Funds
        SimPay-->>API: Transaction Declined (Simulated Error)
        API->>DB: Updates payment status to `FAILED` (preserves application in `Review_Ready`)
        API-->>PayUI: Returns 400 Bad Request with retry prompt
        PayUI->>Applicant: Displays clear error message & allows one-click retry without data loss
    end
```

---

# 4. Specific Functional Requirements (FR-001 – FR-017)

## FR-001: Mock Database User Authentication & Session Control
- **Requirement Statement:** The system SHALL provide a Mock Database Authentication mechanism that validates applicant credentials against pre-seeded records in the `users` table and enforces a single active session per applicant (one device at a time).
- **User Story:** As an applicant, I want to log into the portal using my email and password so that I can securely create, edit, and monitor my visa applications.
- **Priority:** P0 (Critical)
- **Preconditions:** The applicant must possess valid pre-seeded or registered credentials in the database.
- **Main Success Flow:**
  1. Applicant navigates to `/login` and enters registered email and password.
  2. System validates input formats client-side on blur.
  3. Client dispatches `POST /api/v1/auth/login`.
  4. Backend verifies credentials against `users` table and updates `last_login_at`.
  5. System returns user session object (`user_id`, `email`, `full_name`).
  6. Frontend stores active session in application state and redirects to the Applicant Dashboard (`/dashboard`).
- **Alternative & Exception Flows:**
  - *AF-001.1 (Invalid Credentials):* If email or password does not match database records, the system SHALL return HTTP 401 with error code `AUTH_INVALID_CREDENTIALS` and render an inline error message without clearing the entered email.
  - *AF-001.2 (Concurrent Session Conflict):* If an existing active session is detected on another device, the system SHALL invalidate the previous session and establish the new session.
- **UI / UX Specification:** Clean login card with email input, password input with visibility toggle, "Remember Me" toggle, and demo credential quick-fill buttons.
- **Acceptance Criteria:**
  - System successfully authenticates valid mock users within 200ms.
  - System rejects malformed emails and invalid passwords with human-readable error messages.
  - Single active session is strictly enforced.

---

## FR-002: Applicant Central Dashboard
- **Requirement Statement:** The system SHALL render a centralized Applicant Dashboard displaying all existing applications associated with the authenticated applicant, categorized by lifecycle status, with clear progress bars and resume actions.
- **User Story:** As an applicant, I want to see a summary of all my visa applications so that I can immediately check their progress or resume incomplete drafts.
- **Priority:** P0 (Critical)
- **Preconditions:** Applicant MUST be authenticated.
- **Main Success Flow:**
  1. Applicant accesses `/dashboard`.
  2. System retrieves all records from `applications` matching the applicant's `user_id`.
  3. System renders application cards displaying: Visa Category, Reference ID, Status Badge (`Draft`, `In Progress`, `Review Ready`, `Payment Pending`, `Submitted`, `Completed`), Progress Percentage Bar, and Last Saved relative timestamp.
  4. Applicant clicks "Resume Application" on any active draft to navigate directly to the incomplete wizard step.
- **Alternative Flows:**
  - *AF-002.1 (Zero Applications):* If no applications exist, render a welcoming empty-state card with a prominent "Start New Visa Application" call-to-action.
- **Acceptance Criteria:**
  - Dashboard updates dynamically when applications change state.
  - Status badges adhere to standard color coding: Gray (`Draft`), Blue (`In Progress`), Yellow (`Review Ready`), Purple (`Payment Pending`), Green (`Submitted` / `Completed`).

---

## FR-003: Application Initialization & Visa Category Selection
- **Requirement Statement:** The system SHALL allow applicants to initialize a new visa application by selecting a valid visa category (Tourist Standard, Tourist Multi-Entry, Business Expedited, Student Academic, Medical Emergency) and generating a unique application tracking record.
- **User Story:** As an applicant, I want to choose my visa category and view its specific requirements and fee structure before starting the form.
- **Priority:** P0 (Critical)
- **Preconditions:** Applicant MUST be authenticated.
- **Main Success Flow:**
  1. Applicant clicks "Start New Application" on the Dashboard.
  2. System presents interactive category cards displaying: Category Title, Maximum Stay Duration, Validity Period, Processing Time, Fee Breakdown, and Required Document Checklist.
  3. Applicant selects a category and clicks "Create Application".
  4. System dispatches `POST /api/v1/applications` and creates a new database record with status `Draft`.
  5. System navigates the applicant into Step 1 of the Guided Wizard.
- **Acceptance Criteria:**
  - Creating an application generates a valid UUID and sets initial progress to 0%.

---

## FR-004: Multi-Step Guided Application Wizard
- **Requirement Statement:** The system SHALL guide the applicant through a structured 5-step application wizard:
  - **Step 1: Personal Details** (Full name, DOB, gender, nationality, marital status, occupation).
  - **Step 2: Passport Information** (Passport number, issuing country, issue date, expiry date, place of issue).
  - **Step 3: Travel & Accommodation Details** (Intended arrival date, port of entry, stay duration, accommodation address).
  - **Step 4: Supporting Documents** (Passport copy, photo, itinerary, hotel booking, bank statement).
  - **Step 5: Review, Declaration & Payment** (Unified accordion review, legal declaration, payment execution).
- **User Story:** As an applicant, I want the long application broken down into logical steps so that I do not feel overwhelmed and can track my progress.
- **Priority:** P0 (Critical)
- **Preconditions:** Application record MUST exist in `Draft` or `In Progress` status.
- **Main Success Flow:**
  1. Applicant fills required fields for the active step.
  2. Applicant clicks "Save & Continue".
  3. Validation engine verifies all fields in the current step.
  4. If valid, system advances `current_step`, recalculates progress, triggers autosave, and smoothly scrolls to the top of the next step.
- **Alternative Flows:**
  - *AF-004.1 (Step Validation Failure):* If any mandatory field is invalid, prevent step advance, focus the first invalid field, and display clear inline error text.
  - *AF-004.2 (Backward Navigation):* Applicant clicks "Previous Step". System preserves all entered data without triggering destructive validation.
- **Acceptance Criteria:**
  - Applicant can navigate freely between completed steps.
  - Incomplete steps cannot be bypassed without completing required fields.

---

## FR-005: Dynamic Progress Calculation & Completion Tracker
- **Requirement Statement:** The system SHALL compute and display a real-time progress percentage bar across the application wizard using a deterministic weighted field completion formula.
- **Formula Specification:**
$$	ext{Progress \%} = \sum_{s=1}^{5} \left( rac{	ext{Completed Mandatory Fields in Step } s}{	ext{Total Mandatory Fields in Step } s} 	imes W_s 
ight)$$
*Where weights are allocated as:*
- Step 1 (Personal Details): $W_1 = 20\%$
- Step 2 (Passport Information): $W_2 = 25\%$
- Step 3 (Travel Details): $W_3 = 15\%$
- Step 4 (Document Uploads): $W_4 = 25\%$
- Step 5 (Review & Declaration): $W_5 = 15\%$
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - Progress bar updates dynamically as fields are completed.
  - Progress reaches 100% only when all mandatory fields, documents, and declarations are valid.

---

## FR-006: Dual-Layer Client/Server Validation Engine
- **Requirement Statement:** The system SHALL enforce dual-layer validation:
  1. **Client-Side (Instant):** Evaluates field correctness on blur and change using standard regex patterns (e.g. Email format, Passport Number format `^[A-Z0-9]{6,9}$`, Expiry Date $\ge 6	ext{ months from arrival}$).
  2. **Server-Side (Authoritative):** Evaluates incoming payloads against strict Pydantic models before committing to PostgreSQL.
- **Priority:** P0 (Critical)
- **Acceptance Criteria:**
  - Validation errors highlight the input border in red (`#EF4444`), display an icon, and provide clear guidance text (e.g., *"Passport must be valid for at least 6 months beyond travel date"*).

---

## FR-007: 15-Second Dual-Persistence Autosave Engine
- **Requirement Statement:** The system SHALL implement a background autosave engine that runs every 15 seconds, synchronizing modified form state to browser `localStorage` and dispatching an asynchronous update to the backend database.
- **User Story:** As an applicant, I want my application saved automatically in the background so that I never lose work if my browser closes.
- **Priority:** P0 (Critical)
- **Technical Specification:**
  - System maintains an in-memory `is_dirty` boolean flag set to `true` whenever any input field changes.
  - Every 15 seconds, if `is_dirty == true`, the engine writes the form snapshot to `localStorage` and dispatches `PUT /api/v1/applications/{id}/draft`.
  - Upon 200 OK response, the engine resets `is_dirty = false` and updates the UI indicator: *"Saved just now"*.
- **Acceptance Criteria:**
  - No network calls are dispatched if no fields have changed during the 15-second window.
  - Network disconnection does not block the applicant; local draft remains cached in `localStorage`.

---

## FR-008: Crash Recovery & Session State Restoration
- **Requirement Statement:** The system SHALL detect uncommitted local drafts upon application launch or page refresh, prompting the applicant to restore their latest session seamlessly.
- **User Story:** As an applicant who experienced a power outage or accidental tab closure, I want to resume exactly where I left off without retyping information.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - On page reload, the portal compares the timestamp of `localStorage` draft vs. backend database draft, loading the more recent version.

---

## FR-009: Applicant Profile & Prefill Management
- **Requirement Statement:** The system SHALL maintain an `applicant_profiles` record for each registered user and provide one-click prefilling of recurring passport, nationality, and contact details into new applications.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - When initiating a new application, applicants are prompted: *"Use saved profile information?"* Selecting 'Yes' pre-fills Step 1 and Step 2 instantly.

---

## FR-010: Resume Application Workflow & Deep Linking
- **Requirement Statement:** The system SHALL support direct deep linking to specific wizard steps (e.g., `/apply/{application_id}/step/3`), validating that preceding steps have been completed before rendering the target step.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - Accessing a deep link for an uninitialized step gracefully redirects the applicant to the earliest incomplete step.

---

## FR-011: Document Management & Multi-File Upload Engine
- **Requirement Statement:** The system SHALL provide an interactive Document Upload interface in Step 4 supporting the upload, preview, validation, and deletion of required visa documents:
  1. Passport Identity Page Scan (`passport_scan`) — Mandatory
  2. Applicant Passport-Style Photo (`applicant_photo`) — Mandatory
  3. Round-Trip Flight Itinerary (`flight_itinerary`) — Mandatory for Tourist
  4. Hotel Booking / Proof of Accommodation (`hotel_booking`) — Mandatory for Tourist
  5. 3-Month Bank Statement (`bank_statement`) — Conditional based on category
- **Priority:** P0 (Critical)
- **UI Specification:** Each document slot features a dedicated Upload Card supporting Drag-and-Drop, File Browser selection, Live Preview thumbnail, File Size badge, and Delete/Replace actions.
- **Acceptance Criteria:**
  - Rejects unsupported file extensions (permits only `.jpg`, `.jpeg`, `.png`, `.pdf`).
  - Enforces pre-compression file size limit of 10MB and post-compression target of < 1MB.

---

## FR-012: Supabase Cloud Object Storage Integration
- **Requirement Statement:** The system SHALL upload validated, compressed documents to Supabase Storage in isolated bucket structures: `visa-documents/{application_id}/{document_type}_{timestamp}.{ext}`.
- **Priority:** P0 (Critical)
- **Acceptance Criteria:**
  - Uploaded files generate signed, accessible URLs stored in the `documents` table.

---

## FR-013: Client-Side Canvas Image Compression Engine
- **Requirement Statement:** The system SHALL compress and normalize all uploaded raster images (`.jpg`, `.jpeg`, `.png`) directly in the applicant's browser using the HTML5 Canvas API prior to network transmission.
- **Compression Parameters:**
  - Target Maximum Dimension: $2048 	imes 2048$ pixels (aspect ratio maintained).
  - Target Output Format: `image/jpeg`.
  - Output Compression Quality: $0.82$.
  - Target File Size: $< 1.0	ext{ MB}$.
- **Priority:** P0 (Critical)
- **Acceptance Criteria:**
  - A 6.5MB phone camera photo compresses to $< 800	ext{ KB}$ in $< 450	ext{ms}$ client-side with zero visible degradation of text legibility.

---

## FR-014: Simulated Passport Optical Character Recognition (OCR) Engine
- **Requirement Statement:** The system SHALL provide a Simulated Passport OCR Engine that parses uploaded passport identity scans, extracts structured passport metadata, and automatically populates Step 2 form fields while allowing full manual editing by the applicant.
- **Extracted Fields:**
  - Given Names (`first_name`)
  - Surname (`last_name`)
  - Passport Number (`passport_number`)
  - Nationality / Country Code (`nationality`)
  - Date of Birth (`date_of_birth`)
  - Passport Expiration Date (`expiry_date`)
  - Gender (`gender`)
- **Delimitation Note:** *Simulated OCR extracts passport information for demonstration. The architecture isolates the OCR service behind a standard interface to support future drop-in replacement with Tesseract, Google Cloud Vision, or Azure Computer Vision.*
- **Priority:** P0 (Critical)
- **Acceptance Criteria:**
  - Uploading a sample passport image returns structured JSON within 1.2 seconds.
  - Populated fields display an "Auto-filled via OCR" helper badge.
  - Applicant can edit any extracted field if discrepancies occur.

---

## FR-015: Grounded Context-Aware AI Visa Assistant
- **Requirement Statement:** The system SHALL provide a conversational AI Visa Assistant embedded as a floating widget across all application steps. The assistant SHALL generate responses strictly using official government visa regulations and FAQs provided in its context prompt and SHALL NOT invent policies or hallucinate requirements.
- **Mandatory Policy Clarification:** *The AI Assistant answers using the official government rules and FAQs provided within the application context and does not invent policies.*
- **Context Injection Payload:**
  - Current Wizard Step (e.g. `Step 4: Documents`)
  - Selected Visa Category (e.g. `Tourist Multi-Entry`)
  - Applicant's Nationality & Travel Dates
  - Official Sovereign Visa Guidelines Document Context
- **Priority:** P0 (Critical)
- **Acceptance Criteria:**
  - Assistant accurately explains photo background rules, stay extensions, and processing times.
  - Assistant explicitly admits limitations and directs user to official consular support if asked questions outside its official rule base.

---

## FR-016: Simulated Multi-Channel Payment Gateway & Transaction Engine
- **Requirement Statement:** The system SHALL provide a Simulated Payment Gateway supporting realistic payment workflows across multiple payment methods (Credit/Debit Card, Net Banking, UPI/QR Code, Digital Wallets) with deterministic state transitions, failure recovery, and receipt generation.
- **Priority:** P0 (Critical)
- **Supported Payment Channels:**
  1. Credit / Debit Card (Visa, Mastercard, Amex simulation)
  2. UPI / Instant QR Code Payment simulation
  3. Net Banking (Major simulated banks)
  4. Digital Wallets (Apple Pay / Google Pay simulation)
- **Transaction State Machine:**
  - `INITIATED` $
ightarrow$ `PROCESSING` (1.5s simulated latency) $
ightarrow$ `SUCCESS` or `FAILED`.
- **Alternative Flow (Payment Retry):**
  - If a payment simulation fails (e.g. simulated card decline), the system SHALL NOT delete the application draft. It records the failure in `payments`, transitions status to `Review_Ready`, and allows immediate retry with another payment method.
- **Acceptance Criteria:**
  - Successful payment generates a unique transaction reference (`TX-XXXXXX`) and updates application status to `Submitted`.
  - Generates an interactive digital receipt with download capability.

---

## FR-017: Comprehensive Review, Declaration & Final Submission Engine
- **Requirement Statement:** The system SHALL provide an interactive Step 5 Review screen rendering a unified summary accordion of all entered data and uploaded documents, requiring a formal legal declaration before enabling final submission.
- **Priority:** P0 (Critical)
- **Review Screen Capabilities:**
  - Expandable/Collapsible accordions for Personal, Passport, Travel, and Document sections.
  - "Quick-Edit" action buttons next to each section allowing instant jump to that step.
  - Mandatory legal checkbox: *"I hereby declare under penalty of perjury that all information provided is accurate and authentic."*
  - Submission button enabled only when declaration is checked and all validations pass.
- **Acceptance Criteria:**
  - Submitting seals the application, generates an immutable JSON snapshot, and transitions status to `Submitted`.

---

# 5. System Interfaces & REST API Specifications

## 5.1 Global API Standards & Response Format
All REST API endpoints adhere to standard REST conventions, consuming and producing `application/json` (except multipart file upload endpoints).

```json
{
  "success": true,
  "status_code": 200,
  "message": "Operation completed successfully",
  "data": {},
  "timestamp": "2026-08-27T22:45:00Z"
}
```

## 5.2 Authentication & Session Endpoints

### `POST /api/v1/auth/login`
- **Description:** Authenticates user via Mock Database Authentication and returns session metadata.
- **Request Body:**
```json
{
  "email": "applicant@example.com",
  "password": "password123"
}
```
- **Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "email": "applicant@example.com",
    "full_name": "Husain Al-Mansoor",
    "active_session": true
  }
}
```

---

## 5.3 Application & Draft Endpoints

### `POST /api/v1/applications`
- **Description:** Initializes a new visa application record.
- **Request Body:**
```json
{
  "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "visa_category": "tourist_standard"
}
```
- **Response Body (201 Created):**
```json
{
  "success": true,
  "data": {
    "application_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "status": "Draft",
    "current_step": 1,
    "progress_percentage": 0
  }
}
```

### `PUT /api/v1/applications/{application_id}/draft`
- **Description:** Synchronizes intermediate form state via the 15-second autosave engine.
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
- **Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "application_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "updated_at": "2026-08-27T22:45:15Z"
  }
}
```

---

## 5.4 Document Upload & Storage Endpoints

### `POST /api/v1/documents/upload`
- **Description:** Uploads compressed document to Supabase Storage and records metadata.
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `application_id` (UUID), `document_type` (String), `file` (Binary File).
- **Response Body (201 Created):**
```json
{
  "success": true,
  "data": {
    "document_id": "e4f3c2b1-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
    "document_type": "passport_scan",
    "public_url": "https://xyz.supabase.co/storage/v1/object/public/visa-documents/...",
    "file_size_bytes": 482104,
    "mime_type": "image/jpeg"
  }
}
```

---

## 5.5 Simulated OCR Extraction Endpoint

### `POST /api/v1/ocr/passport-scan`
- **Description:** Parses passport scan and returns extracted metadata for prefilling.
- **Content-Type:** `multipart/form-data`
- **Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "extracted_fields": {
      "first_name": "HUSAIN",
      "last_name": "AL-MANSOOR",
      "passport_number": "A98765432",
      "nationality": "OMN",
      "date_of_birth": "1998-05-14",
      "expiry_date": "2032-05-13",
      "gender": "M"
    },
    "confidence_score": 0.98,
    "simulation_mode": true
  }
}
```

---

## 5.6 Grounded AI Assistant Endpoint

### `POST /api/v1/ai/chat`
- **Description:** Answers applicant queries using context-injected official visa rules.
- **Request Body:**
```json
{
  "application_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "user_query": "What are the photo background requirements?",
  "current_step": "Step 4: Supporting Documents",
  "visa_category": "tourist_standard"
}
```
- **Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "response": "According to official government visa specifications, applicant photos must have a plain, solid off-white or light grey background with no shadows. Selfies or patterned backgrounds will result in application rejection.",
    "rule_reference": "Immigration Rule Annex 4.1 (Biometric Specifications)",
    "suggested_actions": ["Upload New Photo", "Check Photo Dimensions"]
  }
}
```

---

## 5.7 Simulated Payment Gateway Endpoints

### `POST /api/v1/payments/initialize`
- **Description:** Initiates payment transaction for application review fees.
- **Request Body:**
```json
{
  "application_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "amount": 85.00,
  "currency": "USD",
  "payment_method": "credit_card"
}
```
- **Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "payment_id": "f8a9b0c1-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
    "transaction_reference": "TX-EVISA-2026-89421",
    "status": "INITIATED"
  }
}
```

### `POST /api/v1/payments/verify`
- **Description:** Verifies payment completion, marks application as `Submitted`, and generates receipt.
- **Request Body:**
```json
{
  "transaction_reference": "TX-EVISA-2026-89421",
  "simulation_outcome": "SUCCESS"
}
```
- **Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "transaction_reference": "TX-EVISA-2026-89421",
    "status": "SUCCESS",
    "application_status": "Submitted",
    "receipt_url": "/api/v1/payments/receipt/TX-EVISA-2026-89421.pdf"
  }
}
```

---

## 5.8 Unified Error Code Catalog

| Error Code | HTTP Status | Description / Trigger Condition | User Remediation Action |
| :--- | :--- | :--- | :--- |
| `AUTH_INVALID_CREDENTIALS` | 401 | Email or password does not match database. | Re-enter correct credentials. |
| `AUTH_SESSION_EXPIRED` | 401 | Session has expired or logged in on another device. | Re-authenticate at `/login`. |
| `APP_NOT_FOUND` | 404 | Application ID does not exist. | Return to dashboard. |
| `APP_INVALID_STATE` | 400 | Attempted action not permitted in current status. | Follow wizard step sequence. |
| `DOC_INVALID_MIME_TYPE` | 415 | File format is not `.jpg`, `.png`, or `.pdf`. | Upload a supported image or PDF. |
| `DOC_SIZE_EXCEEDED` | 413 | Pre-compression file exceeds 10MB limit. | Select a smaller file. |
| `OCR_EXTRACTION_FAILED` | 422 | Passport image was illegible or corrupted. | Manually enter details or re-upload. |
| `PAYMENT_DECLINED` | 402 | Simulated card payment was declined. | Try another payment method. |
| `AI_SERVICE_UNAVAILABLE` | 503 | OpenAI API rate-limited or offline. | Continue application; AI will resume. |

---

# 6. Non-Functional Requirements (NFRs)

## 6.1 Performance & Scalability Requirements
- **NFR-001 (Client-Side Compression Speed):** In-browser Canvas image compression SHALL complete in $< 500	ext{ms}$ for images up to 8MB on standard mobile devices.
- **NFR-002 (API Response Times):** 95% of non-AI REST API requests (`/draft`, `/applications`, `/documents`) SHALL respond in $< 250	ext{ms}$ under standard network conditions.
- **NFR-003 (Autosave Efficiency):** Background 15-second draft synchronization SHALL execute asynchronously without freezing UI input threads or causing input lag.

## 6.2 Security & Privacy Architecture (OWASP Top 10)
- **NFR-004 (Input Sanitization):** All string inputs across API endpoints SHALL be sanitized against SQL Injection and Cross-Site Scripting (XSS) via Pydantic model validation.
- **NFR-005 (File Upload Security):** The backend SHALL inspect file byte magic numbers (not solely file extensions) to prevent malicious executable uploads.
- **NFR-006 (Rate Limiting):** API endpoints SHALL enforce rate limiting of 60 requests per minute per IP to prevent denial-of-service attempts.
- **NFR-007 (Security Headers):** The application SHALL emit strict HTTP security headers:
```http
Content-Security-Policy: default-src 'self'; img-src 'self' data: https://*.supabase.co; script-src 'self';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## 6.3 Reliability, Availability & Fault Tolerance
- **NFR-008 (Offline Draft Recovery):** In the event of backend network loss, all form edits SHALL persist in `localStorage`, synchronizing automatically when connectivity is restored.
- **NFR-009 (AI Graceful Degradation):** If the external OpenAI API becomes unreachable, the portal SHALL render a non-blocking toast notification (*"AI Assistant is temporarily offline. Application submission remains fully functional."*) and permit uninterrupted form completion.

## 6.4 Accessibility Standards (WCAG 2.1 AA)
- **NFR-010 (Color Contrast):** All UI text and interactive elements SHALL maintain a minimum contrast ratio of $4.5:1$ against adjacent backgrounds (and $3:1$ for large text/icons).
- **NFR-011 (Full Keyboard Navigation):** Every interactive control (inputs, buttons, accordion headers, upload drop zones) SHALL be fully navigable and operable via standard `Tab`, `Shift+Tab`, `Enter`, and `Space` keystrokes.
- **NFR-012 (Screen Reader Annotations):** All form inputs and dynamic indicators SHALL feature explicit `aria-label`, `aria-describedby`, and `aria-live` attributes to communicate real-time autosave and validation updates to assistive technologies.

## 6.5 Usability & Responsive Form Factor Specifications
- **NFR-013 (Responsive Layout):** The application layout SHALL adapt fluidly across screen widths ranging from 360px (mobile) to 2560px (ultra-wide desktop) without horizontal scrolling or broken elements.

---

# 7. DevOps, Deployment & Monitoring Architecture

## 7.1 Cloud Infrastructure Topography

```mermaid
graph TD
    Client[Web & Mobile Clients] -->|HTTPS / Global CDN| Vercel[Vercel Frontend Platform]
    Vercel -->|REST API Calls / TLS| Railway[Railway FastAPI App Server]
    Railway -->|Async Connection Pool| Aiven[(Aiven PostgreSQL 15)]
    Railway -->|Signed S3 REST Calls| Supabase[(Supabase Storage Bucket)]
    Railway -->|Grounded Prompt Calls| OpenAI[OpenAI API Engine]
```

## 7.2 Environment Configuration Matrix

### Frontend (`.env.frontend`)
```bash
VITE_API_BASE_URL=https://api.evisa-portal.railway.app
VITE_APP_ENV=production
VITE_AUTOSAVE_INTERVAL_MS=15000
VITE_ENABLE_SIMULATED_SERVICES=true
```

### Backend (`.env.backend`)
```bash
DATABASE_URL=postgresql+asyncpg://avnadmin:secret@pg-evisa-aiven.aivencloud.com:18420/defaultdb
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...
OPENAI_API_KEY=sk-proj-...
CORS_ORIGINS=https://evisa-portal.vercel.app,http://localhost:5173
PORT=8000
```

## 7.3 CI/CD Pipeline & GitHub Strategy
- **Branching Model:** `main` (production deployment), `staging` (pre-demo validation), `feature/xxx` (modular feature branches).
- **Automated Verification:** GitHub Actions pipeline runs on every push:
  1. Linting & Formatting (`eslint`, `black`, `flake8`)
  2. Frontend & Backend Unit Tests (`vitest`, `pytest`)
  3. Automatic Preview Deployment on Vercel & Railway.

## 7.4 Analytics Instrumentation & Funnel Tracking
The frontend instruments custom lightweight analytics events to monitor the conversion funnel and detect user friction points:

```mermaid
graph LR
    E1[app_started] --> E2[step1_personal_completed]
    E2 --> E3[step2_passport_completed]
    E3 --> E4[step3_travel_completed]
    E4 --> E5[step4_docs_uploaded]
    E5 --> E6[step5_review_reached]
    E6 --> E7[payment_success]
    E7 --> E8[application_submitted]
```

## 7.5 Structured Logging & Observability
Backend logs are emitted in structured JSON format with contextual request IDs for traceability:
```json
{
  "timestamp": "2026-08-27T22:45:00.124Z",
  "level": "INFO",
  "request_id": "req-984a-11ee",
  "endpoint": "PUT /api/v1/applications/9b1deb4d/draft",
  "status_code": 200,
  "duration_ms": 42.6,
  "user_id": "a0eebc99"
}
```

---

# 8. Quality Assurance & Verification Strategy

## 8.1 Testing Strategy & Test Pyramid

```mermaid
graph TD
    E2E[End-to-End Tests: Cypress / Playwright - 20 Tests<br/>Complete User Journey: Login -> Wizard -> OCR -> Payment -> Submission]
    Int[Integration Tests: Pytest & React Testing Library - 50 Tests<br/>API Endpoints, Supabase Storage, 15s Autosave, OCR Parsing]
    Unit[Unit Tests: Vitest & Pytest - 80+ Tests<br/>Validators, Canvas Compression, Progress Formulas, Pydantic Schemas]
    
    Unit --> Int
    Int --> E2E
```

## 8.2 Detailed Test Suite Matrix

### Module 1: Authentication & Session Tests

| Test Case ID | Test Description | Input Data | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| `TC-AUTH-001` | Valid user login | Correct email and password | Redirects to `/dashboard`; session initialized. | PASS |
| `TC-AUTH-002` | Invalid password | Valid email, incorrect password | Renders `AUTH_INVALID_CREDENTIALS` error; preserves email. | PASS |
| `TC-AUTH-003` | Malformed email input | `user@invalid` | Client-side validation blocks submit on blur. | PASS |
| `TC-AUTH-004` | Single session enforcement | Login on second browser | Prior session invalidated; new session established. | PASS |

### Module 2: Wizard & Autosave Tests

| Test Case ID | Test Description | Input Data | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| `TC-WIZ-001` | Step 1 valid advance | All mandatory personal fields filled | Advances to Step 2; progress updates to 20%. | PASS |
| `TC-WIZ-002` | Step 1 incomplete block | Missing Last Name | Advance blocked; red border on Last Name. | PASS |
| `TC-WIZ-003` | 15-second autosave | Modify passport field; wait 15s | LocalStorage updated; `PUT /draft` dispatched; badge shows saved. | PASS |
| `TC-WIZ-004` | Offline draft preservation | Disconnect network; edit form | LocalStorage updates; syncs automatically on reconnect. | PASS |

### Module 3: Document Management & Simulated OCR Tests

| Test Case ID | Test Description | Input Data | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| `TC-DOC-001` | Canvas image compression | 6.5MB phone photo | Compressed to $< 900	ext{KB}$; uploaded to Supabase. | PASS |
| `TC-DOC-002` | Invalid file format | `.exe` or `.txt` file | Rejected immediately with `DOC_INVALID_MIME_TYPE`. | PASS |
| `TC-DOC-003` | Simulated OCR extraction | Passport image scan | Extracts names, passport number, DOB; auto-populates Step 2. | PASS |
| `TC-DOC-004` | OCR manual field override | Edit extracted passport number | Edited value persists into draft and database. | PASS |

### Module 4: Grounded AI Assistant Tests

| Test Case ID | Test Description | Input Data | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| `TC-AI-001` | Government visa rule query | "Can I extend my 30-day tourist visa?" | Returns official policy explanation with rule citation. | PASS |
| `TC-AI-002` | Out-of-scope query | "Write a poem about visas" | Politely declines and refocuses on visa application help. | PASS |
| `TC-AI-003` | Offline fallback | Disable OpenAI API | Renders non-blocking notification; form remains usable. | PASS |

### Module 5: Simulated Payment & Final Submission Tests

| Test Case ID | Test Description | Input Data | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| `TC-PAY-001` | Successful card payment | Valid simulated card | 1.8s spinner $
ightarrow$ Success Screen $
ightarrow$ `Submitted` status. | PASS |
| `TC-PAY-002` | Simulated payment failure | Declining test card | Renders retry prompt; application stays in `Review_Ready`. | PASS |
| `TC-PAY-003` | Final submission snapshot | Click final submit after payment | Sealed immutable JSON stored in database; PDF receipt created. | PASS |

## 8.3 Requirements Traceability Matrix

| Requirement ID | Requirement Name | Covered Unit Tests | Covered Integration / E2E Tests |
| :--- | :--- | :--- | :--- |
| `FR-001` | Mock Database Auth | `UT-AUTH-01..04` | `TC-AUTH-001..004` |
| `FR-002` | Applicant Dashboard | `UT-DASH-01..03` | `TC-DASH-001..002` |
| `FR-003` | Application Initialization | `UT-APP-01..02` | `TC-APP-001` |
| `FR-004` | Multi-Step Wizard | `UT-WIZ-01..08` | `TC-WIZ-001..002` |
| `FR-005` | Progress Calculation | `UT-PROG-01..04` | `TC-WIZ-001` |
| `FR-006` | Dual Validation Engine | `UT-VAL-01..12` | `TC-WIZ-002` |
| `FR-007` | 15s Autosave Engine | `UT-SAVE-01..06` | `TC-WIZ-003..004` |
| `FR-008` | Crash Recovery | `UT-REC-01..03` | `TC-WIZ-004` |
| `FR-009` | Applicant Profile | `UT-PROF-01..03` | `TC-PROF-001` |
| `FR-010` | Resume & Deep Link | `UT-RES-01..02` | `TC-RES-001` |
| `FR-011` | Document Management | `UT-DOC-01..05` | `TC-DOC-001..002` |
| `FR-012` | Supabase Object Store | `UT-STOR-01..03` | `TC-DOC-001` |
| `FR-013` | Canvas Compression | `UT-COMP-01..04` | `TC-DOC-001` |
| `FR-014` | Simulated OCR Engine | `UT-OCR-01..04` | `TC-DOC-003..004` |
| `FR-015` | Grounded AI Assistant | `UT-AI-01..05` | `TC-AI-001..003` |
| `FR-016` | Simulated Payment Gateway | `UT-PAY-01..06` | `TC-PAY-001..003` |
| `FR-017` | Final Review & Submit | `UT-SUB-01..04` | `TC-PAY-003` |

---

# 9. Project Roadmaps & Engineering Governance

## 9.1 3-Day Hackathon Sprint Implementation Roadmap

```mermaid
gantt
    title Smart eVisa Portal — 3-Day Hackathon Implementation Sprint
    dateFormat  YYYY-MM-DD
    section Day 1: Foundation & Core Wizard
    Mock Database Auth & Session Setup       :done, 2026-08-28, 1d
    Applicant Dashboard & State Store        :done, 2026-08-28, 1d
    Wizard Steps 1, 2, 3 Form Layouts        :done, 2026-08-28, 1d
    FastAPI Router & PostgreSQL Setup        :done, 2026-08-28, 1d
    section Day 2: Documents, OCR & Autosave
    HTML5 Canvas Image Compression Engine    :active, 2026-08-29, 1d
    Supabase Storage Bucket Integration     :active, 2026-08-29, 1d
    Simulated Passport OCR Engine Adapter    :active, 2026-08-29, 1d
    15-Second Dual Autosave Engine           :active, 2026-08-29, 1d
    section Day 3: AI, Payment & Polish
    Grounded AI Assistant Widget & Prompts   :2026-08-30, 1d
    Simulated Payment Gateway & Receipt PDF  :2026-08-30, 1d
    WCAG Accessibility & Mobile Polish       :2026-08-30, 1d
    End-to-End QA Testing & Live Deployment  :2026-08-30, 1d
```

### Team Member Responsibility Breakdown (5-Member Team)

| Member | Primary Role | Core Deliverables |
| :--- | :--- | :--- |
| **Engineer 1** | Frontend Lead | Wizard Component Architecture, Step Transitions, Form State, WCAG Accessibility. |
| **Engineer 2** | Frontend & Media | Document Upload UI, Canvas Compression Engine, Simulated Payment Gateway UI. |
| **Engineer 3** | Backend Lead | FastAPI REST Routers, PostgreSQL Database Models, 15s Draft Sync Endpoints. |
| **Engineer 4** | Cloud & Storage | Supabase Storage Integration, Simulated OCR Service, CI/CD Pipeline on Railway/Vercel. |
| **Engineer 5** | AI & Quality Lead | Grounded AI Context Engine, System Prompt Design, Automated Test Suite Matrix. |

---

## 9.2 Post-Hackathon Production Transition Roadmap

```mermaid
graph TD
    subgraph Phase 1: Production Infrastructure & Real Integrations
        P1A[Replace Mock Auth with OAuth2 / OIDC / GovID JWT]
        P1B[Replace Simulated OCR with Google Cloud Vision / AWS Textract]
        P1C[Integrate Live Banking Payment Gateways Stripe / Adyen]
    end
    subgraph Phase 2: Consular Portal & Notification Engine
        P2A[Consular Visa Officer Review Dashboard & Workflow]
        P2B[Automated Email & SMS Status Notifications via Twilio / SendGrid]
        P2C[Automated Anti-Fraud Document Verification Algorithms]
    end
    subgraph Phase 3: Advanced AI & Biometrics
        P3A[Multilingual Voice AI Assistant Support]
        P3B[Real-Time Video Biometric Liveness & Face Matching]
        P3C[Consular Decision Support Intelligence]
    end
    Phase 1 --> Phase 2
    Phase 2 --> Phase 3
```

---

## 9.3 Prototype Acceptance Criteria & Sign-Off

The Smart eVisa Portal prototype is formally certified as complete and hackathon submission ready upon satisfying the following acceptance criteria:

1. **Authentication:** Applicant logs in seamlessly via Mock Database Authentication with single-session control.
2. **Dashboard:** Central dashboard dynamically displays all active and submitted applications with real-time status badges.
3. **Wizard Experience:** 5-step wizard guides data entry with dynamic progress tracking, inline validation, and backward navigation state preservation.
4. **Resilient Autosave:** All modifications automatically sync to `localStorage` and PostgreSQL drafts every 15 seconds without user intervention.
5. **Document Processing:** Client-side canvas engine compresses images $< 1	ext{MB}$; files upload cleanly to Supabase Storage.
6. **Simulated OCR:** Passport scan extraction automatically populates Step 2 with editable fields within 1.5 seconds.
7. **Grounded AI:** Context-aware assistant answers visa queries strictly from official government rules with zero hallucination.
8. **Simulated Payment:** Multi-channel gateway processes simulated transactions, supports failure retries, and delivers instant receipts.
9. **Deployment & Stability:** Frontend is live on Vercel, Backend is live on Railway, and database transactions execute reliably on Aiven PostgreSQL.

---

# 10. Appendices

## 10.1 Comprehensive Unified Glossary

| Term | Formal Definition |
| :--- | :--- |
| **Applicant** | The individual citizen or traveler submitting an electronic visa application. |
| **Application ID** | Universally unique identifier (UUIDv4) assigned to a single visa application lifecycle. |
| **Autosave Engine** | Asynchronous service synchronizing dirty form state to `localStorage` and PostgreSQL every 15 seconds. |
| **Canvas Compression** | In-browser raster image resizing and JPEG quality optimization using the HTML5 Canvas API. |
| **Draft** | An incomplete, editable visa application record stored prior to final review and payment. |
| **Grounded AI** | Conversational LLM architecture strictly restricted to official government guidelines context. |
| **Mock Database Authentication** | Authentication verifying pre-seeded user database records with single-session enforcement. |
| **Simulated OCR** | Mock optical character recognition service extracting structured passport metadata for demonstration. |
| **Simulated Payment Gateway** | Realistic mock multi-channel transaction engine modeling approval, decline, and receipt flows. |
| **Wizard** | 5-step sequential form interface chunking the application process into cognitive stages. |

## 10.2 Recommended Companion Specifications (UXDS)
To complement this Software Requirements Specification, it is recommended that the design team maintain the companion **UX Design Specification (UXDS) & Component Design System**, encompassing:
- Pixel-level design system tokens (Color scales, Spacing grid, Typography scale, Border radiuses).
- Micro-interaction animations for OCR scanning beams, progress bar fills, and 15s autosave sync pulses.
- Figma-ready desktop (1440px) and mobile (390px) component specifications for all 5 Wizard steps.

---
*End of Software Requirements Specification (SRS) — Smart eVisa Portal*
