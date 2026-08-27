# Frontend Review Submission

## Purpose
Implements Module 11 by turning Step 5 into a real review, declaration, and sealed-submission experience.

## Current behavior
- renders accordion review sections for personal, passport, travel, and document data
- provides edit-jump actions back to the relevant wizard step before submission
- requires declaration acceptance before the final submit action is enabled
- submits through `POST /api/v1/applications/{application_id}/submit`
- switches the draft into a read-only submitted state after success
