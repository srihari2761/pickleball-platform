import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function BookingSuccess() {
  const router = useRouter()
  const { id, success } = router.query
  const [booking, setBooking] = useState(null)
  const [court, setCourt] = useState(null)
  const [loading, setLoading] = useState(true)
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (!id) return
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/bookings/${id}`)
        setBooking(response.data)
        const courtRes = await axios.get(`${API_URL}/api/v1/courts/${response.data.court_id}`)
        setCourt(courtRes.data)
      } catch (err) {
        console.error('Failed to fetch booking:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [id, API_URL])

  if (loading) return <main><p>Loading booking details...</p></main>
  if (!booking) return <main><p>Booking not found.</p></main>

  return (
    <main>
      {success && (
        <div style={{
          background: '#dcfce7', border: '1px solid #22c55e', borderRadius: '8px',
          padding: '16px', marginBottom: '20px', textAlign: 'center',
        }}>
          <h2 style={{ color: '#16a34a', margin: 0 }}>✅ Booking Confirmed!</h2>
          <p style={{ color: '#166534', margin: '5px 0 0' }}>Your court has been reserved successfully.</p>
        </div>
      )}

      <div style={{
        background: 'white', padding: '30px', borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: '500px',
      }}>
        <h2 style={{ marginTop: 0 }}>Booking Details</h2>
        <div style={{ lineHeight: '2.2' }}>
          <p><strong>Booking ID:</strong> <code style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: '4px' }}>#{booking.id}</code></p>
          <p><strong>Status:</strong> <span style={{
            background: booking.status === 'confirmed' ? '#dcfce7' : '#fef3c7',
            color: booking.status === 'confirmed' ? '#166534' : '#92400e',
            padding: '2px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: '600',
          }}>{booking.status.toUpperCase()}</span></p>
          {court && (
            <>
              <p><strong>Court:</strong> {court.name}</p>
              <p><strong>Address:</strong> {court.address}</p>
            </>
          )}
          <p><strong>Start:</strong> {new Date(booking.start_time).toLocaleString()}</p>
          <p><strong>End:</strong> {new Date(booking.end_time).toLocaleString()}</p>
          <p><strong>Booked:</strong> {new Date(booking.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => router.push('/dashboard')}>My Bookings</button>
        <button onClick={() => router.push('/courts')} style={{ background: '#e8e8e8', color: '#333' }}>Browse Courts</button>
      </div>
    </main>
  )
}
