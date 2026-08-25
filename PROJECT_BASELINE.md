# PROJECT BASELINE — RECYCLEX

## 1. Project Overview & Repository Details
- **Project Name**: RecycleX (recircleX)
- **Repository**: https://github.com/PARAG-TIWARI/recircleX
- **Current Git Branch**: `main`
- **Current Git Commit**: `f0b9e69` (`fix(frontend): resolve all react hook missing dependencies, optimize image tags, and add build warning audit report`)
- **Working Tree**: Clean

## 2. Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 14.2.35 (App Router)
- **Language**: TypeScript 5.6.3
- **Styling**: TailwindCSS 3.4.13, PostCSS 8.4.47, Autoprefixer 10.4.20
- **Authentication & User Management**: Clerk Next.js SDK (`@clerk/nextjs` 5.7.5, `@clerk/themes` 2.4.57)
- **Data Fetching / State**: `@tanstack/react-query` 5.59.0
- **Icons & UI Utilities**: `lucide-react` 0.453.0, `clsx` 2.1.1, `tailwind-merge` 2.5.4
- **Package Manager**: npm
- **Hosting / Deployment**: Vercel (`https://frontend-mocha-nine-12.vercel.app/`)

### Backend
- **Framework**: FastAPI (>=0.115.0) + Uvicorn (>=0.30.0)
- **Language & Runtime**: Python 3.12.10 (Tested on CPython 3.12)
- **Data Validation & Settings**: Pydantic v2 (>=2.8.0), Pydantic Settings (>=2.4.0)
- **Database Driver**: Motor (AsyncIOMotorClient >=3.5.0) + PyMongo (>=4.8.0)
- **Authentication Verification**: PyJWT (>=2.9.0) + Cryptography (>=43.0.0)
- **Hosting / Deployment**: Render (`https://recirclex.onrender.com/`)
- **WSGI / ASGI Gateway**: `asgi.py` / `uvicorn backend.app.main:app`

### Database
- **Provider**: MongoDB Atlas (Cloud)
- **Cluster Domain**: `recyclex-cluster.prebpfy.mongodb.net` (SRV DNS verified and resolving across 3 shards)
- **Database Name**: `recyclex_db`
- **Driver Security**: TLS with `certifi.where()` CA bundle and ping validation on startup.

## 3. Frontend Routes Matrix (28 App Routes + Middleware)
1. `/` (Public Landing & Ecosystem Portal)
2. `/_not-found` (404 Error boundary)
3. `/admin` (Super-admin Governance Console)
4. `/api/auth/set-role` (Clerk Serverless Role API Endpoint)
5. `/business/auth` (Recycler & Enterprise Auth Portal)
6. `/business/enterprise` (Enterprise ESG & Scrap Generation Hub)
7. `/business/recycler` (Recycler Procurement & Facility Dashboard)
8. `/business/recycler/marketplace` (B2B Scrap Material Marketplace)
9. `/business/recycler/marketplace/[id]` (Material Batch Detail & Offer Workflow)
10. `/business/recycler/orders` (Recycler Purchase Orders)
11. `/business/recycler/orders/[id]` (Order Tracking & Dispatch Lifecycle)
12. `/business/recycler/profile` (Recycler Factory Profile & Verification)
13. `/business/recycler/suppliers` (Registered Waste Supplier Directory)
14. `/individual/auth` (Household & Collector Auth Portal)
15. `/individual/collector` (Collector Territory Dispatch Hub)
16. `/individual/collector/inventory` (Aggregated Scrap Inventory Management)
17. `/individual/collector/map` (Live Scrap Pickup Territory Map)
18. `/individual/collector/marketplace` (Collector Material Sales Portal)
19. `/individual/collector/orders` (Collector Sales Orders)
20. `/individual/collector/pickups` (Assigned & Available Scrap Pickups)
21. `/individual/collector/pickups/[id]` (Pickup Fulfillment & Digital Scale Verification)
22. `/individual/collector/profile` (Collector Operational Profile)
23. `/individual/household` (Household Recycling & Rewards Dashboard)
24. `/individual/household/create-listing` (AI Vision Scrap Listing Creation)
25. `/individual/household/ecobot` (EcoBot AI Assistant)
26. `/individual/household/impact` (Environmental Impact & Carbon Savings)
27. `/individual/household/listings` (Household Scrap Listings)
28. `/individual/household/listings/[id]` (Scrap Listing Status & Offers)
29. `/individual/household/pickups` (Scheduled Doorstep Pickups)
30. `/individual/household/profile` (Household User Profile)

## 4. Backend API Routes Matrix
- `GET, HEAD /` (Root Service Info)
- `GET /api/v1/health` (Health & MongoDB Ping Status)
- `POST /api/v1/auth/sync` (Clerk User & Role Synchronization)
- `GET, PUT /api/v1/users/me`, `GET /api/v1/users`
- `GET, PUT /api/v1/profiles/me`
- `GET, POST /api/v1/listings`, `GET, PUT, DELETE /api/v1/listings/{id}`
- `GET, POST /api/v1/pickups`, `GET, PUT /api/v1/pickups/{id}`
- `GET, POST /api/v1/addresses`
- `POST /api/v1/ai/analyze-material`
- `GET /api/v1/impact/me`
- `POST /api/v1/storage/upload`
- `GET /api/v1/collector/stats`, `GET /api/v1/collector/pickups`
- `GET /api/v1/notifications`
- `GET, POST /api/v1/marketplace/listings`
- `GET, POST /api/v1/orders`
- `GET /api/v1/recycler/stats`

## 5. Existing Tests Baseline
- **Pytest Suite (`backend/tests`)**: 13 passed in 1.23s.
- **Frontend Type Check (`npx tsc --noEmit`)**: 0 errors.
- **Frontend Linter (`npm run lint`)**: 0 errors, 13 image optimization warnings.
- **Frontend Build (`next build`)**: 28 pages compiled cleanly.

## 6. Known Baseline Audit Findings
1. Deprecated Pydantic v1 `json_encoders` in `BaseMongoModel` generating warnings in Python 3.12+.
2. Test auth HMAC secret key length < 32 bytes producing `InsecureKeyLengthWarning`.
3. Root `/health` path returned 404 while `/api/v1/health` returned 200.
4. Next.js image optimization warnings on raw `<img>` tags.
