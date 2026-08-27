# Backend Demo Seed Service

## Purpose
Seeds the database with the demo users and the first resumable application draft required by the MVP SRS during application startup.

## Behavior
- checks whether each demo email already exists
- creates missing users only
- hashes the seeded passwords before persisting them
- commits only when new demo users are inserted
- ensures the primary demo user has one seeded in-progress application if they have none yet

## Current seeded data
- Husain Al-Mansoor
- Maya Sharma
- one in-progress tourist application for Husain Al-Mansoor
