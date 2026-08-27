# Backend Validation Rules

## Purpose
Implements Module 5 by centralizing server-side draft validation, progress calculation, and review-readiness checks.

## Current rules
- required fields for personal, passport, travel, documents, and review
- passport number format must match `^[A-Z0-9]{6,9}$`
- passport issue date must not be after expiry date
- passport expiry must be at least 6 months after intended arrival when both dates are available
- stay duration must be a positive integer
- review readiness requires Steps 1 through 4 to be complete

## Response behavior
- application detail responses now include a `validation_summary`
- draft saves recompute progress and status from the validated form state
- `Review Ready` is only set when the first four steps are complete
