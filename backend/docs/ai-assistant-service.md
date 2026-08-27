# Backend AI Assistant Service

## Purpose
Implements Module 10 by serving grounded visa guidance from a curated internal rule set.

## Endpoint
- `POST /api/v1/ai/chat`

## Current behavior
- loads curated rule content from `backend/app/data/official_visa_rules.json`
- ranks matching rule topics from the user message and current wizard step
- optionally includes application context after verifying ownership
- returns deterministic rule-based answers when no AI key is configured
- can upgrade to an OpenAI-backed grounded answer when `OPENAI_API_KEY` is available
- keeps payment guidance aligned with the MVP scope by stating that payment is hidden for now
