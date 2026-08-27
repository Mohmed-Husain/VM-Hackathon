# Backend Profile Service

## Purpose
Implements Module 7 by storing reusable applicant identity and passport details for fast prefilling.

## Endpoints
- `GET /api/v1/profile`
- `PUT /api/v1/profile`

## Current behavior
- returns the saved profile for the authenticated applicant
- creates or updates the profile with one idempotent `PUT`
- seeds a reusable profile for the primary demo applicant on startup

## Stored fields
- personal details used by Step 1
- passport details used by Step 2
