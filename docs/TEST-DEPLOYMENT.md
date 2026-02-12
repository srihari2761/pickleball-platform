# Testing the Pickleball Platform Deployment

## Local Testing Instructions

Before deploying to Vercel and Railway, you can test the application locally.

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm

### Setup Local Environment

1. **Create PostgreSQL Database:**
```bash
# On macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb pickleball
```

2. **Clone and Install:**
```bash
cd ~/pickleball-platform
npm install
```

3. **Configure Environment:**
```bash
# Get your PostgreSQL connection string
# On local machine: postgresql://user:password@localhost:5432/pickleball
export DATABASE_URL="postgresql://$(whoami)@localhost:5432/pickleball"
export JWT_SECRET="dev-secret-key-12345"
export NEXT_PUBLIC_API_URL="http://localhost:3001"
export NODE_ENV="development"
```

### Run Locally

```bash
# Terminal 1 - Start Backend
cd backend
npm install
npm start
# Backend runs on http://localhost:3001

# Terminal 2 - Start Frontend
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### Test Flow

1. **Open Frontend:** http://localhost:3000
   - You'll be redirected to /login

2. **Login with Demo Credentials:**
   - Email: `alice@test.com`
   - Password: `password`

3. **Expected Result:**
   - Login successful → redirected to /dashboard
   - See "Available Courts" section
   - See your user profile in top right

4. **Test Features:**
   - View available courts
   - See court details (name, location, surface type)
   - Click "Book Court" button
   - View your bookings (if player role)

5. **Test API Directly:**
```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"password"}'

# List courts
curl http://localhost:3001/courts
```

## Testing Checklist

- [ ] **Database Connection**
  - [ ] PostgreSQL running
  - [ ] `pickleball` database created
  - [ ] Tables auto-created on first run

- [ ] **Backend API**
  - [ ] Health check returns 200
  - [ ] Login endpoint works
  - [ ] Courts endpoint returns data
  - [ ] Bookings endpoint works
  - [ ] WebSocket connections work

- [ ] **Frontend**
  - [ ] Page loads without 404 errors
  - [ ] Login page visible
  - [ ] Form inputs work
  - [ ] Buttons are clickable
  - [ ] API calls succeed
  - [ ] Data displays correctly
  - [ ] Navigation works

- [ ] **Full User Journey**
  - [ ] Register new user
  - [ ] Login with credentials
  - [ ] View dashboard
  - [ ] See courts listed
  - [ ] Make a booking
  - [ ] See booking in "My Bookings"
  - [ ] Logout

## Deployment Testing

After deploying to Vercel and Railway:

### 1. Test Backend on Railway

```bash
# Health check
curl https://pickleball-backend-production.up.railway.app/health

# Expected: {"status":"ok","message":"Pickleball API is running"}
```

### 2. Test Frontend on Vercel

Visit: https://pickleball-platform.vercel.app

- [ ] Page loads (no 404)
- [ ] Can view login page
- [ ] Can enter credentials
- [ ] Can submit login form
- [ ] API calls complete (check Network tab in DevTools)

### 3. Test Login Flow

1. Visit Vercel frontend URL
2. Enter: `alice@test.com` / `password`
3. Click Login
4. Should see dashboard with courts
5. Check browser console for errors
6. Check Network tab for API calls

### 4. Test Full Integration

1. Register new account
2. View available courts
3. Make a booking
4. Verify booking appears in "My Bookings"
5. Check database to confirm data persisted

## Performance Testing

### Frontend (Vercel)
- Check Page Speed Insights: https://pagespeed.web.dev/
- Target: >90 score
- Check Time to First Byte (TTFB)
- Verify images are optimized

### Backend (Railway)
- Check response times: Should be <500ms for API calls
- Monitor CPU usage in Railway dashboard
- Monitor database connections
- Check logs for errors

## Common Issues & Fixes

### "Cannot connect to database"
- [ ] Verify PostgreSQL is running
- [ ] Check DATABASE_URL is correct
- [ ] Check database exists: `psql -l`
- [ ] Check user has correct permissions

### "Login fails with 'Invalid credentials'"
- [ ] Verify user exists in database
- [ ] Check password hashing is correct
- [ ] Verify JWT_SECRET is set
- [ ] Check token is being returned

### "Frontend can't reach backend"
- [ ] Check NEXT_PUBLIC_API_URL is set
- [ ] Verify backend is running and healthy
- [ ] Check CORS settings in backend
- [ ] Check network requests in browser DevTools

### "Page loads but no data appears"
- [ ] Check API response in DevTools Network tab
- [ ] Verify token is being sent in Authorization header
- [ ] Check backend logs for errors
- [ ] Verify database has test data

## Success Criteria

✅ **Deployment is successful when:**

1. Frontend loads at Vercel URL without errors
2. Backend health check returns 200
3. Login works with demo credentials (alice@test.com / password)
4. Dashboard shows list of available courts
5. Can make a booking successfully
6. Booking appears in "My Bookings"
7. No console errors on frontend
8. No 5xx errors in backend logs
9. Database queries complete in <1s
10. Page loads in <3s from anywhere in the world

---

## Test Data

Pre-loaded demo account:
- **Email:** alice@test.com
- **Password:** password
- **Role:** Player
- **Skill Level:** Intermediate

If you need to test court owner functionality, register a new account with role="owner".

## Logs & Debugging

### Frontend Logs (Vercel)
https://vercel.com → Select project → Deployments → View logs

### Backend Logs (Railway)
https://railway.app → Select project → Deployments → View logs

### Local Backend Logs
```bash
# Terminal where backend is running
# Logs will show in real-time
# Look for:
# - Database connection messages
# - API request logs
# - Error stack traces
```

### Local Frontend Logs
```bash
# Browser Console (F12)
# Check for:
# - Network errors (red)
# - CORS errors
# - JavaScript errors
# - API response status codes
```

---

For questions, check the main README.md or DEPLOYMENT.md
