# Backend Submission Service

## Purpose
Implements Module 11 by turning the review step into a sealed submission flow.

## Endpoint
- `POST /api/v1/applications/{application_id}/submit`

## Current behavior
- verifies the application belongs to the signed-in applicant
- blocks submission until all earlier steps are valid and the declaration is accepted
- seals the application with an immutable `submitted_snapshot`
- stamps `submitted_at` and transitions status to `Submitted`
- prevents later draft, OCR, and document mutations after submission
