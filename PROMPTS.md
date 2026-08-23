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

_Sessions 2–7 below document the subsequent development phases._

---

## Session 2

### Purpose

Implement user registration with TDD — write failing tests first, then implement the service.

### Prompt summary

> Follow TDD. Write failing unit tests for `registerUser` covering: creates a user with valid data, does not return passwordHash, stores password as bcrypt hash, throws on duplicate email, throws on invalid email, throws when password is shorter than 8 characters. Then implement the minimum service code to make them pass.

### What Amazon Q implemented

- `backend/src/modules/auth/auth.service.test.ts` — 6 unit tests for `registerUser` and 3 for `loginUser` (stub tests added here, implemented in Session 3)
- `backend/src/modules/auth/auth.service.ts` — `registerUser` function: email/password validation, bcrypt hashing, Prisma user creation, duplicate-email error

### Verification

- All 6 `registerUser` tests pass

### Commit

`56e02ab` — `test: add user registration behavior`

---

## Session 3

### Purpose

Implement login behavior with TDD — extend tests and wire up the auth router.

### Prompt summary

> Add failing tests for `loginUser`: returns a JWT token for valid credentials, throws 401 for wrong password, throws 401 for unknown email. Implement `loginUser` in the service and wire up `POST /api/auth/register` and `POST /api/auth/login` in the auth router.

### What Amazon Q implemented

- `backend/src/modules/auth/auth.service.test.ts` — 3 additional `loginUser` unit tests
- `backend/src/modules/auth/auth.service.ts` — `loginUser` function: credential lookup, bcrypt compare, JWT signing
- `backend/src/modules/auth/auth.router.ts` — `POST /api/auth/register` and `POST /api/auth/login` route handlers with error-to-status mapping

### Verification

- All 9 auth service unit tests pass

### Commit

`67306cd` — `test: add login behavior`

---

## Session 4

### Purpose

Implement JWT authentication and role-based authorization middleware with TDD, and scaffold the full vehicles module.

### Prompt summary

> Write integration tests for JWT middleware: allows access with valid token, returns 401 for missing/malformed/expired token. Write role tests: ADMIN can POST /api/vehicles (201), USER gets 403, unauthenticated gets 401. Implement `authenticate` middleware, `requireRole` middleware, the vehicles service (createVehicle, listVehicles, purchaseVehicle, restockVehicle, updateVehicle, deleteVehicle), and the vehicles router with all routes.

### What Amazon Q implemented

- `backend/src/middleware/auth.ts` — `authenticate` middleware: Bearer token extraction, `jwt.verify`, attaches `req.user`
- `backend/src/middleware/requireRole.ts` — `requireRole(role)` middleware: checks `req.user.role`, returns 403 if insufficient
- `backend/src/modules/vehicles/vehicles.service.ts` — full service with all six operations and business-rule validation
- `backend/src/modules/vehicles/vehicles.router.ts` — all vehicle routes wired with `authenticate` and `requireRole('ADMIN')` where required
- `backend/src/tests/auth.integration.test.ts` — 7 integration tests covering JWT middleware and role authorization

### Verification

- 7 auth integration tests pass
- Backend TypeScript compiles without errors

### Commit

`4bf7402` — `test: add JWT authentication behavior`

---

## Session 5

### Purpose

Write the full vehicle behavior test suite (unit + integration) covering listing, search, CRUD, purchase, and restock.

### Prompt summary

> Write unit tests for all vehicle service functions: createVehicle (valid data, empty make/model, invalid category, price ≤ 0, negative quantity), listVehicles (returns all, returns empty array), purchaseVehicle (decrements quantity, throws out of stock, throws not found), restockVehicle (increases quantity, throws non-positive amount, throws not found), updateVehicle (updates fields, throws not found), deleteVehicle (deletes, throws not found). Also write integration tests for all HTTP endpoints: GET /api/vehicles, GET /api/vehicles/search (make/model/category/minPrice/maxPrice filters), POST /api/vehicles, PUT /api/vehicles/:id, DELETE /api/vehicles/:id, POST /api/vehicles/:id/purchase, POST /api/vehicles/:id/restock.

### What Amazon Q implemented

- `backend/src/modules/vehicles/vehicles.service.test.ts` — 18 unit tests across all six service functions
- `backend/src/tests/vehicles.integration.test.ts` — 43 integration tests covering all vehicle HTTP endpoints and filter combinations

### Verification

- All 77 backend tests pass (18 unit + 43 vehicle integration + 7 auth integration + 9 auth unit)

### Commit

`a1261cc` — `test: add vehicle listing, search, CRUD, purchase, restock behavior`

---

## Session 6

### Purpose

Build the complete React frontend and finalize the full-stack application.

### Prompt summary

> Implement the React frontend. Create: AuthContext (JWT token + role stored in localStorage, setAuth/logout), api.ts (fetch wrappers for all backend endpoints), LoginPage, RegisterPage, Dashboard with vehicle cards, filtering/search bar, category filter, admin create/edit/delete/restock modals, stock badges on VehicleCard, purchase feedback, inventory summary statistics (total models, available, out of stock, inventory value), and toast notifications. Also create the vehicle seed script with 10 realistic vehicles covering all five categories.

### What Amazon Q implemented

- `frontend/src/AuthContext.tsx` — React context providing `token`, `role`, `setAuth`, `logout`; persists token to `localStorage`; decodes role from JWT payload
- `frontend/src/api.ts` — typed fetch wrappers: `register`, `login`, `getVehicles`, `searchVehicles`, `createVehicle`, `updateVehicle`, `deleteVehicle`, `purchaseVehicle`, `restockVehicle`
- `frontend/src/types.ts` — `Vehicle` interface
- `frontend/src/components/LoginPage.tsx` — login form with error display, link to register
- `frontend/src/components/RegisterPage.tsx` — registration form with validation error display, link to login
- `frontend/src/components/VehicleCard.tsx` — vehicle card with stock badge (In Stock / Low Stock / Out of Stock), price, category, and Purchase button
- `frontend/src/components/VehicleModal.tsx` — create/edit modal form for admin (make, model, category, price, quantity fields)
- `frontend/src/components/Dashboard.tsx` — full dashboard: search bar, category filter buttons, inventory summary stats (SummaryCard components), vehicle grid, admin Add/Edit/Delete/Restock actions, toast notification system
- `frontend/src/App.tsx` — routing between Login, Register, and Dashboard based on auth state
- `frontend/src/main.tsx` — wraps app in `AuthProvider`
- `backend/src/prisma/seed-vehicles.ts` — seeds 10 vehicles: Mercedes-Benz C-Class, Audi Q5, Tesla Model 3, Jeep Wrangler, Chevrolet Silverado, Hyundai i20, Porsche 911, Toyota Hilux, Kia Sportage, BMW 5 Series

### Verification

- Frontend build passes (`tsc -b && vite build` — 24 modules, no errors)
- All 77 backend tests continue to pass
- Seed script inserts 10 vehicles successfully

### Commit

`a494e02` — `feat: complete dealership inventory application`

---

## Final Verification

State of the project at final submission (`HEAD` = `a494e02`):

**Backend**
- 77 tests passing across 4 test files (9 auth unit, 7 auth integration, 18 vehicle unit, 43 vehicle integration)
- `npm run build` (TypeScript) compiles with no errors
- All API endpoints implemented and tested: register, login, list vehicles, search vehicles, create/update/delete vehicle, purchase, restock

**Frontend**
- `npm run build` passes — 24 modules transformed, no TypeScript or Vite errors
- Full SPA: Login, Register, Dashboard
- Role-based UI: admin controls (add, edit, delete, restock) visible only to ADMIN role
- Stock badges, purchase flow, toast notifications, inventory summary statistics all functional

**Database**
- Prisma migration applied (`prisma migrate dev --name init`)
- Admin seed account: `admin@dealership.com` / `admin1234`
- Vehicle seed: 10 vehicles across all five categories (SEDAN, SUV, TRUCK, HATCHBACK, COUPE)

**Git history** (6 commits, chronological)
1. `66fb1f2` — `chore: initialize car dealership project`
2. `56e02ab` — `test: add user registration behavior`
3. `67306cd` — `test: add login behavior`
4. `4bf7402` — `test: add JWT authentication behavior`
5. `a1261cc` — `test: add vehicle listing, search, CRUD, purchase, restock behavior`
6. `a494e02` — `feat: complete dealership inventory application`
