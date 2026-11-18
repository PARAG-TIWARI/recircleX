# RecycleX

RecycleX is a web application for coordinating recycling activity across households, collection partners, recyclers and enterprise users. The product brings several parts of that journey—material listings, pickup coordination, marketplace activity and order workflows—into one place.

The project is being developed as a connected product rather than a collection of separate role-based websites. Each user group has its own workspace and set of workflows.

**Product website:** [recirclex.com](https://recirclex.com)  
**Repository:** [PARAG-TIWARI/recircleX](https://github.com/PARAG-TIWARI/recircleX)

> **Project status:** RecycleX is an actively developed product. The repository contains application routes and backend endpoints for the workflows described below, but the presence of a route does not by itself mean that every workflow or external integration has been fully validated in production. Feature availability can vary as development continues.

## What the platform is designed to support

RecycleX is organised around five user roles:

| User role | Intended use |
| --- | --- |
| **Household** | Create material listings, arrange pickups and review recycling activity |
| **Collector** | Manage collection activity, inventory, pickups and material sales |
| **Recycler** | Review available materials, manage procurement and follow order activity |
| **Enterprise** | Manage business-side material and recycling workflows |
| **Admin** | Support platform operations and role-based administration |

The product brings together individual and business workflows. For example, a household can create a material listing; a collector can coordinate collection; and a recycler can review material offered through the marketplace. The exact workflow available to a user depends on their assigned role and the features enabled in the current deployment.

## Main application areas

The frontend uses the Next.js App Router. Major route groups include:

- **Public entry:** landing page and role-specific authentication pages.
- **Household workspace:** listings, pickups, profile, impact information and the EcoBot experience.
- **Collector workspace:** pickup activity, inventory, maps, marketplace and orders.
- **Recycler workspace:** marketplace, suppliers, orders and facility profile.
- **Enterprise workspace:** business-side material and operational workflows.
- **Administration:** platform-level administration.

These route groups describe the application structure. They should not be read as a claim that every workflow is complete or available to every user in the live environment.

## Technology

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 14 App Router, React 18, TypeScript, Tailwind CSS |
| Authentication | Clerk integration |
| Frontend data and state | TanStack Query |
| Backend API | Python, FastAPI, Uvicorn |
| Validation and settings | Pydantic v2, Pydantic Settings |
| Database | MongoDB Atlas, Motor / PyMongo |
| API security and identity integration | JWT-based Clerk integration, role-aware backend dependencies |
| Supporting integrations | Google Maps and AI-related service modules |

The repository is structured as a frontend application and a FastAPI backend. The backend separates API routes, schemas, services, repositories, models and database connection code.

For a component-level overview, see [Architecture](docs/architecture.md).

## Repository layout

```text
recircleX/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Versioned API routes
│   │   ├── core/            # Configuration, logging and security helpers
│   │   ├── db/              # MongoDB connection management
│   │   ├── middleware/      # Request and error handling middleware
│   │   ├── models/          # Database-facing models
│   │   ├── repositories/    # Data access
│   │   ├── schemas/         # Request and response schemas
│   │   └── services/        # Application and business logic
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/                 # App Router pages and route groups
│   ├── components/          # Shared UI and layout components
│   ├── lib/api/             # Shared API client and endpoint modules
│   ├── public/
│   └── .env.example
├── docs/
│   ├── architecture.md
│   └── local-development.md
├── asgi.py
├── Dockerfile
├── package.json
└── README.md
```

## Running the project locally

The repository has separate frontend and backend processes. Use the local-development guide for environment setup, commands and troubleshooting:

**[Local development guide](docs/local-development.md)**

At a high level:

1. Configure the backend environment using `backend/.env.example`.
2. Configure the frontend environment using `frontend/.env.example`.
3. Start the FastAPI service from the repository root.
4. Start the Next.js application from the `frontend` directory.
5. Use a development database and development credentials while testing locally.

Do not commit `.env` files, access tokens, database credentials or other secrets. Values prefixed with `NEXT_PUBLIC_` are exposed to browser code and must not contain private credentials.

## API overview

The backend exposes a versioned API under `/api/v1`. The route modules currently cover:

- Authentication and user/profile synchronisation
- Listings and addresses
- Pickups and collector operations
- Marketplace and orders
- Recycler operations
- Notifications and impact information
- AI-related material analysis
- Storage uploads
- Health checks

FastAPI's interactive API documentation is available at `/docs` when the backend is running locally.

The main health endpoint is:

```text
GET /api/v1/health
```

It reports API and database connectivity information. A healthy application process does not, by itself, prove that every user workflow is functioning end to end.

## Development and verification

Before proposing a change, run the checks relevant to the area being changed. Common checks include:

```bash
# Backend tests (from the repository root)
python -m pytest backend/tests

# Frontend checks (from the frontend directory)
npx tsc --noEmit
npm run lint
npm run build
```

These commands are the expected local checks; results should be recorded from the environment in which they are run. The repository's baseline notes are historical and should not be treated as a current test result.

## Documentation

- [Architecture and request flow](docs/architecture.md)
- [Local development and configuration](docs/local-development.md)

## Notes for contributors

- Keep frontend pages and visual components separate from API and business-logic changes.
- Reuse the shared frontend API client and endpoint modules when adding API calls.
- Keep request validation in schemas and application logic in services.
- Add or update tests when changing behaviour.
- Describe external integrations accurately, including whether they use live services, test credentials or local placeholders.
- Update this documentation when routes, roles, configuration or setup steps change.

RecycleX is a project in active development. Clear documentation and reproducible local setup are important parts of making the product easier to review, test and maintain.
