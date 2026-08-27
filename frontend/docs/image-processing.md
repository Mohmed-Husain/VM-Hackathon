# Frontend Image Processing

## Purpose
Implements Module 9 by compressing supported image uploads in the browser before they are sent to the backend.

## Current behavior
- compresses passport scan and photo image uploads on the client with a Canvas-based utility
- keeps PDF uploads untouched and surfaces guidance when a passport PDF is larger than the common official portal hint
- shows upload notes so applicants can see when a file was compressed
- triggers passport OCR immediately after a passport scan upload
- applies extracted passport details back into the draft so applicants can edit them in Step 2
