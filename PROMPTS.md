# AI Development Log

This file documents the prompts and responses exchanged with Amazon Q Developer (via `q chat` CLI) during development of this project.

---

## Session 1

### Prompt

You are my senior AI pair-programming assistant.

I am completing a Car Dealership Inventory System as a first-round software engineering assessment for Incubyte.

[Full prompt included the complete project specification covering: tech stack, backend requirements, user/vehicle models, authentication/authorization rules, business rules, HTTP status codes, architecture, TDD phases 1–12, test strategy, frontend requirements, git workflow, and final verification checklist.]

### Response

Phase 1 — Project Foundation:
- Created backend/frontend directory structure
- Set up package.json, tsconfig.json, vitest.config.ts
- Created Prisma schema with User and Vehicle models
- Created server.ts (Express app, no listen) and index.ts (starts server)
- Created stub routers for auth and vehicles
- Installed all backend dependencies
- Ran `prisma migrate dev --name init` successfully
- Verified TypeScript compiles with no errors
- Scaffolded frontend with Vite + React + TypeScript
- Installed Tailwind CSS via @tailwindcss/vite
- Verified frontend build passes
- Created .gitignore, .env.example, README.md, PROMPTS.md
- Committed: chore: initialize car dealership project

---

_This file will be updated with each subsequent prompt/response pair as development continues._
