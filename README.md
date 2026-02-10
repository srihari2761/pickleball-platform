# Pickleball Court Tracking Platform

A full-stack application for discovering, booking, and managing pickleball courts.

## Tech Stack

**Backend:** FastAPI (Python) with JWT authentication, SQLAlchemy ORM, and SQLite/PostgreSQL  
**Frontend:** Next.js (React) with Zustand for state management  
**Deployment:** Railway (backend) + Vercel (frontend)

## Features

✅ User authentication (registration, login with JWT)  
✅ Court CRUD operations (create, read, update, delete)  
✅ Booking system with time slot management  
✅ Friend connections  
✅ Location-based court search  
✅ CORS enabled for frontend integration  

## Project Structure

```
pickleball-platform/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── pages/               # Next.js pages
│   ├── components/          # React components
│   ├── hooks/               # Custom hooks (useAuthStore)
│   ├── styles/              # CSS files
│   ├── package.json         # Node dependencies
│   ├── next.config.js       # Next.js config
│   ├── .env.local           # Dev environment
│   └── .env.production      # Prod environment
├── Procfile                 # Railway deployment
├── railway.toml             # Railway config
├── requirements.txt         # Root requirements
└── README.md               # This file
```

## Local Development

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on: `http://localhost:8000`  
API Docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user (requires token)

### Courts
- `GET /api/v1/courts` - List all courts (with location filter)
- `GET /api/v1/courts/{court_id}` - Get court details
- `POST /api/v1/courts` - Create new court (court owners only)
- `PUT /api/v1/courts/{court_id}` - Update court (owner only)
- `DELETE /api/v1/courts/{court_id}` - Delete court (owner only)

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/{booking_id}` - Get booking details
- `GET /api/v1/courts/{court_id}/bookings` - Get court's bookings
- `DELETE /api/v1/bookings/{booking_id}` - Cancel booking

### Friends
- `POST /api/v1/friends/{friend_id}` - Add friend
- `GET /api/v1/friends` - List friends
- `DELETE /api/v1/friends/{friend_id}` - Remove friend

## Environment Variables

### Backend (.env in root)
```
DATABASE_URL=sqlite:///./pickleball.db  # or postgresql://...
SECRET_KEY=your-secret-key-here
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Frontend Production (.env.production)
```
NEXT_PUBLIC_API_URL=https://pickleball-api.railway.app
```

## Deployment

### Backend on Railway

1. Push code to GitHub
2. Connect GitHub repo to Railway
3. Set environment variables:
   - `DATABASE_URL` (Railway provides PostgreSQL)
   - `SECRET_KEY` (generate a strong key)
   - `FRONTEND_URL` (your Vercel frontend URL)
4. Deploy automatically on push

### Frontend on Vercel

1. Push code to GitHub (same repo or separate)
2. Import project to Vercel
3. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL
4. Deploy automatically on push

## Testing API

### Register User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player@example.com",
    "username": "player1",
    "password": "securepass123",
    "full_name": "John Player",
    "is_court_owner": false,
    "skill_level": "intermediate"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player@example.com",
    "password": "securepass123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### List Courts
```bash
curl http://localhost:8000/api/v1/courts
```

### Search Courts by Location
```bash
curl "http://localhost:8000/api/v1/courts?location=San%20Francisco"
```

## Database Schema

### Users
- `id` - Primary key
- `email` - Unique email
- `username` - Unique username
- `hashed_password` - Bcrypt hashed password
- `full_name` - User's full name
- `is_court_owner` - Boolean for owner role
- `skill_level` - beginner|intermediate|advanced|professional
- `location` - Preferred location
- `created_at` - Timestamp

### Courts
- `id` - Primary key
- `owner_id` - Foreign key to User
- `name` - Court name
- `address` - Physical address
- `latitude`, `longitude` - Coordinates
- `surface_type` - hardcourt|cushioned|clay
- `number_of_courts` - Count of courts
- `amenities` - JSON string
- `description` - Court description
- `created_at` - Timestamp

### Bookings
- `id` - Primary key
- `court_id` - Foreign key to Court
- `user_id` - Foreign key to User
- `start_time` - Booking start
- `end_time` - Booking end
- `status` - confirmed|pending|cancelled
- `created_at` - Timestamp

### Friendships
- `id` - Primary key
- `user_id` - Foreign key to User
- `friend_id` - Foreign key to User (friend)
- `created_at` - Timestamp

## Next Steps (Phase 2+)

🎯 **Features to implement:**
- Map view with court locations (Google Maps API)
- Real-time notifications (WebSocket)
- Court reviews and ratings (5-star system)
- Payment processing (Stripe integration)
- Push notifications (browser & mobile)
- Skill-based player matching
- Tournament scheduling

## Contributing

1. Create a feature branch
2. Make changes
3. Push to GitHub
4. Create a pull request

## License

MIT

## Support

For issues or questions, open a GitHub issue or contact the development team.

---

**Last Updated:** 2026-02-10  
**Status:** MVP Ready for Deployment ✅
