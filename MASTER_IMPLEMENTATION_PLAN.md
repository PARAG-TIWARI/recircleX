# MASTER IMPLEMENTATION PLAN — RECYCLEX

## Priority Task Matrix

| Task ID | Issue ID | Priority | Description | Affected Files | Current Behavior | Expected Behavior | Minimal Safe Fix | Risk | Tests | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TASK-01** | `API-001` | **P2** | Add `/health` direct root alias endpoint | `backend/app/main.py` | `GET /health` returns 404 | `GET /health` returns 200 with DB status | Mount `/health` on FastAPI app or include router on root | Low | `pytest backend/tests/test_health.py` | `GET /health` returns status 200 and DB status |
| **TASK-02** | `SCH-001` | **P3** | Remove deprecated `json_encoders` from `BaseMongoModel` | `backend/app/models/base.py` | Pytest emits 26 `PydanticDeprecatedSince20` warnings | Pytest runs cleanly without Pydantic deprecation warnings | Remove deprecated `json_encoders` from `ConfigDict` | Low | `pytest backend/tests` | 0 Pydantic deprecation warnings |
| **TASK-03** | `TST-001` | **P3** | Use 32-byte secret in unit test JWT generator | `backend/tests/test_auth.py` | Pytest emits 5 `InsecureKeyLengthWarning` | Pytest runs with 0 cryptography warnings | Use 32-byte test key | Low | `pytest backend/tests/test_auth.py` | 0 cryptography warnings |
| **TASK-04** | `UI-001` | **P3** | Optimize static `/logo.png` image tags across layouts | `frontend/components/layout/navbar.tsx`, `frontend/components/layout/footer.tsx`, `frontend/components/layout/dashboard-layout.tsx` | Lint emits `@next/next/no-img-element` warnings | Next.js `<Image />` component used cleanly | Use Next.js `<Image />` with explicit dimensions | Low | `npm run lint`, `next build` | Next build with 0 lint errors |

## Dependency Strategy (Major Version Policy)
- **Constraint**: Next.js 14.2.35 and Clerk 5.7.5 are working reliably in production.
- **Action**: Do NOT perform major version upgrades (`next@16` or `@clerk/nextjs@7`) to prevent breaking changes in SSR, Turbopack, and Clerk middleware routing.
