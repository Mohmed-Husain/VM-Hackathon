# Backend Application Service

## Purpose
Covers Module 3 by managing the applicant dashboard data and create/resume flows.

## Endpoints
- `GET /api/v1/applications`
- `POST /api/v1/applications`
- `GET /api/v1/applications/{application_id}`

## Current behavior
- returns applications only for the authenticated user
- creates a new draft application from the selected visa category
- seeds one in-progress application for the primary demo user so the resume flow is visible immediately

## Notes
- `user_id` in the create payload is optional and, if present, must match the authenticated user
- responses expose `application_id`, status, current step, progress, and timestamps for dashboard rendering
