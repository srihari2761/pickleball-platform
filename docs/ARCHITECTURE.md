# Pickleball Platform - Multi-Service Architecture

## Overview

The Pickleball Platform is now deployed as **two independent services** on Railway:

- **Frontend**: Next.js React application (Node.js)
- **Backend**: FastAPI Python application (Python)
- **Database**: PostgreSQL (Railway managed service)

This architecture provides:
- Independent scaling
- Separate deployment pipelines
- Clear separation of concerns
- Better resource utilization
- Easy to develop and test locally

## Project Structure

```
pickleball-platform/
│
├── frontend/                          # Next.js Application
│   ├── Dockerfile                     # Container config for Next.js
│   ├── railway.json                   # Railway deployment config
│   ├── next.config.js                 # Next.js configuration
│   ├── package.json                   # Node dependencies
│   ├── pages/
│   │   ├── index.js                   # Home page
│   │   ├── login.js                   # Login page
│   │   ├── register.js                # Registration page
│   │   └── dashboard.js               # User dashboard
│   ├── utils/
│   │   └── api.js                     # Axios client for backend API
│   └── .next/                         # Build output
│
├── backend/                           # FastAPI Application
│   ├── Dockerfile                     # Container config for Python
│   ├── railway.json                   # Railway deployment config
│   ├── requirements.txt                # Python dependencies
│   ├── main.py                        # FastAPI application
│   └── .gitignore                     # Python-specific ignores
│
├── docker-compose.yml                 # Local development setup
├── .env.local                         # Development environment variables
├── RAILWAY-DEPLOYMENT.md              # Multi-service deployment guide
├── ARCHITECTURE.md                    # This file
└── README.md                          # General documentation

```

## Service Details

### Frontend Service (Next.js)

**Location**: `./frontend/`  
**Language**: JavaScript (Node.js 18+)  
**Port**: 3000  
**Key Files**:
- `pages/` - React components and pages
- `utils/api.js` - Axios client configured to call backend
- `next.config.js` - Next.js configuration

**Environment Variables**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API URL
NODE_ENV=development
PORT=3000
```

**Commands**:
```bash
cd frontend
npm install
npm run dev      # Local development (localhost:3000)
npm run build    # Production build
npm start        # Run production build
```

### Backend Service (FastAPI)

**Location**: `./backend/`  
**Language**: Python 3.11+  
**Port**: 8000  
**Key Files**:
- `main.py` - FastAPI application with all endpoints
- `requirements.txt` - Python dependencies
- `Dockerfile` - Container configuration

**Environment Variables**:
```
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=your-secret-key
PORT=8000
NODE_ENV=development
```

**Commands**:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000  # Development
```

### API Endpoints

All endpoints are on the FastAPI backend:

**Authentication**:
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login (returns JWT token)

**Courts**:
- `GET /courts` - List all courts
- `POST /courts` - Create new court (auth required)

**Bookings**:
- `GET /bookings` - Get user's bookings (auth required)
- `POST /bookings` - Create new booking (auth required)

**Health**:
- `GET /health` - Health check endpoint

## Local Development

### Prerequisites
- Docker & Docker Compose
- OR: Node.js 18+ & Python 3.11+

### Option 1: Docker Compose (Recommended)

```bash
# Start all services (postgres, backend, frontend)
docker-compose up

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - Database: localhost:5432

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**docker-compose.yml includes**:
- PostgreSQL 15
- FastAPI backend with auto-reload
- Next.js frontend with hot-reload
- Network connectivity between services
- Volume mounts for live code updates

### Option 2: Manual Setup (No Docker)

**1. Start PostgreSQL** (or use existing database):
```bash
# If using local postgres
createdb pickleball_dev
```

**2. Start Backend**:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**3. Start Frontend** (new terminal):
```bash
cd frontend
npm install
npm run dev
```

**Access**:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Backend health: http://localhost:8000/health

## Development Workflow

### Making Changes

**Frontend Changes**:
```bash
# Edit pages/ or utils/
# Changes auto-reload on http://localhost:3000
git add .
git commit -m "Feature: Add new page"
```

**Backend Changes**:
```bash
# Edit main.py
# Changes auto-reload via --reload flag
git add .
git commit -m "Feature: Add new endpoint"
```

**Database Changes**:
```bash
# Edit main.py database models
# Tables created automatically on first request
# Reset: docker-compose down -v && docker-compose up
```

### Testing

```bash
# Test backend health
curl http://localhost:8000/health

# Test frontend
curl http://localhost:3000

# Test authentication
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass","name":"Test","role":"player","skill_level":"beginner"}'
```

## Database Schema

PostgreSQL tables created automatically:

**users**:
```sql
id (PK), email (UNIQUE), password, name, role, skill_level, created_at
```

**courts**:
```sql
id (PK), owner_id (FK), name, location, surface_type, amenities, created_at
```

**bookings**:
```sql
id (PK), court_id (FK), player_id (FK), time_slot, status, created_at
```

**messages**:
```sql
id (PK), sender_id (FK), receiver_id (FK), content, created_at
```

## Authentication

### JWT Flow

1. User registers/logs in via `/auth/register` or `/auth/login`
2. Backend returns `access_token` (JWT)
3. Frontend stores token in localStorage
4. Frontend includes token in all API calls: `Authorization: Bearer <token>`
5. Backend validates token on protected endpoints

### Expiration

- Token expires in 30 minutes (configurable in main.py)
- Refresh logic: Re-login for new token
- Future: Add refresh token endpoint

## Deployment on Railway

See `RAILWAY-DEPLOYMENT.md` for detailed instructions.

**Quick Summary**:
1. Create Railway project
2. Add PostgreSQL service
3. Deploy backend (FastAPI)
4. Deploy frontend (Next.js)
5. Link services via environment variables
6. Test endpoints

**Final URLs**:
- Frontend: `https://pickleball-frontend.up.railway.app`
- Backend: `https://pickleball-backend.up.railway.app`
- Database: Internal only (via DATABASE_URL)

## Troubleshooting

### Frontend can't reach backend
```
Problem: 404 or CORS errors
Solution: Check NEXT_PUBLIC_API_URL in frontend env vars
         Should be full URL: https://pickleball-backend.up.railway.app
         Not localhost or /api/
```

### Backend not starting
```
Problem: Service crashes on startup
Solution: Check DATABASE_URL is set
         Check JWT_SECRET is set
         Check logs for other errors
```

### Database not initializing
```
Problem: Tables don't exist
Solution: Backend creates tables on first request
         If fails, check DATABASE_URL and PostgreSQL service is running
         May need to restart backend service
```

### CORS errors in browser
```
Problem: Browser blocks requests to backend
Solution: Already handled - FastAPI has CORSMiddleware configured
         Allows requests from any origin (customize in production)
```

## Security Considerations

### Development
- JWT_SECRET: Use default for local dev
- CORS: Allows all origins (fine for local dev)
- Database: No auth required (docker container)

### Production
- JWT_SECRET: Generate strong random key
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- CORS: Restrict to frontend domain
  ```python
  allow_origins=["https://pickleball-frontend.up.railway.app"]
  ```
- Database: Use Railway's managed PostgreSQL (encrypted, secured)
- HTTPS: Railway provides free HTTPS certificates
- Env vars: Set securely in Railway dashboard (never commit secrets)

## Performance Optimization

### Frontend
- Next.js automatic code splitting
- Image optimization
- Static generation where possible
- Caching strategies

### Backend
- SQLAlchemy connection pooling
- Async database queries (future enhancement)
- Redis caching (future enhancement)
- Database indexing on email, user_id

### Database
- PostgreSQL optimizations
- Proper indexes on foreign keys
- Connection pooling via SQLAlchemy

## Future Enhancements

- [ ] Add refresh token endpoint
- [ ] Implement async/await for database queries
- [ ] Add Redis caching layer
- [ ] Implement WebSocket for real-time features
- [ ] Add email notifications
- [ ] Rate limiting on API endpoints
- [ ] Comprehensive test suite
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database migrations (Alembic)
- [ ] Logging and monitoring

## Support

For questions or issues:
1. Check logs: `docker-compose logs -f`
2. Check RAILWAY-DEPLOYMENT.md for railway issues
3. Check environment variables
4. Try restarting services: `docker-compose down && docker-compose up`

## License

MIT
