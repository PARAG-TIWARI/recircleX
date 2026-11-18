# Local development

This guide covers a local development setup for the current repository. Use development credentials and a separate development database. Do not point local experiments at the live RecycleX database.

## Prerequisites

- Python 3.12
- Node.js and npm compatible with the installed Next.js version
- Access to a MongoDB instance (MongoDB Atlas or a local development instance)
- Clerk development application keys for local authentication

The project uses separate frontend and backend processes.

## 1. Clone and inspect

```bash
git clone https://github.com/PARAG-TIWARI/recircleX.git
cd recircleX
```

Use the branch you intend to work on. Keep your local changes isolated from the production branch.

## 2. Configure the backend

Copy the backend example file to a local environment file.

**Windows PowerShell**

```powershell
Copy-Item backend/.env.example backend/.env
```

**macOS / Linux**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set values for the development environment:

- `MONGODB_URI` — development MongoDB connection string.
- `MONGODB_DATABASE` — development database name.
- `CLERK_SECRET_KEY` — secret key from your Clerk development instance.
- `CLERK_JWT_ISSUER` — issuer associated with the Clerk development instance.
- `CORS_ORIGINS` — local frontend origin, typically `http://localhost:3000`.
- `ENVIRONMENT` — set to `development`.

Use your own development credentials. Do not copy production credentials into local files or commit the resulting `.env` file.

Create and activate a Python virtual environment from the repository root.

**Windows PowerShell**

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
```

**macOS / Linux**

```bash
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
```

Start the API from the repository root:

```bash
python -m uvicorn backend.app.main:app --reload --port 8000
```

Local API references:

- Root: `http://localhost:8000/`
- Health: `http://localhost:8000/api/v1/health`
- Interactive API docs: `http://localhost:8000/docs`

The health endpoint checks database connectivity. It may return a degraded status when MongoDB is unavailable.

## 3. Configure the frontend

Copy the frontend example file.

**Windows PowerShell**

```powershell
Copy-Item frontend/.env.example frontend/.env.local
```

**macOS / Linux**

```bash
cp frontend/.env.example frontend/.env.local
```

Set the values for your Clerk development instance and local backend:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Keep the Clerk secret key server-side. Do not add the `NEXT_PUBLIC_` prefix to private credentials. Any variable prefixed with `NEXT_PUBLIC_` can be included in browser code; only put values there that are intended to be public.

If you enable Google Maps locally, use a development browser key with appropriate HTTP referrer and API restrictions.

Install dependencies and start the frontend:

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000`.

## 4. Run checks

Run backend tests from the repository root:

```bash
python -m pytest backend/tests
```

Run frontend checks from `frontend/`:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Record the actual output when reporting test results. A previous baseline or an earlier local run is not evidence that the current branch passes.

## 5. Common local issues

### Frontend cannot reach the API

- Confirm the backend is listening on port 8000.
- Confirm `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local`.
- Restart the Next.js development server after changing environment variables.
- Check that the local frontend origin is included in the backend CORS configuration.

### Authentication does not complete

- Confirm the publishable and secret keys belong to the same Clerk development application.
- Check the configured sign-in and sign-up routes in the frontend.
- Confirm that the backend issuer configuration matches the development Clerk instance.
- Inspect the browser network request and backend logs without copying tokens or secret values into issue reports.

### Database health check is degraded

- Verify the development MongoDB URI and database access.
- Confirm the current IP address is allowed by the development cluster's network rules.
- Check that the database user has the required permissions.
- Do not replace the development URI with the production URI to work around a local connection problem.

### First request is slow

A hosted backend may have a cold-start delay depending on its hosting plan. For local development, check that the API process has completed startup and that the database connection has succeeded.

## 6. Data and environment safety

- Use a dedicated development database and development Clerk instance.
- Do not run database reset or seed scripts against production.
- Do not commit `.env`, `.env.local`, private keys, database URIs or access tokens.
- Do not include secrets in screenshots, logs or issue descriptions.
- Treat browser-exposed `NEXT_PUBLIC_` variables as public.
- Review authentication and role changes separately; do not weaken access checks to make local testing easier.

For the architecture and route layout, see [Architecture overview](architecture.md).
