# 🚀 Pickleball Platform - Quick Start Guide

**Get the platform running in 5 minutes!**

## Local Development (Your Computer)

### Option 1: Complete Setup

#### Prerequisites
- Python 3.9+
- Node.js 16+
- Git

#### Backend Setup (Terminal 1)
```bash
# Clone the repo
git clone https://github.com/srihari2761/pickleball-platform.git
cd pickleball-platform

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend
uvicorn backend.main:app --reload
```

✅ Backend running on: **http://localhost:8000**  
📖 API Docs: **http://localhost:8000/docs**

#### Frontend Setup (Terminal 2)
```bash
cd pickleball-platform/frontend

# Install dependencies
npm install

# Run the frontend
npm run dev
```

✅ Frontend running on: **http://localhost:3000**

### Option 2: Docker (If you have Docker installed)
```bash
docker-compose up
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

---

## Production Deployment (Railway + Vercel)

### 1️⃣ Deploy Backend on Railway (5 minutes)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd ~/pickleball-platform
railway up
```

Or use Railway dashboard:
1. Go to https://railway.app
2. Click "New Project"
3. Select "GitHub"
4. Choose the repository
5. Set environment variables:
   - `SECRET_KEY` = (generate a secure key)
   - `FRONTEND_URL` = (your Vercel URL)
6. Click "Deploy"

### 2️⃣ Deploy Frontend on Vercel (3 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd ~/pickleball-platform/frontend
vercel
```

Or use Vercel dashboard:
1. Go to https://vercel.app
2. Click "Import"
3. Select the GitHub repository
4. Set environment variable:
   - `NEXT_PUBLIC_API_URL` = (your Railway URL)
5. Click "Deploy"

### 3️⃣ Link Frontend to Backend

In Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app`
3. Redeploy

---

## Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player@test.com",
    "username": "player1",
    "password": "Test123!",
    "full_name": "Test Player",
    "is_court_owner": false,
    "skill_level": "intermediate"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player@test.com",
    "password": "Test123!"
  }'
```

Copy the `access_token` from the response.

### 3. Get Current User
```bash
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Create a Court (as court owner)
First, register as a court owner:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@test.com",
    "username": "owner1",
    "password": "Test123!",
    "full_name": "Court Owner",
    "is_court_owner": true,
    "skill_level": "advanced"
  }'
```

Then create a court:
```bash
curl -X POST http://localhost:8000/api/v1/courts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OWNER_TOKEN" \
  -d '{
    "name": "Downtown Courts",
    "address": "123 Main St, San Francisco, CA",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "surface_type": "hardcourt",
    "number_of_courts": 4,
    "description": "Professional pickleball facility",
    "amenities": "Lights, Restrooms, Parking"
  }'
```

### 5. List All Courts
```bash
curl http://localhost:8000/api/v1/courts
```

### 6. Search Courts by Location
```bash
curl "http://localhost:8000/api/v1/courts?location=San%20Francisco"
```

### 7. Create a Booking
```bash
curl -X POST http://localhost:8000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PLAYER_TOKEN" \
  -d '{
    "court_id": 1,
    "start_time": "2026-02-15T10:00:00",
    "duration_minutes": 60
  }'
```

---

## Frontend Testing

1. Open http://localhost:3000
2. Click "Sign Up"
3. Create an account (player or court owner)
4. Login with your credentials
5. Browse courts
6. Create a booking

---

## File Structure

```
pickleball-platform/
├── backend/main.py              ← FastAPI app
├── frontend/pages/              ← React pages
├── README.md                    ← Documentation
├── DEPLOYMENT-GUIDE.md          ← Detailed deployment
├── BUILD-SUMMARY.md             ← What was built
└── QUICKSTART.md               ← This file
```

---

## Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.9+

# Check if port 8000 is available
lsof -i :8000

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend won't start
```bash
# Check Node version
node --version  # Should be 16+

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install
```

### API connection error in frontend
```bash
# Check if backend is running
curl http://localhost:8000/health

# Check NEXT_PUBLIC_API_URL in .env.local
cat frontend/.env.local
```

### Database error
```bash
# SQLite should auto-create, but if needed:
rm pickleball.db  # Deletes and recreates on next run
```

---

## Next Steps

1. ✅ Run locally to test
2. ✅ Deploy to Railway (backend)
3. ✅ Deploy to Vercel (frontend)
4. ✅ Test in production
5. ✅ Add Phase 2 features (see BUILD-SUMMARY.md)

---

## Architecture

```
┌─────────────────┐
│   User Browser  │
│   (Vercel)      │
│   Next.js       │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────────┐
│  FastAPI Backend    │
│    (Railway)        │
│ 17 REST endpoints   │
└────────┬────────────┘
         │ SQL
         │
┌────────▼─────────────┐
│   PostgreSQL         │
│   (Railway)          │
│   Database           │
└──────────────────────┘
```

---

## API Endpoints Cheat Sheet

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/auth/register` | Create user |
| POST | `/api/v1/auth/login` | Get token |
| GET | `/api/v1/auth/me` | Get user info |
| GET | `/api/v1/courts` | List courts |
| POST | `/api/v1/courts` | Create court |
| GET | `/api/v1/courts/{id}` | Get court |
| PUT | `/api/v1/courts/{id}` | Update court |
| DELETE | `/api/v1/courts/{id}` | Delete court |
| POST | `/api/v1/bookings` | Create booking |
| GET | `/api/v1/courts/{id}/bookings` | Get bookings |
| POST | `/api/v1/friends/{id}` | Add friend |
| GET | `/api/v1/friends` | List friends |

---

## Resources

- 📖 [Full README](README.md)
- 🚀 [Deployment Guide](DEPLOYMENT-GUIDE.md)
- 📊 [Build Summary](BUILD-SUMMARY.md)
- 📝 [Product Plan](PICKLEBALL-PLATFORM-PLAN.md)
- 🔗 [GitHub Repo](https://github.com/srihari2761/pickleball-platform)
- 📚 [FastAPI Docs](https://fastapi.tiangolo.com)
- ⚛️ [Next.js Docs](https://nextjs.org)

---

**Happy coding! 🎾**
