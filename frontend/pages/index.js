import { useRouter } from 'next/router'
import { useEffect } from 'react'

const FEATURED_COURTS = [
  {
    id: 1,
    name: 'Sunset Recreation Center',
    location: 'San Francisco, CA',
    surface: 'Cushioned',
    courts: 6,
    rating: 4.8,
    reviews: 124,
    amenities: ['Lights', 'Restrooms', 'Water Fountain', 'Parking'],
    image: '🌅',
  },
  {
    id: 2,
    name: 'Greenfield Sports Complex',
    location: 'Austin, TX',
    surface: 'Concrete',
    courts: 8,
    rating: 4.6,
    reviews: 89,
    amenities: ['Lights', 'Pro Shop', 'Seating', 'Parking'],
    image: '🏟️',
  },
  {
    id: 3,
    name: 'Lakeside Pickleball Club',
    location: 'Denver, CO',
    surface: 'Asphalt',
    courts: 4,
    rating: 4.9,
    reviews: 203,
    amenities: ['Indoor', 'Lights', 'Locker Rooms', 'Cafe'],
    image: '🏔️',
  },
]

function StarRating({ rating }) {
  const full = Math.floor(rating)
  const partial = rating - full
  return (
    <span className="star-rating" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(full)}
      {partial >= 0.5 ? '½' : ''}
      <span style={{ opacity: 0.3 }}>{'★'.repeat(5 - full - (partial >= 0.5 ? 1 : 0))}</span>
    </span>
  )
}

export default function Home({ user, loading }) {
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [loading, user])

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /> Loading...</div>
  }

  if (user) return null

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="navbar-logo">🏓 PickleBook</div>
          <div className="landing-nav-links">
            <button className="navbar-link" onClick={() => router.push('/courts')}>Courts</button>
            <button className="navbar-link" onClick={() => router.push('/login')}>Sign In</button>
            <button className="btn btn-primary btn-sm" style={{ borderRadius: 20 }} onClick={() => router.push('/register')}>
              Sign Up Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="hero-badge">🏓 The #1 Pickleball Court Booking Platform</div>
          <h1>Book Your Court.<br />Find Your Game.</h1>
          <p>
            PickleBook makes it effortless to discover nearby courts, reserve your
            favorite time slots, and connect with players at your level. Join
            thousands of players in the fastest-growing sport in America.
          </p>
          <div className="landing-hero-buttons">
            <button className="btn btn-primary" onClick={() => router.push('/register')}>
              Sign Up Free →
            </button>
            <button className="btn btn-outline" onClick={() => router.push('/courts')}>
              Find Courts
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">500+</span>
              <span className="hero-stat-label">Courts Listed</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">10k+</span>
              <span className="hero-stat-label">Active Players</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">50k+</span>
              <span className="hero-stat-label">Bookings Made</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <h2>Everything You Need to Play</h2>
        <p className="section-subtitle">From finding courts to tracking your game — PickleBook has you covered.</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Book Courts Instantly</h3>
            <p>Browse available courts near you, pick your time slot, and book in seconds. No phone calls, no hassle.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Find Players</h3>
            <p>Connect with players at your skill level. Open games, round-robins, and league play — all in one place.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Your Progress</h3>
            <p>Log your matches, track wins and losses, and watch your rating climb as you improve your game.</p>
          </div>
        </div>
      </section>

      {/* Featured Courts Section */}
      <section className="landing-courts">
        <div className="landing-courts-inner">
          <h2>Featured Courts</h2>
          <p className="section-subtitle">Top-rated courts loved by the PickleBook community.</p>
          <div className="courts-grid">
            {FEATURED_COURTS.map((court) => (
              <div key={court.id} className="court-card" onClick={() => router.push('/courts')} style={{ cursor: 'pointer' }}>
                <div className="court-card-header">
                  <span style={{ fontSize: '1.5rem' }}>{court.image}</span>
                  <span className="court-number">{court.courts} Courts</span>
                </div>
                <div className="court-card-body">
                  <div className="court-card-name">{court.name}</div>
                  <div className="court-card-location">📍 {court.location}</div>
                  <div className="surface-badge">{court.surface}</div>
                  <div className="court-rating">
                    <StarRating rating={court.rating} />
                    <span className="rating-num">{court.rating}</span>
                    <span className="rating-count">({court.reviews} reviews)</span>
                  </div>
                  <div className="amenities-list">
                    {court.amenities.map((a) => (
                      <span key={a} className="amenity-tag">{a}</span>
                    ))}
                  </div>
                </div>
                <div className="court-card-footer">
                  <button className="btn btn-primary btn-full btn-sm">View Court & Book →</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button className="btn btn-outline btn-lg" onClick={() => router.push('/courts')}>
              Browse All Courts →
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how">
        <h2>How It Works</h2>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-step-num">1</div>
            <h3>Create Your Account</h3>
            <p>Sign up in 30 seconds. It&apos;s free — no credit card required.</p>
          </div>
          <div className="how-step-arrow">→</div>
          <div className="how-step">
            <div className="how-step-num">2</div>
            <h3>Find a Court</h3>
            <p>Search by location, surface type, or amenities to find your perfect court.</p>
          </div>
          <div className="how-step-arrow">→</div>
          <div className="how-step">
            <div className="how-step-num">3</div>
            <h3>Book & Play</h3>
            <p>Reserve your time slot instantly and show up ready to play.</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="landing-cta">
        <h2>Ready to Hit the Court?</h2>
        <p>Join the PickleBook community and start booking courts today.</p>
        <div className="landing-hero-buttons">
          <button className="btn btn-primary" onClick={() => router.push('/register')}>
            Sign Up Free →
          </button>
          <button className="btn btn-outline" onClick={() => router.push('/courts')}>
            Find Courts Near You
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer-full">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">🏓 PickleBook</div>
            <p>The easiest way to book pickleball courts and find players in your area.</p>
          </div>
          <div className="footer-links-group">
            <h4>Product</h4>
            <a href="/courts">Find Courts</a>
            <a href="/register">Sign Up</a>
            <a href="/login">Sign In</a>
          </div>
          <div className="footer-links-group">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
          </div>
          <div className="footer-links-group">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Contact Us</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 PickleBook. All rights reserved. Built for the pickleball community. 🏓</p>
        </div>
      </footer>
    </div>
  )
}
