# Frontend Form Validation

## Purpose
Implements Module 5 by providing immediate step-aware validation inside the wizard.

## Current behavior
- validates fields on blur and during step transitions
- highlights invalid fields with inline guidance
- blocks forward navigation until the current step is valid
- keeps backward navigation available without forcing correction first
- recalculates weighted progress from the live draft state

## Covered rules
- required personal, passport, travel, and review fields
- passport number format
- passport issue and expiry chronology
- passport validity at least 6 months beyond intended arrival date
- positive stay duration
- required document placeholders before review readiness
