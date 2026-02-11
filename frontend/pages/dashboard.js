import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import CourtCard from '../components/CourtCard'
import BookingCard from '../components/BookingCard'
import TimeSlotGrid from '../components/TimeSlotGrid'
import Modal from '../components/Modal'

export default function Dashboard({ user, loading }) {
  const router = useRouter()
  const [courts, setCourts] = useState([])
  const [bookings, setBookings] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('courts')
  const [selectedCourt, setSelectedCourt] = useState(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user])

  useEffect(() => {
    if (router.query.tab === 'bookings') setActiveTab('bookings')
  }, [router.query])

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const courtsRes = await api.get('/courts')
      setCourts(courtsRes.data)
      const bookingsRes = await api.get('/bookings')
      setBookings(bookingsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleBook = async (courtId, slot) => {
    try {
      await api.post('/bookings', { court_id: courtId, time_slot: slot })
      setSelectedCourt(null)
      fetchData()
    } catch (error) {
      alert(error.response?.data?.detail || 'Booking failed')
    }
  }

  if (loading || dataLoading) {
    return <div className="loading-screen"><div className="spinner" /> Loading...</div>
  }
  if (!user) return null

  return (
    <div>
      <Navbar user={user} />

      <div className="page-container">
        <div className="page-header">
          <h1>{activeTab === 'courts' ? 'Available Courts' : 'My Bookings'}</h1>
          <p>{activeTab === 'courts'
            ? `${courts.length} court${courts.length !== 1 ? 's' : ''} available for booking`
            : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`
          }</p>
        </div>

        <div className="tabs">
          <button className={`tab ${activeTab === 'courts' ? 'active' : ''}`} onClick={() => setActiveTab('courts')}>
            🏟️ Courts
          </button>
          <button className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            📋 My Bookings
          </button>
        </div>

        {activeTab === 'courts' && (
          courts.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🏟️</div>
              <h3>No Courts Available</h3>
              <p>Check back soon for available courts!</p>
            </div>
          ) : (
            <div className="courts-grid">
              {courts.map((court, i) => (
                <CourtCard key={court.id} court={court} index={i} onViewTimes={setSelectedCourt} />
              ))}
            </div>
          )
        )}

        {activeTab === 'bookings' && (
          bookings.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📋</div>
              <h3>No Bookings Yet</h3>
              <p>Book a court to get started!</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setActiveTab('courts')}>
                Browse Courts
              </button>
            </div>
          ) : (
            <div className="bookings-grid">
              {bookings.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </div>
          )
        )}
      </div>

      {selectedCourt && (
        <Modal title={`Book — ${selectedCourt.name}`} onClose={() => setSelectedCourt(null)}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <span className="surface-badge">{selectedCourt.surface_type || 'Standard'}</span>
            </div>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>📍 {selectedCourt.location}</p>
          </div>
          <TimeSlotGrid court={selectedCourt} bookings={bookings} onBook={handleBook} />
        </Modal>
      )}
    </div>
  )
}
