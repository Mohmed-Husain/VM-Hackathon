# Smart eVisa Portal MVP Module Breakdown

## Purpose
This document translates the MVP SRS into implementation modules for the FastAPI + Next.js stack we will build iteratively.

## Source Distinction
- **User request:** Build the system with `FastAPI`, `Next.js/React`, `PostgreSQL`, and `async SQLAlchemy`; use the existing `DB_URL` from `.env`; defer real payment gateway integration; keep any payment UI hidden for now.
- **SRS guidance:** Defines the MVP scope, flows, entities, and APIs we should implement.
- **Official visa site influence:** Use `indianvisaonline.gov.in` for terminology, document guidance, and applicant-facing content accuracy where useful, but keep this product positioned as an MVP prototype rather than a 1:1 clone of the production government system.

## Proposed Repository Shape
```text
VM-Hackathon/
  backend/
    app/
      api/
      core/
      db/
      models/
      schemas/
      services/
      repositories/
      utils/
    docs/
    tests/
  frontend/
    src/
      app/
      components/
      features/
      lib/
      hooks/
      types/
      content/
    docs/
    tests/
  docs/
```

## Core MVP Modules

### 1. Platform & Shared Configuration
**Goal:** Establish the baseline app structure, shared config, environment handling, CORS, logging, and health checks.

**Backend scope**
- FastAPI app bootstrap
- settings loader
- async SQLAlchemy engine/session
- Alembic setup
- API versioning
- health endpoint

**Frontend scope**
- Next.js app bootstrap
- route groups
- shared layout
- env configuration
- API client wrapper

**Output docs**
- `backend/docs/platform.md`
- `frontend/docs/platform.md`

### 2. Identity & Demo Session Module
**Goal:** Support seeded demo login and session restoration for hackathon flows.

**Backend scope**
- `users` table
- password verification for seeded users
- mock session/JWT response
- login endpoint
- current-user endpoint

**Frontend scope**
- login page
- auth form validation
- session storage
- protected route guard

**Output docs**
- `backend/docs/auth-service.md`
- `frontend/docs/auth-flow.md`

### 3. Applicant Dashboard Module
**Goal:** Show active/submitted applications and allow resume/new application flows.

**Backend scope**
- list applications by user
- create application
- status/progress summary DTOs

**Frontend scope**
- dashboard page
- application cards
- status badges
- create-application modal or panel

**Output docs**
- `backend/docs/application-service.md`
- `frontend/docs/dashboard.md`

### 4. Application Domain & Wizard Module
**Goal:** Implement the 5-step application workflow and draft structure.

**Backend scope**
- `applications` table
- `form_data` JSONB contract
- current step and progress persistence
- draft fetch/update endpoints

**Frontend scope**
- wizard shell
- step routing/state orchestration
- personal step
- passport step
- travel step
- documents step
- review step

**Output docs**
- `backend/docs/wizard-service.md`
- `frontend/docs/wizard.md`

### 5. Validation & Rule Engine Module
**Goal:** Centralize field validation, progress calculation, and readiness checks.

**Backend scope**
- server-side validation helpers
- review-ready checks
- submission guards

**Frontend scope**
- field-level validators
- step completeness logic
- weighted progress tracker

**Output docs**
- `backend/docs/validation-rules.md`
- `frontend/docs/form-validation.md`

### 6. Autosave & Recovery Module
**Goal:** Guarantee draft safety with local + server persistence.

**Backend scope**
- idempotent draft update service
- updated timestamp handling
- optimistic merge rules

**Frontend scope**
- 15-second autosave engine
- dirty-state tracking
- localStorage persistence
- draft recovery on reload/login
- save-status indicator

**Output docs**
- `backend/docs/draft-sync-service.md`
- `frontend/docs/autosave-recovery.md`

### 7. Applicant Profile Prefill Module
**Goal:** Reuse known applicant data for faster completion.

**Backend scope**
- `applicant_profiles` table
- fetch/update profile endpoints
- prefill mapping service

**Frontend scope**
- “Use my saved profile data” action
- merge confirmation UX

**Output docs**
- `backend/docs/profile-service.md`
- `frontend/docs/profile-prefill.md`

### 8. Documents & Upload Module
**Goal:** Handle required uploads and persist document metadata.

**Backend scope**
- `documents` table
- upload endpoint
- storage adapter abstraction
- delete/list document endpoints

**Frontend scope**
- upload cards
- drag-and-drop
- preview states
- upload progress/status

**Output docs**
- `backend/docs/document-service.md`
- `frontend/docs/document-upload.md`

**MVP note**
- The SRS mentions Supabase storage, but we should keep storage behind an adapter so we can start with local/mock storage if needed and plug in Supabase later without changing the API contract.

### 9. Client Compression & OCR Simulation Module
**Goal:** Compress images on the client and simulate passport extraction.

**Backend scope**
- OCR simulation endpoint
- extracted field mapping
- document-linked OCR metadata

**Frontend scope**
- canvas compression utility
- passport upload trigger
- OCR result preview
- autofill into Step 2

**Output docs**
- `backend/docs/ocr-service.md`
- `frontend/docs/image-processing.md`

### 10. AI Assistant Module
**Goal:** Provide grounded visa guidance from a curated rule set.

**Backend scope**
- `official_visa_rules.json`
- AI prompt builder
- OpenAI adapter
- graceful fallback response
- chat endpoint

**Frontend scope**
- floating assistant widget
- contextual prompt suggestions
- step-aware chat panel

**Output docs**
- `backend/docs/ai-assistant-service.md`
- `frontend/docs/ai-assistant.md`

**MVP note**
- Official-site content should inform the rule dataset, but we should answer only from our curated internal rules file so the assistant remains deterministic.

### 11. Review, Declaration & Submission Module
**Goal:** Seal the application after review and declaration.

**Backend scope**
- review-ready validation
- submission endpoint
- immutable submitted snapshot
- status transition enforcement

**Frontend scope**
- summary accordion
- edit-jump actions
- declaration checkbox
- final submit CTA

**Output docs**
- `backend/docs/submission-service.md`
- `frontend/docs/review-submission.md`

### 12. Payments Placeholder Module
**Goal:** Preserve the Step 5 shape without exposing live or simulated payment in the first iterations.

**Backend scope**
- payment schema reserved
- feature flag for disabled payments
- hidden stub endpoint if needed later

**Frontend scope**
- payment panel/component behind feature flag
- hidden navigation path
- “Coming soon” internal placeholder only

**Output docs**
- `backend/docs/payment-placeholder.md`
- `frontend/docs/payment-ui-placeholder.md`

**MVP note**
- Real gateway integration is explicitly out of scope for now.
- We should keep `Proceed to Payment` hidden or disabled in user-visible flows until you ask us to turn on simulated payments.

## Cross-Cutting Content Modules

### A. Visa Content & Copy Module
**Goal:** Maintain controlled applicant-facing text, labels, requirements, and FAQs.

**Includes**
- visa categories shown in MVP
- document requirement copy
- photo requirement copy
- declarations
- helper text for AI suggestions

### B. Demo Data & Seed Module
**Goal:** Seed users, sample application draft, saved profile, and optional mock documents.

**Includes**
- seeded accounts from SRS
- one in-progress application for the returning user
- a clean-slate user

### C. Testing & QA Module
**Goal:** Cover the hackathon-critical flows first.

**Includes**
- API tests for auth, applications, drafts, uploads, OCR, AI fallback
- frontend tests for login, wizard, autosave, recovery
- manual demo checklist mapped to SRS test cases

## Recommended Build Order
1. Platform & Shared Configuration
2. Identity & Demo Session
3. Database schema + seed data
4. Dashboard + create application
5. Wizard shell + Step 1 to Step 3
6. Autosave + recovery
7. Documents upload + compression
8. OCR simulation
9. Review + declaration + submission
10. AI assistant
11. Payment placeholder wiring

## Official Site Alignment Notes
- The official portal separates **regular visa** and **e-Visa** entry points and uses government terminology we should reuse in labels and help text where appropriate.
- The official e-Visa portal requires a recent front-facing photo with a plain light or white background and a passport bio page upload.
- The official portal states passport validity should be at least six months and that the passport should have at least two blank pages.
- The official portal indicates fees are country-specific, so the SRS fee values should be treated as MVP demo pricing rather than real government pricing.
- The official portal supports a broader category set than our MVP, so we should present our smaller category list as a simplified prototype selection.

## Implementation Assumptions
- We will use **Next.js App Router** rather than React + Vite from the SRS because that matches your requested stack.
- We will use **PostgreSQL + async SQLAlchemy** as the system of record.
- We will keep file storage behind an abstraction to avoid coupling the first iteration to a single provider.
- We will ship payments behind a feature flag until you ask to enable either simulated or real payment work.
