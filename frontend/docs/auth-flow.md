# Frontend Auth Flow

## Purpose
Implements the demo sign-in experience and local session handling for Module 2.

## Flow
1. Applicant enters seeded credentials on `/login`.
2. Frontend calls `POST /api/v1/auth/login`.
3. Returned bearer token and user profile are stored in local storage.
4. Applicant is redirected to `/dashboard`.
5. Dashboard verifies the token by calling `GET /api/v1/auth/me`.

## Current behavior
- Redirects unauthenticated users back to `/login`.
- Allows manual sign-out by clearing the stored session.
- Uses the seeded primary account by default to make first-run verification faster.
