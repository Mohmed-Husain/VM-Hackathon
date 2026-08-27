# Backend Auth Service

## Purpose
Provides seeded demo authentication for hackathon users.

## Endpoints
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

## Response shape
`POST /api/v1/auth/login` returns:
- bearer access token
- token expiry in seconds
- authenticated user payload

## Demo accounts
- `applicant@example.com` / `password123`
- `maya.traveler@example.com` / `demo2026!`

## Security note
This is intentionally lightweight hackathon authentication. Passwords are stored as salted SHA-256 hashes for demo stability in local/dev environments, which is suitable for seeded prototype flows but not production identity.
