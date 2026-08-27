# Software Requirements Specification (SRS)

## Smart eVisa Portal --- AI-Assisted Government Visa Experience Redesign

**Version:** 1.0

**Technology Stack**

  Layer            Technology
  ---------------- ------------------------------------------
  Frontend         React + Vite + TypeScript + Tailwind CSS
  Backend          FastAPI
  Database         Aiven PostgreSQL
  Object Storage   Supabase Storage
  AI               OpenAI GPT API
  OCR              Simulated Passport OCR
  Cache            Browser LocalStorage
  Deployment       Vercel + Railway
  Authentication   Mock DB Authentication
  Payments         Fully Simulated Payment Gateway

------------------------------------------------------------------------

# 1. Introduction

## Purpose

The Smart eVisa Portal redesign transforms a frustrating government visa
application experience into an intelligent, user-friendly application
system.

Major improvements include:

-   Guided application wizard
-   AI assistance
-   Draft recovery
-   Better document uploads
-   Payment recovery
-   Mobile-first experience

------------------------------------------------------------------------

# 2. Existing Problems

  Problem                   Impact
  ------------------------- --------------------
  Confusing navigation      Users abandon
  Long forms                Fatigue
  No progress               Anxiety
  Validation appears late   Rework
  Poor upload guidance      Failed uploads
  Payment uncertainty       Duplicate payments
  Session timeout           Lost work
  Mobile experience poor    High frustration

------------------------------------------------------------------------

# 3. Proposed Solution

User → Dashboard → Wizard → Review → Payment

------------------------------------------------------------------------

# 4. Functional Requirements

## FR-01 User Authentication

-   Mock database login
-   Local session storage
-   Friendly validation errors

## FR-02 Dashboard

-   Resume draft
-   Progress percentage
-   Continue application

## FR-03 Step Wizard

1.  Personal
2.  Passport
3.  Travel
4.  Documents
5.  Review
6.  Payment

## FR-04 Progress Tracker

Formula:

`Completed / Total × 100`

## FR-05 Inline Validation

-   Passport format
-   Date validation
-   Email validation

## FR-06 Smart Error Messages

Every error explains:

-   What happened
-   Why
-   How to fix

## FR-07 Autosave

-   LocalStorage
-   Backend draft sync
-   Save every 15 seconds

## FR-08 Session Recovery

Popup before timeout.

## FR-09 Applicant Profile

Reusable information for future applications.

## FR-10 Document Upload Cards

Shows:

-   Required format
-   Max size
-   Upload status

## FR-11 Image Compression

Browser-side compression using Canvas API.

## FR-12 Simulated OCR

Extracts:

-   Name
-   Passport number
-   Expiry

Editable afterwards.

## FR-13 Photo Validation

Checks:

-   Resolution
-   Size
-   Ratio

## FR-14 Travel Timeline

Interactive travel history UI.

## FR-15 Simulated Payment

Supports:

-   UPI
-   Credit Card
-   Debit Card
-   Net Banking

Payment states:

-   Initiated
-   Processing
-   Success
-   Failed
-   Retry

## FR-16 Resume Dashboard

Shows:

-   Draft
-   Submitted
-   Pending Payment
-   Completed

------------------------------------------------------------------------

# 5. AI Assistant

Uses OpenAI GPT API.

Capabilities:

-   Explain visa questions
-   Explain form fields
-   Help upload documents
-   Explain validation errors

Future-ready for RAG.

------------------------------------------------------------------------

# 6. System Architecture

User

↓

React + Vite (Vercel)

↓

FastAPI (Railway)

↓

Aiven PostgreSQL

↓

Supabase Storage

↓

OpenAI API

------------------------------------------------------------------------

# 7. Database Design

## Users

``` sql
CREATE TABLE users(
user_id UUID PRIMARY KEY,
email TEXT UNIQUE,
password_hash TEXT,
created_at TIMESTAMP
);
```

## Applications

``` sql
CREATE TABLE applications(
application_id UUID PRIMARY KEY,
user_id UUID REFERENCES users(user_id),
status TEXT,
progress INT
);
```

## Documents

``` sql
CREATE TABLE documents(
document_id UUID PRIMARY KEY,
application_id UUID REFERENCES applications(application_id),
storage_url TEXT,
file_type TEXT
);
```

## AI Chats

``` sql
CREATE TABLE ai_chats(
chat_id UUID PRIMARY KEY,
user_id UUID,
message TEXT,
response TEXT
);
```

------------------------------------------------------------------------

# 8. API Endpoints

  Method   Endpoint
  -------- --------------------
  POST     /auth/login
  POST     /applications
  GET      /applications/{id}
  PATCH    /applications/{id}
  POST     /documents/upload
  POST     /ocr/passport
  POST     /ai/chat
  POST     /payment/start

------------------------------------------------------------------------

# 9. Screen Specifications

-   Landing Page
-   Dashboard
-   Wizard
-   Upload Screen
-   Review
-   Payment
-   AI Assistant
-   Resume Dashboard

------------------------------------------------------------------------

# 10. Non-functional Requirements

  Requirement    Target
  -------------- ------------------
  Page Load      under 2 sec
  API Response   under 300 ms
  Upload Size    10 MB
  Mobile         Fully Responsive
  Availability   99%

------------------------------------------------------------------------

# 11. Security

-   HTTPS
-   Password hashing
-   SQL injection prevention
-   Secure file uploads
-   Rate limiting

------------------------------------------------------------------------

# 12. Deployment

  Service    Platform
  ---------- ----------
  Frontend   Vercel
  Backend    Railway
  Database   Aiven
  Storage    Supabase

------------------------------------------------------------------------

# 13. Testing

Sample cases:

-   Invalid passport
-   Large image upload
-   Network interruption
-   Payment retry
-   OCR editing

------------------------------------------------------------------------

# 14. Analytics

Track:

-   Step completion
-   Drop-offs
-   Upload failures
-   Payment retries
-   AI usage

------------------------------------------------------------------------

# 15. Future Scope

-   Real OCR
-   Government API integration
-   Voice Assistant
-   Multi-language
-   Admin Dashboard
-   Visa Officer Dashboard

------------------------------------------------------------------------

# Project Folder Structure

## Frontend

``` text
src/
 ├── components/
 ├── pages/
 ├── hooks/
 ├── services/
 ├── context/
 └── assets/
```

## Backend

``` text
app/
 ├── api/
 ├── models/
 ├── schemas/
 ├── services/
 ├── ai/
 ├── storage/
 └── main.py
```

------------------------------------------------------------------------

# MVP Feature Checklist

-   [x] Login
-   [x] Dashboard
-   [x] Wizard
-   [x] Progress Tracker
-   [x] Inline Validation
-   [x] Autosave
-   [x] Session Recovery
-   [x] Applicant Profile
-   [x] Upload Cards
-   [x] Image Compression
-   [x] Simulated OCR
-   [x] Photo Validation
-   [x] Travel Timeline
-   [x] AI Assistant
-   [x] Simulated Payment
-   [x] Resume Dashboard
