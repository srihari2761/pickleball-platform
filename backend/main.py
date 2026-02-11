"""
Pickleball Platform API - FastAPI Backend
"""
import os
from datetime import datetime, timedelta
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import bcrypt as _bcrypt
# Fix passlib + bcrypt>=4.1 compatibility
if not hasattr(_bcrypt, '__about__'):
    class _About:
        __version__ = _bcrypt.__version__
    _bcrypt.__about__ = _About()

from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pickleball.db")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    name = Column(String(255))
    role = Column(String(50))
    skill_level = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)


class Court(Base):
    __tablename__ = "courts"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255))
    location = Column(String(255))
    surface_type = Column(String(100))
    amenities = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    court_id = Column(Integer, ForeignKey("courts.id"))
    player_id = Column(Integer, ForeignKey("users.id"))
    time_slot = Column(String(100))
    status = Column(String(50), default="confirmed")
    created_at = Column(DateTime, default=datetime.utcnow)


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


# Initialize database
def init_db():
    """Create all database tables and seed demo data"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables initialized")
    except Exception as e:
        print(f"⚠️ Database initialization warning: {str(e)}")
        print("ℹ️ App will start, but database operations may fail until DATABASE_URL is properly configured")
    
    # Seed demo data (separate try block so table init errors don't block seeding)
    try:
        db = SessionLocal()
        try:
            demo_user = db.query(User).filter(User.email == "alice@test.com").first()
            if not demo_user:
                # Demo users
                alice = User(email="alice@test.com", password=hash_password("password"), name="Alice Demo", role="player", skill_level="intermediate")
                bob = User(email="bob@test.com", password=hash_password("password"), name="Bob Smith", role="player", skill_level="beginner")
                carol = User(email="carol@test.com", password=hash_password("password"), name="Carol Owner", role="owner", skill_level="advanced")
                db.add_all([alice, bob, carol])
                db.flush()
                
                # Demo courts
                courts = [
                    Court(owner_id=carol.id, name="Sunset Pickleball Club", location="123 Sunset Blvd, San Jose, CA", surface_type="Concrete", amenities="Lights, Restrooms, Water fountain"),
                    Court(owner_id=carol.id, name="Bay Area Courts", location="456 Marina Dr, San Francisco, CA", surface_type="Asphalt", amenities="Covered, Pro shop, Parking"),
                    Court(owner_id=carol.id, name="Golden Gate Pickleball", location="789 Park Ave, Oakland, CA", surface_type="Sport Court", amenities="Indoor, Climate controlled, Locker rooms"),
                    Court(owner_id=carol.id, name="Peninsula Paddle Center", location="321 El Camino Real, Palo Alto, CA", surface_type="Concrete", amenities="Lights, Seating, Vending machines"),
                    Court(owner_id=carol.id, name="South Bay Smash Courts", location="555 Stevens Creek, Cupertino, CA", surface_type="Sport Court", amenities="Outdoor, Shaded seating, Free parking"),
                ]
                db.add_all(courts)
                db.commit()
                print("✅ Demo data seeded: 3 users, 5 courts")
        finally:
            db.close()
    except Exception as e:
        print(f"⚠️ Seed warning: {str(e)}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown"""
    # Startup
    init_db()
    yield
    # Shutdown


# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    skill_level: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class CourtCreate(BaseModel):
    name: str
    location: str
    surface_type: str
    amenities: Optional[str] = None


class CourtResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    location: str
    surface_type: str
    amenities: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class BookingCreate(BaseModel):
    court_id: int
    time_slot: str


class BookingResponse(BaseModel):
    id: int
    court_id: int
    player_id: int
    time_slot: str
    status: str
    court_name: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Initialize FastAPI app
app = FastAPI(
    title="Pickleball Platform API",
    description="Connect pickleball players with courts",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint (for Railway/Docker health checks)
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "pickleball-api"}


# Dependency: Database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Utility Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """Verify JWT token and return current user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


# Auth Routes
@app.post("/auth/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    db_user = User(
        email=user_data.email,
        password=hashed_password,
        name=user_data.name,
        role=user_data.role,
        skill_level=user_data.skill_level,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate token
    access_token = create_access_token(
        data={"sub": str(db_user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(db_user)
    }


@app.post("/auth/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """User login"""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Generate token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }


# Courts Routes
@app.get("/courts", response_model=list[CourtResponse])
def get_courts(db: Session = Depends(get_db)):
    """Get all courts"""
    courts = db.query(Court).order_by(Court.created_at.desc()).all()
    return courts


@app.post("/courts", response_model=CourtResponse)
def create_court(
    court_data: CourtCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new court (requires authentication)"""
    
    db_court = Court(
        owner_id=current_user.id,
        name=court_data.name,
        location=court_data.location,
        surface_type=court_data.surface_type,
        amenities=court_data.amenities,
    )
    db.add(db_court)
    db.commit()
    db.refresh(db_court)
    
    return db_court


# Bookings Routes
@app.get("/bookings", response_model=list[BookingResponse])
def get_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's bookings (requires authentication)"""
    
    bookings = db.query(Booking).filter(
        Booking.player_id == current_user.id
    ).order_by(Booking.created_at.desc()).all()
    
    # Add court details
    result = []
    for booking in bookings:
        court = db.query(Court).filter(Court.id == booking.court_id).first()
        booking_dict = BookingResponse.model_validate(booking)
        if court:
            booking_dict.court_name = court.name
            booking_dict.location = court.location
        result.append(booking_dict)
    
    return result


@app.post("/bookings", response_model=BookingResponse)
def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new booking (requires authentication)"""
    
    db_booking = Booking(
        court_id=booking_data.court_id,
        player_id=current_user.id,
        time_slot=booking_data.time_slot,
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    # Get court details
    court = db.query(Court).filter(Court.id == db_booking.court_id).first()
    booking_response = BookingResponse.model_validate(db_booking)
    if court:
        booking_response.court_name = court.name
        booking_response.location = court.location
    
    return booking_response


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("NODE_ENV") != "production"
    )
