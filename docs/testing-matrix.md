# Production Safety Test Matrix

Use this matrix as the release gate for any new feature or refactor. The goal is to make sure the app still works in production after additional features are added.

## How to use this file

1. **Before implementation**
   - Add a new row (or update an existing one) for the feature you are building.
   - Mark expected coverage types: Unit, Integration/API, E2E, and Smoke.
2. **During implementation**
   - Add or update tests in each required layer.
   - Add the exact test file path under **Test Files**.
3. **Before merge/deploy**
   - Run the commands in the [Execution checklist](#execution-checklist).
   - Update **Status** to `Done` only when all required checks pass.
4. **After production incidents**
   - Add a new row under **Regression cases from incidents** and include a failing scenario that now has a permanent test.

## Coverage legend

- ✅ Required for this feature
- ◻️ Optional (nice to have)
- ❌ Not needed

## High-value “don’t break prod” cases (recommended)

### 1) Critical user journeys (E2E)
- Request submission flow (valid submit, validation errors, success toast/redirect).
- Track-request flow (known ID found, unknown ID not found, API error fallback).
- Admin auth + access control (unauthenticated rejected, non-admin rejected, admin allowed).
- Admin project management (create, edit, schedule/un-schedule, delete).
- Upload pipeline (upload success, invalid type/size blocked, storage/API failure handled).

### 2) API contract and error-path stability
- 401/403 coverage for admin-only routes.
- 4xx validation for malformed payloads.
- 5xx fallback response shape consistency (`{ error: string }`).
- DB failure propagation does not leak sensitive details.
- Partial update semantics for PATCH routes.

### 3) Regression tests for every newly added feature
- One happy path test minimum.
- One edge/error-path test minimum.
- One backward-compatibility case when old data shape still exists.

### 4) Deployment smoke checks
- App boots in production mode.
- Critical public pages return 200.
- Critical APIs return expected status codes.
- Authentication callback route handles valid and invalid states.

## Concrete test matrix

| Feature area | Unit | Integration/API | E2E | Smoke | Test Files | Owner | Status |
|---|---|---|---|---|---|---|---|
| Public request submission | ✅ | ✅ | ✅ | ✅ | `src/app/api/requests/route.test.ts`, `src/app/track-request/page.test.tsx` | Team | In progress |
| Project APIs (list/create/update/delete) | ✅ | ✅ | ✅ | ✅ | `src/app/api/projects/route.test.ts`, `src/app/api/projects/[id]/route.test.ts` | Team | In progress |
| Upload API + UI uploader | ✅ | ✅ | ✅ | ✅ | `src/app/api/upload/route.test.ts`, `src/components/ui/ImageUploader.test.tsx` | Team | In progress |
| Admin form behavior (tabs, dynamic sections) | ✅ | ◻️ | ✅ | ◻️ | `src/components/admin/ProjectForm.test.tsx` | Team | In progress |
| Auth callback/session handling | ✅ | ✅ | ✅ | ✅ | `src/app/auth/callback/route.test.ts` | Team | In progress |
| Utility functions (formatting, image/drive helpers) | ✅ | ◻️ | ❌ | ❌ | `src/lib/utils.test.ts`, `src/lib/imageUtils.test.ts`, `src/lib/driveUtils.test.ts` | Team | In progress |
| Admin-only form responses endpoint | ✅ | ✅ | ✅ | ✅ | `src/app/api/admin/form-responses/route.test.ts` | Team | In progress |
| About API authorization and write path | ✅ | ✅ | ◻️ | ✅ | `src/app/api/about/route.test.ts` | Team | In progress |

## Regression cases from incidents

Add entries here after every production bug.

| Incident date | User-visible issue | Permanent test added | Test file | Status |
|---|---|---|---|---|
| YYYY-MM-DD | Example: project edit silently failed when `gridRowSpan` missing | Validate default fallback for missing spans | `src/app/api/projects/route.test.ts` | Template |

## Execution checklist

Run these commands before deploy:

```bash
npm run lint
npm test -- --run
npm run build
```

If E2E tests are added in future, also run:

```bash
npm run test:e2e
```

## Maintenance rule

Any PR that changes user-facing behavior or API contracts must:
1. Update this matrix.
2. Add at least one new/updated automated test.
3. Include test evidence in the PR description.
