# Frontend AI Assistant

## Purpose
Implements Module 10 by adding a floating, step-aware assistant to the dashboard and application wizard.

## Current behavior
- renders a collapsible assistant widget on the dashboard and wizard pages
- sends user questions to `POST /api/v1/ai/chat`
- includes application and step context when available
- displays grounded source snippets returned by the backend
- starts each step with focused suggestion chips so applicants can quickly ask common questions
