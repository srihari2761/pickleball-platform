# Pickleball Platform - Deployment Guide

**Status:** ✅ Code pushed to GitHub  
**GitHub Repo:** https://github.com/srihari2761/pickleball-platform  
**Deployment Targets:** Railway (Backend) + Vercel (Frontend)

## Overview

This is a full-stack application:
- **Backend:** FastAPI (Python) on Railway
- **Frontend:** Next.js (React) on Vercel
- **Database:** PostgreSQL on Railway (auto-provided)

## Quick Start (5 minutes)

### 1. Deploy Backend on Railway

```bash
# Go to Railway.app
# Click "New Project"
# Select "GitHub"
# Connect your GitHub account
# Select the pickleball-platform repository

# OR use Railway CLI:
railway login
cd ~/projects/pickleball-platform
railway init
railway up
```

**Railway Configuration:**
```
Service Name: pickleball-api
Build Command: (auto-detected)
Start Command: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
Health Check: /health
```

**Environment Variables (set in Railway dashboard):**
```
SECRET_KEY=generate-a-strong-key-here
DATABASE_URL=postgres://...  (auto-provided by Railway)
FRONTEND_URL=https://your-vercel-frontend.vercel.app
PYTHONUNBUFFERED=1
```

### 2. Deploy Frontend on Vercel

```bash
# Go to Vercel.app
# Click "Add New..."
# Select "Project"
# Import the GitHub repository

# OR use Vercel CLI:
npm install -g vercel
cd frontend
vercel
```

**Vercel Configuration:**
```
Framework: Next.js
Build Command: npm run build
Output Directory: .next
```

**Environment Variables (set in Vercel dashboard):**
```
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
```

### 3. Connect Frontend to Backend

1. Get your Railway backend URL from Railway dashboard
2. Update Vercel environment variable `NEXT_PUBLIC_API_URL` with the Railway URL
3. Redeploy the Vercel project

## Detailed Steps

### Step 1: Push Code to GitHub ✅

Code is already pushed to: https://github.com/srihari2761/pickleball-platform

### Step 2: Deploy Backend on Railway

#### Option A: Using Railway Dashboard

1. Go to https://railway.app
2. Login with GitHub
3. Click "New Project"
4. Select "GitHub"
5. Choose the pickleball-platform repository
6. Railway will auto-detect the Python backend
7. Add Environment Variables:
   ```
   SECRET_KEY=your-secret-key-min-32-chars
   DATABASE_URL=<auto-filled by Railway>
   FRONTEND_URL=https://your-frontend-vercel-url.vercel.app
   ```
8. Click "Deploy"

#### Option B: Using Railway CLI

```bash
npm install -g @railway/cli
railway login
cd ~/projects/pickleball-platform
railway init
# Select "Deploy existing project"
# Choose "FastAPI" or custom
railway up
```

#### Verify Deployment

```bash
curl https://your-railway-backend-url/health
# Expected: {"status": "healthy", "service": "pickleball-api"}

# View API docs
# Open: https://your-railway-backend-url/docs
```

### Step 3: Deploy Frontend on Vercel

#### Option A: Using Vercel Dashboard

1. Go to https://vercel.com
2. Login with GitHub
3. Click "Add New" → "Project"
4. Import the pickleball-platform repository
5. Select "Next.js" as framework
6. Set Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-backend-url
   ```
7. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
npm install -g vercel
cd ~/projects/pickleball-platform/frontend
vercel
# Follow the prompts
```

#### Verify Deployment

```bash
# Open your Vercel URL in browser
# Should see the Pickleball Platform home page
```

### Step 4: Test Full Integration

1. **Register a user:**
   ```bash
   curl -X POST https://your-railway-backend-url/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "username": "testuser",
       "password": "Test123!",
       "full_name": "Test User",
       "is_court_owner": false,
       "skill_level": "beginner"
     }'
   ```

2. **Login:**
   ```bash
   curl -X POST https://your-railway-backend-url/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123!"
     }'
   ```

3. **Browse frontend:**
   - Go to your Vercel URL
   - Click "Sign Up"
   - Create an account
   - Click "Browse Courts"
   - Verify API integration works

## Environment Variables Reference

### Backend (Railway)

| Variable | Value | Notes |
|----------|-------|-------|
| `SECRET_KEY` | Generated | Min 32 characters, use secure key generator |
| `DATABASE_URL` | Auto | PostgreSQL provided by Railway |
| `FRONTEND_URL` | https://... | Your Vercel frontend URL |
| `PYTHONUNBUFFERED` | 1 | Ensures logging works |
| `PORT` | Auto | Railway sets this automatically |

### Frontend (Vercel)

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | https://... | Your Railway backend URL |

## Database Setup

Railway automatically provisions a PostgreSQL database when you deploy. No manual setup required.

**Backup/Migrate Data:**
```bash
# Download database
railway connect
# Then use pg_dump to export

# Or use Railway CLI
railway data export
```

## Production Checklist

- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured
- [ ] Database connected
- [ ] CORS enabled (FastAPI already configured)
- [ ] SSL/TLS enabled (automatic on both platforms)
- [ ] Health checks passing
- [ ] API docs accessible at `/docs`
- [ ] User registration works
- [ ] Login works
- [ ] Court listing works
- [ ] Booking system works

## Troubleshooting

### "API connection failed" on Frontend

**Solution:** Check `NEXT_PUBLIC_API_URL` environment variable in Vercel
```bash
# Should point to your Railway backend
# Example: https://pickleball-api-production.railway.app
```

### "CORS error" on Frontend

**Solution:** Backend already has CORS configured, but verify:
1. Check `FRONTEND_URL` environment variable on Railway
2. Ensure it matches your Vercel domain exactly

### Database connection failed

**Solution:** 
1. Check `DATABASE_URL` in Railway logs
2. Ensure PostgreSQL addon is enabled
3. Check database connection limits

### "Cannot find module" on Railway

**Solution:** Ensure `requirements.txt` is in root directory
```bash
ls ~/projects/pickleball-platform/requirements.txt
```

### Server returns 500 error

**Solution:** Check Railway logs
```bash
railway logs
# OR use Railway dashboard → Logs tab
```

## Scaling & Optimization

### Railway Scaling
1. Go to Railway dashboard
2. Select your service
3. Adjust resource allocation (CPU, RAM)
4. Automatic load balancing is enabled

### Vercel Scaling
1. Vercel automatically scales based on traffic
2. Configure "Serverless Functions" settings if needed
3. Enable caching headers in next.config.js

## Monitoring

### Railway Monitoring
- Dashboard shows: CPU, Memory, Network, Errors
- Logs available in real-time
- Alerts can be configured

### Vercel Monitoring
- Analytics dashboard
- Web Vitals (Core Web Vitals)
- Error reporting

## Costs

### Railway
- **Free tier:** 5GB storage, shared resources
- **Paid:** $5/month minimum per service
- Database included

### Vercel
- **Free tier:** Limited bandwidth
- **Pro:** $20/month, unlimited builds
- Bandwidth: Pay-as-you-go

## Support Links

- 🚀 **Railway Docs:** https://docs.railway.app
- 🚀 **Vercel Docs:** https://vercel.com/docs
- 🐍 **FastAPI Docs:** https://fastapi.tiangolo.com
- ⚛️ **Next.js Docs:** https://nextjs.org/docs

## Next Steps

After deployment:

1. **Test everything:** Register, login, browse courts, create booking
2. **Monitor logs:** Watch for errors in production
3. **Gather feedback:** Test with real users
4. **Iterate:** Phase 2 features (maps, notifications, payments)
5. **Scale:** Add more features and optimize performance

---

**Deployment Date:** 2026-02-10  
**Status:** Ready for production ✅  
**GitHub:** https://github.com/srihari2761/pickleball-platform
