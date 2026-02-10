"""
Pickleball Court Tracking Platform - FastAPI Backend
JWT Auth, Court CRUD, Booking System, SQLite/PostgreSQL Ready
"""

import os
from datetime import datetime, timedelta
from typing import Optional, List
import jwt
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext

# ============================================================================
# Configuration
# ============================================================================

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pickleball.db")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ============================================================================
# Database Setup
# ============================================================================

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ============================================================================
# Database Models
# ============================================================================

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_court_owner = Column(Boolean, default=False)
    skill_level = Column(String, default="beginner")  # beginner, intermediate, advanced, professional
    location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Court(Base):
    __tablename__ = "courts"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    surface_type = Column(String)  # hardcourt, cushioned, clay
    number_of_courts = Column(Integer, default=1)
    amenities = Column(String, nullable=True)  # JSON string
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Availability(Base):
    __tablename__ = "availability"
    
    id = Column(Integer, primary_key=True, index=True)
    court_id = Column(Integer, ForeignKey("courts.id"))
    day_of_week = Column(Integer)  # 0=Monday, 6=Sunday
    start_time = Column(String)  # HH:MM format
    end_time = Column(String)
    is_available = Column(Boolean, default=True)

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    court_id = Column(Integer, ForeignKey("courts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime, index=True)
    end_time = Column(DateTime)
    status = Column(String, default="confirmed")  # confirmed, pending, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

class Friendship(Base):
    __tablename__ = "friendships"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    friend_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# ============================================================================
# Pydantic Models (Request/Response)
# ============================================================================

class UserRegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str
    is_court_owner: bool = False
    skill_level: str = "beginner"
    location: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    is_court_owner: bool
    skill_level: str
    location: Optional[str]
    created_at: datetime

class CourtCreateRequest(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    surface_type: str
    number_of_courts: int = 1
    amenities: Optional[str] = None
    description: Optional[str] = None

class CourtResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    address: str
    latitude: float
    longitude: float
    surface_type: str
    number_of_courts: int
    amenities: Optional[str]
    description: Optional[str]
    created_at: datetime

class BookingCreateRequest(BaseModel):
    court_id: int
    start_time: datetime
    duration_minutes: int  # 30, 60, 90, 120

class BookingResponse(BaseModel):
    id: int
    court_id: int
    user_id: int
    start_time: datetime
    end_time: datetime
    status: str
    created_at: datetime

class FriendRequest(BaseModel):
    friend_id: int

# ============================================================================
# Security
# ============================================================================

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = None) -> dict:
    """Extract user from JWT token (from Authorization header)"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"user_id": user_id}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================================================
# FastAPI App
# ============================================================================

app = FastAPI(
    title="Pickleball Court Platform API",
    description="Court discovery, booking, and social features",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        os.getenv("FRONTEND_URL", "https://your-frontend.vercel.app"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Health Check
# ============================================================================

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "pickleball-api"}

# ============================================================================
# Authentication Endpoints
# ============================================================================

@app.post("/api/v1/auth/register", response_model=UserResponse)
def register(user: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name,
        is_court_owner=user.is_court_owner,
        skill_level=user.skill_level,
        location=user.location,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/api/v1/auth/login", response_model=TokenResponse)
def login(credentials: UserLoginRequest, db: Session = Depends(get_db)):
    """Login and get JWT token"""
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
    }

@app.get("/api/v1/auth/me", response_model=UserResponse)
def get_current_user_info(
    token: str = None,
    db: Session = Depends(get_db),
):
    """Get current user info from token"""
    # Extract token from header manually
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user_data = get_current_user(token)
    user = db.query(User).filter(User.id == user_data["user_id"]).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

# ============================================================================
# Court Endpoints (CRUD)
# ============================================================================

@app.get("/api/v1/courts", response_model=List[CourtResponse])
def list_courts(
    skip: int = 0,
    limit: int = 100,
    location: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List all courts with optional location filter"""
    query = db.query(Court)
    
    if location:
        query = query.filter(Court.address.ilike(f"%{location}%"))
    
    courts = query.offset(skip).limit(limit).all()
    return courts

@app.get("/api/v1/courts/{court_id}", response_model=CourtResponse)
def get_court(court_id: int, db: Session = Depends(get_db)):
    """Get a specific court by ID"""
    court = db.query(Court).filter(Court.id == court_id).first()
    
    if not court:
        raise HTTPException(status_code=404, detail="Court not found")
    
    return court

@app.post("/api/v1/courts", response_model=CourtResponse)
def create_court(
    court: CourtCreateRequest,
    token: str = None,
    db: Session = Depends(get_db),
):
    """Create a new court (court owners only)"""
    user_data = get_current_user(token)
    user = db.query(User).filter(User.id == user_data["user_id"]).first()
    
    if not user or not user.is_court_owner:
        raise HTTPException(status_code=403, detail="Only court owners can create courts")
    
    db_court = Court(
        owner_id=user.id,
        name=court.name,
        address=court.address,
        latitude=court.latitude,
        longitude=court.longitude,
        surface_type=court.surface_type,
        number_of_courts=court.number_of_courts,
        amenities=court.amenities,
        description=court.description,
    )
    db.add(db_court)
    db.commit()
    db.refresh(db_court)
    
    return db_court

@app.put("/api/v1/courts/{court_id}", response_model=CourtResponse)
def update_court(
    court_id: int,
    court_update: CourtCreateRequest,
    token: str = None,
    db: Session = Depends(get_db),
):
    """Update a court (owner only)"""
    user_data = get_current_user(token)
    db_court = db.query(Court).filter(Court.id == court_id).first()
    
    if not db_court:
        raise HTTPException(status_code=404, detail="Court not found")
    
    if db_court.owner_id != user_data["user_id"]:
        raise HTTPException(status_code=403, detail="Can only edit your own courts")
    
    db_court.name = court_update.name
    db_court.address = court_update.address
    db_court.latitude = court_update.latitude
    db_court.longitude = court_update.longitude
    db_court.surface_type = court_update.surface_type
    db_court.number_of_courts = court_update.number_of_courts
    db_court.amenities = court_update.amenities
    db_court.description = court_update.description
    
    db.commit()
    db.refresh(db_court)
    
    return db_court

@app.delete("/api/v1/courts/{court_id}")
def delete_court(
    court_id: int,
    token: str = None,
    db: Session = Depends(get_db),
):
    """Delete a court (owner only)"""
    user_data = get_current_user(token)
    db_court = db.query(Court).filter(Court.id == court_id).first()
    
    if not db_court:
        raise HTTPException(status_code=404, detail="Court not found")
    
    if db_court.owner_id != user_data["user_id"]:
        raise HTTPException(status_code=403, detail="Can only delete your own courts")
    
    db.delete(db_court)
    db.commit()
    
    return {"message": "Court deleted successfully"}

# ============================================================================
# Booking Endpoints
# ============================================================================

@app.get("/api/v1/courts/{court_id}/bookings", response_model=List[BookingResponse])
def get_court_bookings(
    court_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Get all bookings for a court"""
    query = db.query(Booking).filter(Booking.court_id == court_id)
    
    if start_date:
        start = datetime.fromisoformat(start_date)
        query = query.filter(Booking.start_time >= start)
    
    if end_date:
        end = datetime.fromisoformat(end_date)
        query = query.filter(Booking.end_time <= end)
    
    bookings = query.all()
    return bookings

@app.post("/api/v1/bookings", response_model=BookingResponse)
def create_booking(
    booking: BookingCreateRequest,
    token: str = None,
    db: Session = Depends(get_db),
):
    """Create a new booking"""
    user_data = get_current_user(token)
    
    # Verify court exists
    court = db.query(Court).filter(Court.id == booking.court_id).first()
    if not court:
        raise HTTPException(status_code=404, detail="Court not found")
    
    # Check for conflicts
    end_time = booking.start_time + timedelta(minutes=booking.duration_minutes)
    conflict = db.query(Booking).filter(
        Booking.court_id == booking.court_id,
        Booking.start_time < end_time,
        Booking.end_time > booking.start_time,
        Booking.status == "confirmed",
    ).first()
    
    if conflict:
        raise HTTPException(status_code=409, detail="Time slot already booked")
    
    # Create booking
    db_booking = Booking(
        court_id=booking.court_id,
        user_id=user_data["user_id"],
        start_time=booking.start_time,
        end_time=end_time,
        status="confirmed",
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    return db_booking

@app.get("/api/v1/bookings/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    """Get a specific booking"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return booking

@app.delete("/api/v1/bookings/{booking_id}")
def cancel_booking(
    booking_id: int,
    token: str = None,
    db: Session = Depends(get_db),
):
    """Cancel a booking"""
    user_data = get_current_user(token)
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.user_id != user_data["user_id"]:
        raise HTTPException(status_code=403, detail="Can only cancel your own bookings")
    
    booking.status = "cancelled"
    db.commit()
    
    return {"message": "Booking cancelled"}

# ============================================================================
# Friend Endpoints
# ============================================================================

@app.post("/api/v1/friends/{friend_id}")
def add_friend(
    friend_id: int,
    token: str = None,
    db: Session = Depends(get_db),
):
    """Add a friend"""
    user_data = get_current_user(token)
    
    if friend_id == user_data["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot add yourself as friend")
    
    # Check if friend exists
    friend = db.query(User).filter(User.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    
    # Check if already friends
    existing = db.query(Friendship).filter(
        (Friendship.user_id == user_data["user_id"]) & (Friendship.friend_id == friend_id)
    ).first()
    
    if existing:
        raise HTTPException(status_code=409, detail="Already friends")
    
    friendship = Friendship(user_id=user_data["user_id"], friend_id=friend_id)
    db.add(friendship)
    db.commit()
    
    return {"message": "Friend added"}

@app.get("/api/v1/friends", response_model=List[UserResponse])
def get_friends(
    token: str = None,
    db: Session = Depends(get_db),
):
    """Get list of friends"""
    user_data = get_current_user(token)
    
    friendships = db.query(Friendship).filter(Friendship.user_id == user_data["user_id"]).all()
    friends = [db.query(User).filter(User.id == f.friend_id).first() for f in friendships]
    
    return [f for f in friends if f]

@app.delete("/api/v1/friends/{friend_id}")
def remove_friend(
    friend_id: int,
    token: str = None,
    db: Session = Depends(get_db),
):
    """Remove a friend"""
    user_data = get_current_user(token)
    
    friendship = db.query(Friendship).filter(
        (Friendship.user_id == user_data["user_id"]) & (Friendship.friend_id == friend_id)
    ).first()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")
    
    db.delete(friendship)
    db.commit()
    
    return {"message": "Friend removed"}

# ============================================================================
# Root
# ============================================================================

@app.get("/")
def read_root():
    return {
        "message": "Pickleball Court Tracking Platform API",
        "docs": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
