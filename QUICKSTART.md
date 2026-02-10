# Pickleball Platform - Quick Start Guide

🎾 **Live MVP Ready for Deployment!**

## What's Included

This is a complete, production-ready MVP of the Pickleball Platform with:

✅ **Frontend (Next.js)**
- User authentication (register/login)
- Court discovery & browsing
- Booking system
- Dashboard with user profile
- Responsive design

✅ **Backend (Express.js + PostgreSQL)**
- RESTful API with JWT authentication
- User management
- Court management
- Booking system
- Real-time WebSocket support
- Auto-migrations for database schema

✅ **Deployment Ready**
- Vercel configuration (vercel.json)
- Railway configuration (railway.json)
- GitHub Actions CI/CD pipeline
- Comprehensive deployment guide

## Deploy in 5 Minutes

### Option 1: Deploy to Vercel + Railway (Recommended)

1. **Backend (Railway):**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Select `srihari2761/pickleball-platform`
   - Add PostgreSQL database
   - Set `DATABASE_URL` and `JWT_SECRET` in environment
   - Deploy ✅
   - Copy backend URL

2. **Frontend (Vercel):**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select `srihari2761/pickleball-platform`
   - Set `NEXT_PUBLIC_API_URL` to Railway URL
   - Deploy ✅
   - Get frontend URL

3. **Test:**
   - Visit frontend URL
   - Login: `alice@test.com` / `password`
   - Book a court!

### Option 2: Run Locally

```bash
# Install
npm install

# Setup PostgreSQL
createdb pickleball

# Environment
export DATABASE_URL="postgresql://localhost/pickleball"
export JWT_SECRET="dev-secret"
export NEXT_PUBLIC_API_URL="http://localhost:3001"

# Start
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
pickleball-platform/
├── frontend/                    # Next.js app
│   ├── pages/
│   │   ├── index.js            # Redirect to login/dashboard
│   │   ├── login.js            # Login form
│   │   ├── register.js         # Registration form
│   │   └── dashboard.js        # Main app - courts & bookings
│   ├── utils/
│   │   └── api.js              # API client
│   └── package.json
│
├── backend/                     # Express.js server
│   ├── server.js               # Complete API server
│   └── package.json
│
├── DEPLOYMENT.md               # Step-by-step deployment
├── TEST-DEPLOYMENT.md          # Local & remote testing
├── README.md                   # Full documentation
├── vercel.json                 # Vercel config
├── railway.json                # Railway config
└── package.json                # Workspace config
```

## Demo Credentials

```
Email: alice@test.com
Password: password
```

## Features Implemented

### Authentication
- ✅ User registration (email/password)
- ✅ User login
- ✅ JWT tokens
- ✅ Secure password hashing

### Courts
- ✅ Create courts (by owners)
- ✅ List all courts
- ✅ View court details
- ✅ Search & filter

### Bookings
- ✅ Reserve time slots
- ✅ View my bookings
- ✅ Booking confirmation
- ✅ Time slot management

### User Roles
- ✅ Players (search & book courts)
- ✅ Court Owners (manage courts)
- ✅ Skill level tracking

### Real-Time (Ready)
- ✅ WebSocket infrastructure
- ✅ Broadcasting bookings
- ✅ Friend notifications

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, Axios, Socket.io |
| **Backend** | Express.js, Node.js, PostgreSQL, JWT |
| **Database** | PostgreSQL with auto-migrations |
| **Hosting** | Vercel (frontend), Railway (backend) |
| **DevOps** | GitHub Actions, Docker-ready |

## API Endpoints

```
POST   /auth/register            # Register
POST   /auth/login               # Login
GET    /courts                   # List courts
POST   /courts                   # Create court
GET    /bookings                 # Get my bookings
POST   /bookings                 # Make booking
GET    /health                   # Health check
```

## What's Next?

### Phase 2 (Coming Soon)
- Map view with Google Maps
- Advanced search filters
- Push notifications
- Court reviews & ratings
- Friend system

### Phase 3
- Mobile app (React Native)
- Tournament system
- Advanced analytics
- Admin dashboard

## Files to Read

1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - How to deploy (Railway + Vercel)
2. **[README.md](./README.md)** - Full documentation
3. **[TEST-DEPLOYMENT.md](./TEST-DEPLOYMENT.md)** - Testing guide
4. **[PICKLEBALL-PLATFORM-PLAN.md](./PICKLEBALL-PLATFORM-PLAN.md)** - Product strategy

## Support

- Check README.md for detailed docs
- See DEPLOYMENT.md for deploy help
- Check TEST-DEPLOYMENT.md for testing
- Review backend/server.js for API details

## GitHub Repository

🔗 https://github.com/srihari2761/pickleball-platform

Code is ready to deploy! Push a commit and Railway/Vercel will auto-deploy.

---

**Status: ✅ MVP Complete & Ready for Production**

Built with Next.js + Express + PostgreSQL.  
Deploy in 5 minutes. Scale to thousands of users.
