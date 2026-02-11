import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '../../utils/api'
import Navbar from '../../components/Navbar'
import TimeSlotGrid from '../../components/TimeSlotGrid'

export default function CourtDetail({ user, loading }) {
  const router = useRouter()
  const { id } = router.query
  const [court, setCourt] = useState(null)
  const [bookings, setBookings] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user])

  useEffect(() => {
    if (id && user) {
      Promise.all([
        api.get('/courts'),
        api.get('/bookings'),
      ]).then(([courtsRes, bookingsRes]) => {
        const found = courtsRes.data.find((c) => String(c.id) === String(id))
        setCourt(found || null)
        setBookings(bookingsRes.data)
      }).catch(console.error).finally(() => setDataLoading(false))
    }
  }, [id, user])

  const handleBook = async (courtId, slot) => {
    try {
      await api.post('/bookings', { court_id: courtId, time_slot: slot })
      const bookingsRes = await api.get('/bookings')
      setBookings(bookingsRes.data)
    } catch (error) {
      alert(error.response?.data?.detail || 'Booking failed')
    }
  }

  if (loading || dataLoading) {
    return <div className="loading-screen"><div className="spinner" /> Loading...</div>
  }
  if (!user) return null
  if (!court) {
    return (
      <div>
        <Navbar user={user} />
        <div className="page-container">
          <div className="empty-state">
            <div className="icon">🤷</div>
            <h3>Court Not Found</h3>
            <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>Back to Courts</button>
          </div>
        </div>
      </div>
    )
  }

  const amenities = court.amenities
    ? (typeof court.amenities === 'string' ? court.amenities.split(',') : court.amenities)
    : []

  return (
    <div>
      <Navbar user={user} />

      <div className="court-detail-header">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <button className="btn btn-outline" style={{ marginBottom: 16, borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}
            onClick={() => router.push('/dashboard')}>← Back to Courts</button>
          <h1>{court.name}</h1>
          <p>📍 {court.location}</p>
        </div>
      </div>

      <div className="court-detail-content">
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="photo-placeholder">📷 Court Photo Coming Soon</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <span className="surface-badge">{court.surface_type || 'Standard'}</span>
            {amenities.map((a, i) => (
              <span key={i} className="amenity-tag">{a.trim()}</span>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, color: '#2D5016' }}>Book a Time Slot</h3>
          <TimeSlotGrid court={court} bookings={bookings} onBook={handleBook} />
        </div>

        <div className="reviews-section">
          <h3>Reviews</h3>
          <div className="review-placeholder">No reviews yet. Be the first to play here!</div>
        </div>
      </div>
    </div>
  )
}
