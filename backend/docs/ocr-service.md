# Backend OCR Service

## Purpose
Implements Module 9 by simulating passport OCR extraction after a passport scan upload.

## Endpoint
- `POST /api/v1/ocr/passport-scan`

## Current behavior
- verifies the application belongs to the signed-in applicant
- locates the latest passport scan, or a specific uploaded document when `document_id` is passed
- generates deterministic simulated extraction data for personal and passport fields
- stores OCR metadata on the document record in `documents.extracted_ocr_data`
- returns confidence, extracted fields, and advisory notes so the frontend can preview and apply the result
