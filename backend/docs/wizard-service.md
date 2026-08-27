# Backend Wizard Service

## Purpose
Supports Module 4 by persisting the draft structure used by the 5-step application wizard.

## Endpoint
- `PUT /api/v1/applications/{application_id}/draft`

## Stored draft shape
- `personal`
- `passport`
- `travel`
- `documents`
- `review`

## Current behavior
- stores the full wizard draft as JSONB in PostgreSQL
- recalculates progress percentage on each save
- derives a lightweight application status of `Draft`, `In Progress`, or `Review Ready`
- keeps payment-related states reserved for later modules
