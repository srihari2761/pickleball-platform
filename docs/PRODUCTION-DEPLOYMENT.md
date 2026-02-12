# Production Deployment Documentation

**Deployed:** 2026-02-11  
**Status:** ✅ Live

## Live URLs

| Service | URL | Platform |
|---------|-----|----------|
| **Frontend** | https://wholesome-energy-production.up.railway.app | Railway |
| **Backend API** | https://pickleball-backend-production-d92d.up.railway.app | Railway |
| **API Docs** | https://pickleball-backend-production-d92d.up.railway.app/docs | Railway |
| **Health Check** | https://pickleball-backend-production-d92d.up.railway.app/health | Railway |
| **GitHub** | https://github.com/srihari2761/pickleball-platform | GitHub |

## Architecture

```
[Users] → [Railway: Frontend (Next.js)] → [Railway: Backend (FastAPI)]
                                                    ↓
                                          [Railway: PostgreSQL]
```

## Services

### Frontend (`wholesome-energy`)
- **Framework:** Next.js 14
- **Port:** 3000
- **Env vars:** `NEXT_PUBLIC_API_URL` → backend URL

### Backend (`pickleball-backend`)
- **Framework:** FastAPI + Uvicorn
- **Port:** 8000
- **Docker:** `backend/Dockerfile`
- **Env vars:** `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT`

### Database (PostgreSQL)
- **Type:** Railway-managed PostgreSQL
- **Connected to:** pickleball-backend via `${{Postgres.DATABASE_URL}}`
- **Auto-migrations:** SQLAlchemy creates tables on startup

## CI/CD Pipeline

- **Trigger:** Push to `master` branch
- **GitHub Actions:** `.github/workflows/deploy.yml`
  - Tests backend (Python + PostgreSQL)
  - Tests frontend (Node.js build)
  - Railway auto-deploys on push

## How to Deploy Changes

1. Make changes locally
2. `git add -A && git commit -m "description"`
3. `git push origin master`
4. Railway auto-detects push and redeploys both services
5. Check Railway dashboard for build logs

## Manual Deploy (if needed)

```bash
# Backend
cd pickleball-platform
railway service pickleball-backend
cd backend && railway up

# Frontend
cd pickleball-platform
railway service wholesome-energy
railway up
```

## Environment Variables

### Backend (`pickleball-backend`)
| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Railway reference |
| `JWT_SECRET` | Auto-generated hex | Set manually |
| `NODE_ENV` | `production` | Set manually |
| `PORT` | `8000` | Set manually |

### Frontend (`wholesome-energy`)
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://pickleball-backend-production-d92d.up.railway.app` |

## Monitoring

- **Health endpoint:** `/health` returns `{"status":"ok","service":"pickleball-api"}`
- **Railway logs:** `railway logs` (CLI) or Railway dashboard
- **API docs:** `/docs` (Swagger UI) for testing endpoints
- **Uptime:** Use Railway's built-in health checks (configured in `railway.json`)

## Database Migrations

- SQLAlchemy auto-creates tables on application startup
- Schema defined in `backend/main.py` (User, Court, Booking models)
- No manual migration needed for initial deploy

## Troubleshooting

```bash
# Check service status
railway status

# View logs
railway logs

# View build logs
railway logs --build

# Switch between services
railway service wholesome-energy    # frontend
railway service pickleball-backend  # backend

# Check variables
railway variables
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/auth/register` | No | Register user |
| POST | `/auth/login` | No | Login, get JWT |
| GET | `/courts` | No | List all courts |
| POST | `/bookings` | Yes | Create booking |
