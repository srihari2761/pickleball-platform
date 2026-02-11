import { useRouter } from 'next/router'
import { useEffect } from 'react'

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
    <div>
      {/* Hero */}
      <section className="landing-hero">
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🏓</div>
          <h1>Book Your Court.<br />Find Your Game.</h1>
          <p>The easiest way to reserve pickleball courts, find players, and track your progress. Join the fastest-growing sport in America.</p>
          <div className="landing-hero-buttons">
            <button className="btn btn-primary" onClick={() => router.push('/register')}>
              Get Started Free
            </button>
            <button className="btn btn-outline" onClick={() => router.push('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <h2>Everything You Need to Play</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Book Courts</h3>
            <p>Browse available courts, pick your time slot, and book instantly. No phone calls needed.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Find Players</h3>
            <p>Connect with players at your skill level. Never struggle to find a match again.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Stats</h3>
            <p>Keep track of your games, wins, and skill progression over time.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 PicklePlay. Built for the pickleball community. 🏓</p>
      </footer>
    </div>
  )
}
