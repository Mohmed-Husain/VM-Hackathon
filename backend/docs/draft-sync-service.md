# Backend Draft Sync Service

## Purpose
Implements the backend half of Module 6 by making draft saves safe for repeated autosave calls.

## Current behavior
- `PUT /api/v1/applications/{application_id}/draft` accepts partial draft data
- repeated saves with unchanged `current_step` and `form_data` return without rewriting the row
- successful saves update progress, status, and `updated_at`
- backend persistence remains the server source of truth for cross-device recovery

## Client contract
- the frontend may autosave every 15 seconds
- if the network fails, the client can keep a browser-local draft and retry later without losing form state
