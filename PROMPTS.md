# PROMPTS.md

Raw prompts submitted to Amazon Q Developer (via `q chat` CLI) during development of this project.

---

## Prompt 1 — Initial project / architecture

You are my senior AI pair-programming assistant.

I am completing a Car Dealership Inventory System as a first-round software engineering assessment for Incubyte.

[Complete project specification covering:
- Tech stack
- Backend requirements
- User and Vehicle models
- Authentication and authorization rules
- Business rules
- HTTP status codes
- Architecture
- TDD phases
- Test strategy
- Frontend requirements
- Git workflow
- Final verification checklist]

Before writing code, analyze the requirements and propose:
1. Project architecture
2. Database schema
3. API endpoints
4. Business rules and validations
5. Authentication and authorization design
6. Testing strategy
7. TDD implementation order
8. Git commit sequence

Follow RED → GREEN → REFACTOR strictly.
Do not skip tests.

---

## Prompt 2 — Backend foundation

Implement Phase 1 of the Car Dealership Inventory System.

Set up the backend using Node.js, TypeScript, Express, Prisma and SQLite.

Create:
- Prisma schema
- User model
- Vehicle model
- Express server structure
- Authentication and vehicle route stubs
- TypeScript configuration
- Vitest configuration
- Environment configuration

Keep the architecture simple:
Router → Service → Prisma.

Do not over-engineer the project.
Run the build/type checks and make sure everything passes.
Commit this phase separately.

---

## Prompt 3 — TDD / authentication

Continue with the next TDD phase.

First write the failing tests for user registration and login.
Follow RED → GREEN → REFACTOR.

Implement:
- User registration
- Password hashing with bcrypt
- Duplicate email validation
- Login
- JWT generation
- Authentication middleware
- Appropriate HTTP status codes

Write and commit the tests before implementing the functionality.
Run the complete test suite after implementation.

---

## Prompt 4 — Authorization

Implement JWT authentication and role-based authorization.

Requirements:
- USER and ADMIN roles
- Protected routes require a valid JWT
- Admin-only operations must reject normal users with 403
- Invalid/missing tokens should return the appropriate status
- Frontend role checks should only be for UX; authorization must be enforced server-side.

Add tests first and follow RED → GREEN → REFACTOR.

---

## Prompt 5 — Vehicle APIs

Continue the TDD implementation for vehicle management.

Implement:
- GET all vehicles
- Vehicle search/filtering
- POST vehicle
- PUT vehicle
- DELETE vehicle
- Purchase vehicle
- Restock vehicle

Business rules:
- Price must be greater than 0
- Quantity cannot be negative
- Purchase cannot happen when quantity is 0
- Purchase must decrement stock atomically
- Restock must increase stock
- Admin-only operations must be protected

Add tests before implementation and verify the complete test suite.

---

## Prompt 6 — Vehicle listing/search/CRUD tests

Add tests covering vehicle listing, search, CRUD operations, purchase behavior and restock behavior.

Make sure the tests cover:
- Successful operations
- Invalid input
- Unauthorized access
- Forbidden admin operations
- Vehicle not found
- Out-of-stock purchase
- Correct quantity changes

Keep following the RED → GREEN → REFACTOR workflow.

---

## Prompt 7 — Frontend

Build the frontend for the Car Dealership Inventory System using React, TypeScript, Vite and Tailwind CSS.

Create:
- Login page
- Registration page
- Authentication context
- Dashboard
- Vehicle cards
- Vehicle filtering/search
- Purchase functionality
- Admin dashboard
- Add vehicle
- Edit vehicle
- Delete vehicle
- Restock vehicle

Connect the frontend to the existing Express API.

Create a clean, modern dealership-style UI.
Keep the application responsive and easy to use.

---

## Prompt 8 — Realistic vehicle seed data

Create a vehicles-only seed script that appends new records without touching existing ones.

Do not modify or delete existing vehicle records.

Create backend/src/prisma/seed-vehicles.ts and use Prisma to insert realistic sample vehicles.

Add 10 additional vehicles with realistic:
- Makes
- Models
- Categories
- Prices
- Stock quantities

Verify that the existing vehicles remain untouched and that all new records are inserted successfully.
Run the build and verify everything passes.

---

## Prompt 9 — Vehicle card improvements

Rewrite VehicleCard with stock badges (In Stock/Low Stock/Out of Stock), optimistic purchase update, and purchase success message.

Requirements:
- Show In Stock for normal quantities
- Show Low Stock when quantity is 1–2
- Show Out of Stock when quantity is 0
- Purchasing should immediately update the displayed quantity
- If the purchase API fails, revert the optimistic update
- Show an inline "Purchase successful!" message
- Automatically dismiss the success message after a few seconds
- Keep the component synchronized with updated vehicle quantities
- Update onPurchase to support async error handling

---

## Prompt 10 — Dashboard improvements

Make the dashboard feel more like a real vehicle inventory management application.

Add:
- Total Models summary
- Available vehicles summary
- Out of Stock summary
- Inventory Value
- Result count
- Reset Filters button
- Better success/error feedback
- Confirmation when deleting a vehicle
- Toast notifications for add, edit, delete and restock
- Accurate summary statistics even when filters are active

Keep the existing backend unchanged if possible.
Run all tests and builds after the changes.

---

## Prompt 11 — Fix empty dashboard/statistics bug

The dashboard is showing 0 for Total Models, Available, Out of Stock and Inventory Value even though vehicles exist in the database.

Investigate the frontend data loading and identify why the summary statistics are empty.

Do not modify the database or remove existing vehicle data.
Fix the issue using the existing API/data flow.
Make sure filtered and unfiltered vehicle lists still work correctly.

Run the complete test suite and frontend build after fixing it.
