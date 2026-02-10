import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'

export default function Dashboard({ user, loading }) {
  const router = useRouter()
  const [courts, setCourts] = useState([])
  const [bookings, setBookings] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('courts')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const courtsRes = await api.get('/courts')
      setCourts(courtsRes.data)

      if (user.role === 'player') {
        const bookingsRes = await api.get('/bookings')
        setBookings(bookingsRes.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const handleBooking = async (courtId, slot) => {
    try {
      await api.post('/bookings', { courtId, timeSlot: slot })
      alert('Booking confirmed!')
      fetchData()
    } catch (error) {
      alert(error.response?.data?.error || 'Booking failed')
    }
  }

  if (loading || dataLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
  }

  if (!user) {
    return <div>Redirecting...</div>
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>🎾 Pickleball Platform</h1>
        <div>
          <span style={{ marginRight: '20px' }}>Welcome, {user.name}!</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('courts')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'courts' ? '#4CAF50' : '#f0f0f0',
            color: activeTab === 'courts' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Courts
        </button>
        {user.role === 'player' && (
          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'bookings' ? '#4CAF50' : '#f0f0f0',
              color: activeTab === 'bookings' ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            My Bookings
          </button>
        )}
        {user.role === 'owner' && (
          <button
            onClick={() => setActiveTab('manage')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'manage' ? '#4CAF50' : '#f0f0f0',
              color: activeTab === 'manage' ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Manage Courts
          </button>
        )}
      </div>

      {activeTab === 'courts' && (
        <div>
          <h2>Available Courts</h2>
          {courts.length === 0 ? (
            <p>No courts available yet. Check back soon!</p>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {courts.map((court) => (
                <div
                  key={court.id}
                  style={{
                    border: '1px solid #ddd',
                    padding: '20px',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <h3>{court.name}</h3>
                  <p>{court.location}</p>
                  <p>Surface: {court.surfaceType}</p>
                  {user.role === 'player' && (
                    <div style={{ marginTop: '10px' }}>
                      <button
                        onClick={() => handleBooking(court.id, '10:00-11:00')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '10px',
                        }}
                      >
                        Book Court
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && user.role === 'player' && (
        <div>
          <h2>My Bookings</h2>
          {bookings.length === 0 ? (
            <p>No bookings yet. Book a court to get started!</p>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  style={{
                    border: '1px solid #ddd',
                    padding: '20px',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <h3>{booking.court.name}</h3>
                  <p>Time: {booking.timeSlot}</p>
                  <p>Status: {booking.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'manage' && user.role === 'owner' && (
        <div>
          <h2>Manage Your Courts</h2>
          <p>Court management features coming soon!</p>
        </div>
      )}
    </div>
  )
}
