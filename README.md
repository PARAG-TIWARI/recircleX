# RecycleX — Digital Infrastructure for the Recycling Ecosystem

RecycleX is a unified, circular recycling marketplace and operations platform connecting households, collection partners, industrial recyclers, and enterprises.

---

## 1. Project Architecture (Modular Monolith)

```text
Recycle_X/
├── backend/                        # FastAPI Python 3.12 Backend
│   ├── app/
│   │   ├── main.py                 # App factory, CORS, exception handlers
│   │   ├── core/                   # Config, logging, security (Clerk JWT)
│   │   ├── db/                     # Async MongoDB Atlas connection & indexing
│   │   ├── models/                 # Base document models (users, profiles, materials, etc.)
│   │   ├── schemas/                # Pydantic v2 schemas (common APIResponse, user, auth)
│   │   ├── repositories/           # Pure data-access layer
│   │   ├── services/               # Business logic & auth synchronization
│   │   ├── api/v1/                 # Endpoints (/health, /auth/sync, /users/me, /profiles/me)
│   │   └── scripts/                # Database seeder (seed.py) & reset (reset_db.py)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                       # Next.js 14 App Router + TypeScript + Tailwind CSS
│   ├── app/
│   │   ├── page.tsx                # Climate-Tech Industrial Landing Page
│   │   ├── layout.tsx              # Root layout with Clerk, QueryClient, ToastProvider
│   │   ├── individual/
│   │   │   ├── auth/page.tsx       # Citizen & Collector Auth (HOUSEHOLD, COLLECTOR only)
│   │   │   ├── household/page.tsx  # Household Workspace
│   │   │   └── collector/page.tsx  # Collector Workspace (Dual-Marketplace Bridge)
│   │   ├── business/
│   │   │   ├── auth/page.tsx       # B2B Auth (RECYCLER, ENTERPRISE only)
│   │   │   ├── recycler/page.tsx   # Recycler Processing Workspace
│   │   │   └── enterprise/page.tsx # Enterprise Workspace
│   │   └── admin/page.tsx          # Admin Platform Operations Workspace
│   ├── components/
│   │   ├── ui/                     # 13 Reusable Design System components
│   │   └── layout/                 # Navbar, Footer, DashboardLayout
│   ├── lib/api/                    # Centralized API Client (client.ts, auth.ts, users.ts)
│   └── .env.example
│
├── .env.example                    # Root environment configuration template
└── README.md
```

---

## 2. Five Platform Roles

1. **`HOUSEHOLD`**: Residential citizens booking doorstep pickups and tracking eco-points.
2. **`COLLECTOR`**: Local collection partners with **Dual-Marketplace** access (Local Inflow from citizens + B2B Wholesale Outflow to recyclers).
3. **`RECYCLER`**: Industrial processing facilities purchasing bulk feedstock lots and issuing digital recycling certificates.
4. **`ENTERPRISE`**: Commercial brands and factories liquidating post-industrial scrap and sourcing circular raw resins.
5. **`ADMIN`**: Platform administrators monitoring system health and verifying institutional accounts.

---

## 3. Environment Variables

Create `.env` or `.env.local` based on `.env.example`:

### Backend (`backend/.env`):
```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=RecycleX
MONGODB_DATABASE=recyclex_db
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER=https://...
ENVIRONMENT=development
PORT=8000
```

### Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 4. Commands to Run

### Backend:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

### Database Seeding:
```bash
py -3.12 backend/app/scripts/seed.py
```

---

## 5. API Endpoints (`/api/v1`)

* `GET /api/v1/health` — Checks API health and MongoDB Atlas connectivity.
* `POST /api/v1/auth/sync` — Synchronizes Clerk user, verifies portal boundary, and records role in MongoDB Atlas.
* `GET /api/v1/users/me` — Fetches current user and verified role.
* `GET /api/v1/profiles/me` — Fetches user profile.
* `PUT /api/v1/profiles/me` — Updates user profile.
