# Frontend Autosave And Recovery

## Purpose
Implements Module 6 by keeping the active wizard draft safe in both browser storage and the backend.

## Current behavior
- stores a browser-local draft snapshot for each application under `evisa_draft_{application_id}`
- marks the local snapshot dirty whenever the applicant edits the draft
- runs a 15-second autosave loop that syncs dirty drafts to the backend
- restores the browser-local draft when it is newer than the backend copy or still unsynced
- shows save-state feedback such as unsaved changes, saved just now, and offline local-only storage

## Notes
- local recovery is browser-specific
- payment remains hidden and is not part of the autosave flow yet
