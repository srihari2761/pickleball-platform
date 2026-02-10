# 🎾 Pickleball Platform

Connect pickleball players with available courts. Find courts, book time slots, and grow the community!

## Features

- **User Authentication**: Email/password registration and login
- **Court Discovery**: Browse and search available courts
- **Court Management**: Court owners can manage their courts
- **Booking System**: Players can reserve time slots
- **Friend System**: Connect with other players
- **Messaging**: Direct messaging between friends
- **Real-time Updates**: WebSocket-based live notifications

## Tech Stack

- **Frontend**: Next.js, React, Axios
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Deployment**: Vercel (frontend), Railway (backend)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/pickleball-platform.git
cd pickleball-platform
```

2. Install dependencies:
```bash
# Install all dependencies
npm install

# Or install workspace dependencies separately
npm install -w frontend
npm install -w backend
```

3. Set up environment variables:
```bash
# Copy example and update with your values
cp .env.example .env.local
```

4. Create database:
```bash
createdb pickleball
# Update DATABASE_URL in .env with your PostgreSQL connection string
```

5. Start development servers:
```bash
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## Project Structure

```
pickleball-platform/
├── frontend/              # Next.js frontend app
│   ├── pages/            # Page components
│   ├── components/       # Reusable components
│   ├── utils/            # Utilities (API client, etc)
│   └── package.json
├── backend/              # Express.js backend server
│   ├── server.js         # Main server file
│   └── package.json
├── database/             # Database schema
├── .env.example          # Environment variables template
└── package.json          # Root workspace configuration
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Courts
- `GET /courts` - List all courts
- `POST /courts` - Create new court (authenticated)

### Bookings
- `GET /bookings` - Get user's bookings (authenticated)
- `POST /bookings` - Create new booking (authenticated)

### Health
- `GET /health` - API health check

## Demo Credentials

**Email**: alice@test.com  
**Password**: password

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Railway backend URL
4. Deploy

### Backend (Railway)

1. Push code to GitHub
2. Create Railway project from GitHub repo
3. Add PostgreSQL database
4. Set environment variables:
   - `DATABASE_URL`: Railway PostgreSQL URL
   - `JWT_SECRET`: Random secret key
5. Deploy

## Features Roadmap

### Phase 1 (MVP) ✅
- User authentication
- Court listing & discovery
- Basic booking system
- Simple messaging

### Phase 2 (Growth)
- Map view with Google Maps
- Advanced filters & search
- Push notifications
- Court reviews & ratings

### Phase 3 (Scale)
- Mobile app
- Tournament system
- Advanced analytics
- Admin dashboard

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an GitHub issue or contact support.

---

Built with ❤️ for pickleball enthusiasts
