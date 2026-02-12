# Railway Deployment - Separate Frontend & Backend Services

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Railway Project                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐         │
│  │   Frontend       │      │   Backend        │         │
│  │   (Next.js)      │      │   (FastAPI)      │         │
│  │   Service 1      │      │   Service 2      │         │
│  │   Port: 3000     │◄────►│   Port: 8000     │         │
│  └──────────────────┘      └──────────────────┘         │
│         │                          │                     │
│         │                          │                     │
│         └──────────────┬───────────┘                     │
│                        ▼                                 │
│         ┌──────────────────────────┐                    │
│         │  PostgreSQL Database     │                    │
│         │  (Railway Postgres Add-on)│                   │
│         └──────────────────────────┘                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Deployment Steps

### 1. Create Railway Project

```bash
# Login to Railway
railway login

# Create new project
railway project create "Pickleball Platform"

# Navigate to project
cd ~/pickleball-platform
```

### 2. Add PostgreSQL Service

In Railway Dashboard:
1. New → Database → PostgreSQL
2. Set name: `postgres` or use default
3. Copy the `DATABASE_URL` connection string

### 3. Deploy Backend Service (FastAPI)

```bash
# Create backend service
railway service new

# Link to GitHub repo (if not already)
# Select: Python / FastAPI

# Configure environment variables:
DATABASE_URL=<copied from postgres service>
JWT_SECRET=your-super-secret-key-change-this
PORT=8000
```

Backend deployment files:
- `backend/Dockerfile` - Container configuration
- `backend/railway.json` - Railway-specific settings
- `backend/requirements.txt` - Python dependencies
- `backend/main.py` - FastAPI application

### 4. Deploy Frontend Service (Next.js)

```bash
# Create frontend service
railway service new

# Link to GitHub repo
# Select: Node.js / Next.js

# Configure environment variables:
NEXT_PUBLIC_API_URL=https://<backend-service-url>
NODE_ENV=production
PORT=3000
```

Frontend deployment files:
- `frontend/Dockerfile` - Container configuration
- `frontend/railway.json` - Railway-specific settings
- `frontend/package.json` - Node dependencies

### 5. Link Services Together

In Railway Dashboard:
1. Frontend service → Environment → Variables
2. Add `NEXT_PUBLIC_API_URL` = `${{ services.backend.domain }}`
   - This automatically uses the backend service URL
   - Railway will inject the actual domain at runtime

3. Backend service → Environment → Variables
4. Add `DATABASE_URL` = `${{ services.postgres.DATABASE_URL }}`

## Environment Variables

### Backend Service (FastAPI)
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET=very-secret-key
PORT=8000
NODE_ENV=production
```

### Frontend Service (Next.js)
```
NEXT_PUBLIC_API_URL=https://pickleball-backend.up.railway.app
NODE_ENV=production
PORT=3000
```

### Postgres Service (Add-on)
Railway automatically provides:
- `DATABASE_URL` (includes all credentials)
- Default port: 5432

## Testing Deployment

### Local Development with Docker Compose

```bash
# Start all services locally
docker-compose up

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Database: localhost:5432

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Testing

1. **Check Frontend**: https://pickleball-frontend.up.railway.app
2. **Check Backend Health**: https://pickleball-backend.up.railway.app/health
3. **Test Registration**: POST to backend `/auth/register`
4. **Test Courts**: GET from backend `/courts`

## Troubleshooting

### Backend service not starting
```bash
# Check logs in Railway dashboard
# Verify requirements.txt exists
# Verify main.py is in backend/ root

# Common issues:
- DATABASE_URL not set → service fails to initialize tables
- PORT not set → defaults to 8000 (should be fine)
- Missing JWT_SECRET → uses default (should work but warn)
```

### Frontend can't reach backend
```bash
# Check NEXT_PUBLIC_API_URL in frontend service environment
# Should be the full HTTPS URL of backend service
# Not localhost or relative path

# Frontend runs at build time, so env vars must be set BEFORE deploy
```

### Database connection failures
```bash
# Verify DATABASE_URL format:
# postgresql://user:password@host:port/database

# Check PostgreSQL service status in Railway
# Confirm it's ready before deploying backend
```

## Service URLs in Railway

Once deployed, you'll have:

| Service | URL | Internal |
|---------|-----|----------|
| **Frontend** | `https://pickleball-frontend.up.railway.app` | `http://frontend:3000` |
| **Backend** | `https://pickleball-backend.up.railway.app` | `http://backend:8000` |
| **Database** | `postgresql://host:5432/dbname` | Internal only |

## Deployment Workflow

```bash
# 1. Make code changes
git add .
git commit -m "Feature: Add court details endpoint"

# 2. Push to GitHub
git push origin master

# 3. Railway auto-deploys
# Watch deployment in Railway dashboard

# 4. Test endpoints
curl https://pickleball-backend.up.railway.app/health
curl https://pickleball-frontend.up.railway.app/

# 5. Monitor logs
# Dashboard → Service → Deployments → Logs
```

## Using Railway Variables

Railway supports variable substitution in environment:

```
# In Railway Dashboard, use ${{ services.SERVICE_NAME.FIELD }}

# Examples:
${{ services.postgres.DATABASE_URL }}
${{ services.backend.domain }}
${{ services.backend.url }}
${{ services.postgres.POSTGRES_PASSWORD }}
```

## Scaling Services

In Railway Dashboard:
- **Frontend**: Scale by replicas (Node.js is stateless)
- **Backend**: Scale by replicas (Python is stateless)
- **Database**: Use Railway's built-in PostgreSQL scaling

Note: Keep 1 backend instance for single application

## Cost Optimization

- **PostgreSQL**: Small instance $15/month
- **Frontend**: 1 replica = ~$5/month
- **Backend**: 1 replica = ~$5/month
- **Total**: ~$25/month minimum

## Next Steps

1. Push code to GitHub
2. Create Railway project
3. Add PostgreSQL service
4. Deploy backend service (test health endpoint)
5. Deploy frontend service (test home page)
6. Link services with environment variables
7. Test end-to-end flow (register → login → create court)
