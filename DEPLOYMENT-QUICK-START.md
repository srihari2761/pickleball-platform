# Railway Deployment - Quick Start Guide

## 5-Minute Setup for Railway

### Prerequisites
- GitHub account with code pushed
- Railway account (free at railway.app)
- This repo cloned locally

### Step 1: Create Railway Project (1 min)

```bash
# Login to railway.app
# Click: New Project
# Select: PostgreSQL (Add-on)
# Copy the DATABASE_URL shown in the environment
```

### Step 2: Deploy PostgreSQL (Auto-managed)

```
✅ Railway automatically creates and manages PostgreSQL
✅ DATABASE_URL available immediately in environment
```

### Step 3: Deploy Backend Service (2 min)

**In Railway Dashboard:**

```
1. Click: New → GitHub Repo
2. Select: pickleball-platform
3. Name it: pickleball-backend
4. Railway auto-detects Dockerfile in /backend
5. Click: Deploy

Environment Variables (Add these):
DATABASE_URL=<copy from postgres service>
JWT_SECRET=super-secret-key-12345
PORT=8000
NODE_ENV=production
```

**Wait for deployment to complete** (~2-3 minutes)

**Test backend**:
```bash
# Get the backend URL from Railway dashboard
# It will be something like: pickleball-backend-production.up.railway.app

curl https://pickleball-backend-production.up.railway.app/health
# Should return: {"status":"ok","message":"Pickleball API is running"}
```

### Step 4: Deploy Frontend Service (2 min)

**In Railway Dashboard:**

```
1. Click: New → GitHub Repo
2. Select: pickleball-platform
3. Name it: pickleball-frontend
4. Railway auto-detects Dockerfile in /frontend
5. Set Environment Variables:
   NEXT_PUBLIC_API_URL=https://pickleball-backend-production.up.railway.app
   NODE_ENV=production
   PORT=3000
6. Click: Deploy

Wait for deployment (~2-3 minutes)
```

### Step 5: Verify Services

**In Railway Dashboard:**

1. Click on pickleball-frontend service
2. Open the generated URL: `https://pickleball-frontend-...up.railway.app`
3. You should see the Pickleball Platform home page

## Testing the Deployment

### 1. Register User

```bash
BACKEND_URL="https://pickleball-backend-production.up.railway.app"

curl -X POST $BACKEND_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123",
    "name": "Alice",
    "role": "player",
    "skill_level": "intermediate"
  }'
```

**Response**:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice",
    "role": "player"
  }
}
```

### 2. List Courts

```bash
curl -X GET $BACKEND_URL/courts
```

Should return an empty array `[]` on fresh setup.

### 3. Test in Browser

1. Go to `https://pickleball-frontend-...up.railway.app`
2. Click "Register here"
3. Create an account
4. Login with that account
5. See dashboard

## Troubleshooting

### Backend service fails to start

**Check logs**:
```
Railway Dashboard → pickleball-backend → Deployments → Latest → Logs
```

**Common issues**:
```
Error: "DATABASE_URL not found"
→ Add DATABASE_URL to environment variables

Error: "Port 8000 not listening"
→ Check main.py exists and requirements.txt is correct
→ Restart the service
```

**Solution**: 
```
1. Click service
2. → Environment → Add DATABASE_URL
3. → Deploy → Redeploy or Restart
```

### Frontend can't reach backend

**Error**: 404 or CORS errors in browser console

**Check**:
```
1. Is NEXT_PUBLIC_API_URL set in frontend environment?
2. Is it the FULL HTTPS URL? (not localhost or /api/)
3. Is backend service healthy?
   curl https://backend-url/health
```

**Fix**:
```
Frontend service → Environment → Edit NEXT_PUBLIC_API_URL
Should be: https://pickleball-backend-production.up.railway.app
(Not http://, must be https://)
```

### Database not initializing

**Error**: 500 errors when calling API endpoints

**Cause**: Tables not created yet

**Solution**: 
```
1. Check PostgreSQL service is running
   Railway → postgres service → should be "Active"
2. Check DATABASE_URL in backend environment
3. Backend automatically creates tables on first request
4. Try hitting /health endpoint again
```

## Service Architecture

```
┌─────────────────────────────────────────────────────┐
│            Railway Project                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend                Backend              DB    │
│  (Next.js)             (FastAPI)          (PostgreSQL)
│  Port 3000             Port 8000           Port 5432
│                                                     │
│  https://...frontend   https://...backend          │
│         ▼                  ▼                        │
│  [Node.js Runtime]  [Python Runtime]  [Managed DB] │
│                                                     │
│  Calls API via     Receives requests    Tables:    │
│  NEXT_PUBLIC_API_  from frontend       users,      │
│  URL env var       Connects to DB      courts,     │
│                                         bookings,  │
│                                         messages   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Making Changes After Deployment

### Change Frontend Code

```bash
# 1. Make changes in frontend/
git add .
git commit -m "Feature: Add courts list"

# 2. Push to GitHub
git push origin master

# 3. Railway auto-redeploys
# Check: Railway → Frontend → Deployments
```

### Change Backend Code

```bash
# 1. Make changes in backend/main.py
git add .
git commit -m "Feature: Add new endpoint"

# 2. Push to GitHub
git push origin master

# 3. Railway auto-redeploys
# Check: Railway → Backend → Deployments
```

### Change Environment Variables

```
Railroad Dashboard → Service → Environment → Edit Variable
→ Update value → Save
→ Service auto-restarts with new variable
```

## Environment Variables Summary

### Backend Service
| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` | Database connection |
| `JWT_SECRET` | `super-secret-key` | JWT signing key |
| `PORT` | `8000` | Service port |
| `NODE_ENV` | `production` | Environment mode |

### Frontend Service
| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | `https://backend.up.railway.app` | Backend API location |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Service port |

### PostgreSQL Service
| Variable | Auto-set | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✓ Yes | Full connection string |
| `POSTGRES_PASSWORD` | ✓ Yes | Database password |
| `POSTGRES_USER` | ✓ Yes | Database user |

## Cost Estimation

```
PostgreSQL:  $15/month (managed database)
Frontend:     $5/month (1 replica)
Backend:      $5/month (1 replica)
─────────────────────
Total:       $25/month (minimum)
```

Free tier covers up to:
- 500 hours of runtime
- 100 GB of egress
- Check railway.app pricing for details

## Next Steps

1. ✅ Deploy both services
2. ✅ Test endpoints
3. 📱 Implement more features
4. 📊 Monitor performance in Railway dashboard
5. 🔒 Strengthen JWT_SECRET in production
6. 🚀 Set up custom domain

## Support

**If something goes wrong**:

1. **Check Railway Logs**:
   ```
   Service → Deployments → Latest → Logs
   Scroll down for error messages
   ```

2. **Check Environment Variables**:
   ```
   Service → Environment → Verify all vars are set
   ```

3. **Test Backend Health**:
   ```bash
   curl https://backend-url/health
   ```

4. **Check GitHub Workflow** (if auto-deploy enabled):
   ```
   GitHub → Actions → See if deploy was triggered
   ```

5. **Restart Services**:
   ```
   Railway → Service → Deployments → Restart
   ```

## What's Next?

- [ ] Add real database migrations (Alembic)
- [ ] Implement WebSocket for live updates
- [ ] Add email notifications
- [ ] Set up monitoring and alerting
- [ ] Configure custom domain
- [ ] Enable HTTPS everywhere
- [ ] Add API rate limiting
- [ ] Implement caching layer (Redis)

## 🎉 You're Live!

Your Pickleball Platform is now running on Railway!

- **Frontend**: https://pickleball-frontend-...up.railway.app
- **Backend**: https://pickleball-backend-...up.railway.app
- **Database**: PostgreSQL managed by Railway

**Share the frontend URL with friends to use the app!**
