# Test Report

**Project:** Car Dealership Inventory System  
**Framework:** Vitest + Supertest  
**Date:** 2026-08-23

## Summary

| Metric      | Result |
|-------------|--------|
| Test Files  | 4 passed |
| Total Tests | 77 passed |
| Failed      | 0 |
| Duration    | ~3.6s |

## Test Files

| File | Tests | Status |
|------|-------|--------|
| `src/tests/vehicles.integration.test.ts` | 43 | ✅ passed |
| `src/modules/vehicles/vehicles.service.test.ts` | 18 | ✅ passed |
| `src/modules/auth/auth.service.test.ts` | 9 | ✅ passed |
| `src/tests/auth.integration.test.ts` | 7 | ✅ passed |

## Coverage Areas

- User registration (validation, hashing, duplicate email)
- User login (JWT generation, wrong password, unknown email)
- JWT middleware (valid token, missing, malformed, expired)
- Role-based authorization (ADMIN vs USER vs unauthenticated)
- Vehicle CRUD (create, update, delete, not found)
- Vehicle listing and search (make, model, category, price range filters)
- Vehicle purchase (decrement stock, out-of-stock, not found)
- Vehicle restock (increase stock, invalid amount, not found)

## Raw Output

```
 RUN  v2.1.9

 ✓ src/tests/vehicles.integration.test.ts (43 tests) 1426ms
 ✓ src/modules/vehicles/vehicles.service.test.ts (18 tests) 396ms
 ✓ src/tests/auth.integration.test.ts (7 tests) 90ms
 ✓ src/modules/auth/auth.service.test.ts (9 tests) 767ms

 Test Files  4 passed (4)
      Tests  77 passed (77)
   Start at  18:02:13
   Duration  3.62s
```
