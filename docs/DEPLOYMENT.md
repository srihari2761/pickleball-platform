# Deployment Guide

This guide explains how to deploy the Pickleball Platform to Vercel (frontend) and Railway (backend).

## Prerequisites

- GitHub account with repo access (✅ Done: https://github.com/srihari2761/pickleball-platform)
- Vercel account (free tier available)
- Railway account (free tier available)
- PostgreSQL database (Railway provides this)

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Project

1. Go to https://railway.app
2. Sign in or create account
3. Click "New Project" → "Deploy from GitHub"
4. Select repository: `srihari2761/pickleball-platform`
5. Click "Deploy"

### 1.2 Add PostgreSQL Database

1. In Railway dashboard, click "Add" → "PostgreSQL"
2. Wait for database to provision (2-3 minutes)
3. Copy the `DATABASE_URL` connection string

### 1.3 Configure Environment Variables

Add these variables in Railway project settings:

```
DATABASE_URL=postgresql://user:pass@host:5432/pickleball
JWT_SECRET=your-super-secret-jwt-key-12345
NODE_ENV=production
PORT=3001
```

### 1.4 Deploy Backend

1. Set root directory to: (empty, will auto-detect)
2. Start command: `cd backend && npm install && npm start`
3. Click "Deploy"
4. Wait for deployment (5-10 minutes)
5. Get the deployed URL from Railway dashboard (looks like: `https://pickleball-backend-production.up.railway.app`)

**Save this URL - you'll need it for Vercel!**

## Step 2: Deploy Frontend to Vercel

### 2.1 Connect GitHub to Vercel

1. Go to https://vercel.com
2. Sign in or create account
3. Click "Import Project"
4. Select "Import Git Repository"
5. Enter: `https://github.com/srihari2761/pickleball-platform`
6. Click "Import"

### 2.2 Configure Build Settings

In Vercel project setup:

**Framework:** Next.js  
**Root Directory:** `./frontend`  
**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Install Command:** `npm install -w frontend`

### 2.3 Add Environment Variables

Add this variable:

```
NEXT_PUBLIC_API_URL=https://pickleball-backend-production.up.railway.app
```

(Replace with your actual Railway backend URL from Step 1.4)

### 2.4 Deploy

1. Click "Deploy"
2. Wait for deployment (3-5 minutes)
3. Get the frontend URL (looks like: `https://pickleball-platform.vercel.app`)

## Step 3: Test the Deployment

### 3.1 Test Frontend

1. Visit: `https://pickleball-platform.vercel.app`
2. You should see the login page
3. Try logging in with:
   - Email: `alice@test.com`
   - Password: `password`

### 3.2 Test Backend API

```bash
# Health check
curl https://pickleball-backend-production.up.railway.app/health

# Should respond:
# {"status":"ok","message":"Pickleball API is running"}
```

### 3.3 Test Full Flow

1. Register a new account on the frontend
2. Create a court (if using court owner role)
3. Search for courts (if using player role)
4. Try booking a court
5. Check that data is persisted in the database

## Deployment Checklist

- [ ] GitHub repo created and code pushed
- [ ] Railway project created
- [ ] PostgreSQL database added to Railway
- [ ] Environment variables set in Railway
- [ ] Backend deployed and health check passes
- [ ] Vercel project created
- [ ] Build settings configured in Vercel
- [ ] Frontend environment variables set in Vercel
- [ ] Frontend deployed successfully
- [ ] Login works with demo credentials
- [ ] API calls from frontend reach backend

## Environment Variables Reference

### Railway (Backend)

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/pickleball` |
| `JWT_SECRET` | Yes | `super-secret-key-123` |
| `NODE_ENV` | No | `production` |
| `PORT` | No | `3001` |

### Vercel (Frontend)

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | `https://pickleball-backend-production.up.railway.app` |

## Troubleshooting

### Frontend can't connect to backend

**Problem:** CORS errors or 404s when calling API  
**Solution:** 
1. Verify `NEXT_PUBLIC_API_URL` is set in Vercel
2. Check Railway backend is running (health check)
3. Ensure Railway `DATABASE_URL` is correct

### Database connection fails

**Problem:** Railway deployment fails with database error  
**Solution:**
1. Verify `DATABASE_URL` is set in Railway env vars
2. Wait 2-3 minutes after adding PostgreSQL
3. Check Railway logs for connection errors

### Login always fails

**Problem:** "Invalid credentials" even with correct password  
**Solution:**
1. Check that database tables were created
2. Verify a user actually exists in the database
3. Check JWT_SECRET is set in Railway env

## Local Development

If you want to test locally before deploying:

```bash
# Install dependencies
npm install

# Create local PostgreSQL database
createdb pickleball

# Set environment variables
export DATABASE_URL="postgresql://user:password@localhost:5432/pickleball"
export JWT_SECRET="local-secret-key"
export NEXT_PUBLIC_API_URL="http://localhost:3001"

# Start development servers
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## Scaling & Next Steps

After deployment, consider:

1. **Domain Setup:** Connect custom domain to Vercel
2. **SSL Certificates:** Vercel handles this automatically
3. **Database Backups:** Railway provides automated backups
4. **Monitoring:** Set up error tracking (Sentry)
5. **Analytics:** Add user analytics (Mixpanel, Posthog)
6. **CDN:** Vercel includes edge caching automatically

---

For more details, see:
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment/vercel)
