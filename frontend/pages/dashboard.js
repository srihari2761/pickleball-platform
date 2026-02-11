import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { useAuthStore } from '../hooks/useAuthStore'

export default function Dashboard() {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    // Note: In production, add a GET /api/v1/users/me/bookings endpoint.
    // For now, we fetch all bookings by iterating courts (simplified).
    // The backend would ideally have a user-bookings endpoint.
    setLoading(false)
  }, [isAuthenticated, router])

  // Fetch user's bookings - using a dedicated endpoint would be better
  // For MVP, we'll call the bookings endpoint with auth
  useEffect(() => {
    if (!token) return
    const fetchMyBookings = async () => {
      try {
        // Ideally: GET /api/v1/me/bookings
        // For now, we'll use a workaround - the backend should be extended
        // Showing the dashboard structure with placeholder
        const response = await axios.get(`${API_URL}/api/v1/bookings/mine`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { token },
        }).catch(() => ({ data: [] }))
        setBookings(response.data)
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMyBookings()
  }, [token, API_URL])

  if (!isAuthenticated) return null

  return (
    <main>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My Dashboard</h1>
        <button onClick={() => { logout(); router.push('/') }} style={{ background: '#e8e8e8', color: '#333' }}>
          Log Out
        </button>
      </div>

      <nav>
        <a href="/courts">Browse Courts</a>
        <a href="/">Home</a>
      </nav>

      <h2>My Bookings</h2>
      {loading ? (
        <p>Loading your bookings...</p>
      ) : bookings.length > 0 ? (
        <div>
          {bookings.map((b) => (
            <div key={b.id} style={{
              background: 'white', padding: '15px', borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '10px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <p style={{ fontWeight: '600', margin: 0 }}>Booking #{b.id}</p>
                <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>
                  {new Date(b.start_time).toLocaleString()} – {new Date(b.end_time).toLocaleString()}
                </p>
              </div>
              <div>
                <span style={{
                  background: b.status === 'confirmed' ? '#dcfce7' : b.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                  color: b.status === 'confirmed' ? '#166534' : b.status === 'cancelled' ? '#991b1b' : '#92400e',
                  padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '600',
                }}>
                  {b.status.toUpperCase()}
                </span>
                <button
                  onClick={() => router.push(`/bookings/${b.id}`)}
                  style={{ marginLeft: '10px', padding: '6px 12px', fontSize: '13px' }}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center', marginTop: '10px' }}>
          <p style={{ color: '#888' }}>No bookings yet.</p>
          <button onClick={() => router.push('/courts')} style={{ marginTop: '10px' }}>
            Find a Court to Book
          </button>
        </div>
      )}
    </main>
  )
}
