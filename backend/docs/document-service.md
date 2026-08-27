# Backend Document Service

## Purpose
Implements Module 8 by accepting supporting documents, persisting metadata, and keeping the application draft in sync.

## Endpoints
- `GET /api/v1/applications/{application_id}/documents`
- `POST /api/v1/documents/upload`
- `DELETE /api/v1/documents/{document_id}`

## Current behavior
- stores uploaded files under `backend/storage/visa-documents/{application_id}/...`
- returns a stable metadata record with a local public URL
- replaces existing files of the same document type when a new one is uploaded
- updates the application draft's document readiness flags after upload or delete
- recalculates progress and status after each document change
