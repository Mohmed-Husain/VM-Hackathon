# Backend Platform Module

## Scope
Module 1 establishes the backend foundation for the Smart eVisa Portal MVP.

## Included in this iteration
- FastAPI application bootstrap
- versioned API router under `/api/v1`
- CORS configuration for the frontend
- async SQLAlchemy engine and session factory
- environment-driven configuration using the root `.env`
- startup schema bootstrap for hackathon convenience
- Alembic configuration and initial migration scaffold
- health check endpoint at `GET /api/v1/health`

## Notes
- The app reads `DB_URL` from the repository root `.env`.
- If `DB_URL` uses `postgresql://` or `postgres://`, it is normalized to `postgresql+asyncpg://` for async SQLAlchemy.
- Neon/libpq-style query params such as `sslmode` and `channel_binding` are normalized so `asyncpg` can connect cleanly.
- `AUTO_CREATE_TABLES` is effectively enabled by default in code for fast local bootstrapping. We can make this stricter once more modules are in place.
