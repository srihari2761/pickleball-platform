import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { useAuthStore } from '../../../hooks/useAuthStore'

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
]

const DURATIONS = [
  { label: '30 min', value: 30, price: 15 },
  { label: '1 hour', value: 60, price: 25 },
  { label: '1.5 hours', value: 90, price: 35 },
  { label: '2 hours', value: 120, price: 45 },
]

export default function BookCourt() {
  const router = useRouter()
  const { id } = router.query
  const token = useAuthStore((state) => state.token)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const [court, setCourt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[1]) // default 1 hour
  const [existingBookings, setExistingBookings] = useState([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
  }, [])

  // Fetch court details
  useEffect(() => {
    if (!id) return
    const fetchCourt = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/courts/${id}`)
        setCourt(response.data)
      } catch (err) {
        console.error('Failed to fetch court:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourt()
  }, [id, API_URL])

  // Fetch existing bookings for selected date
  useEffect(() => {
    if (!id || !selectedDate) return
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/v1/courts/${id}/bookings?start_date=${selectedDate}T00:00:00&end_date=${selectedDate}T23:59:59`
        )
        setExistingBookings(response.data)
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
      }
    }
    fetchBookings()
  }, [id, selectedDate, API_URL])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const isSlotBooked = (time) => {
    const slotStart = new Date(`${selectedDate}T${time}:00`)
    const slotEnd = new Date(slotStart.getTime() + selectedDuration.value * 60000)

    return existingBookings.some((b) => {
      if (b.status === 'cancelled') return false
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      return slotStart < bEnd && slotEnd > bStart
    })
  }

  const handleSelectTime = (time) => {
    if (isSlotBooked(time)) return
    setSelectedTime(time)
    setError('')
  }

  const handleProceedToConfirm = () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time slot.')
      return
    }
    setShowConfirmModal(true)
  }

  const handleConfirmBooking = async () => {
    setSubmitting(true)
    setError('')
    try {
      const startTime = `${selectedDate}T${selectedTime}:00`
      const response = await axios.post(
        `${API_URL}/api/v1/bookings`,
        {
          court_id: parseInt(id),
          start_time: startTime,
          duration_minutes: selectedDuration.value,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { token },
        }
      )
      router.push(`/bookings/${response.data.id}?success=true`)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create booking. Please try again.'
      setError(msg)
      setShowConfirmModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  const getEndTime = () => {
    if (!selectedTime) return ''
    const start = new Date(`${selectedDate}T${selectedTime}:00`)
    const end = new Date(start.getTime() + selectedDuration.value * 60000)
    return end.toTimeString().slice(0, 5)
  }

  if (loading) return <main><p>Loading...</p></main>
  if (!court) return <main><p>Court not found.</p></main>

  return (
    <main>
      <a href={`/courts/${id}`}>← Back to {court.name}</a>
      <h1>Book {court.name}</h1>

      {/* Date Picker */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '20px' }}>
        <h3>Select Date</h3>
        <input
          type="date"
          value={selectedDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime('') }}
          style={{ padding: '10px', fontSize: '16px', width: 'auto' }}
        />
      </div>

      {/* Duration Selector */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '15px' }}>
        <h3>Select Duration</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => { setSelectedDuration(d); setSelectedTime('') }}
              style={{
                background: selectedDuration.value === d.value ? '#0070f3' : '#e8e8e8',
                color: selectedDuration.value === d.value ? 'white' : '#333',
                padding: '10px 16px',
                borderRadius: '6px',
              }}
            >
              {d.label} — ${d.price}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '15px' }}>
        <h3>Select Time</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', marginTop: '10px' }}>
          {TIME_SLOTS.map((time) => {
            const booked = isSlotBooked(time)
            const selected = selectedTime === time
            return (
              <button
                key={time}
                onClick={() => handleSelectTime(time)}
                disabled={booked}
                style={{
                  background: booked ? '#f0f0f0' : selected ? '#0070f3' : 'white',
                  color: booked ? '#aaa' : selected ? 'white' : '#333',
                  border: selected ? '2px solid #0070f3' : '1px solid #ddd',
                  padding: '10px',
                  borderRadius: '6px',
                  cursor: booked ? 'not-allowed' : 'pointer',
                  textDecoration: booked ? 'line-through' : 'none',
                  fontWeight: selected ? '600' : '400',
                }}
              >
                {time}
              </button>
            )
          })}
        </div>
      </div>

      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

      {/* Proceed Button */}
      <button
        onClick={handleProceedToConfirm}
        disabled={!selectedDate || !selectedTime}
        style={{ marginTop: '20px', padding: '14px 28px', fontSize: '16px' }}
      >
        Review Booking
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '12px',
            maxWidth: '450px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ marginTop: 0 }}>Confirm Booking</h2>
            <div style={{ margin: '20px 0', lineHeight: '2' }}>
              <p><strong>Court:</strong> {court.name}</p>
              <p><strong>Address:</strong> {court.address}</p>
              <p><strong>Date:</strong> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Time:</strong> {selectedTime} – {getEndTime()}</p>
              <p><strong>Duration:</strong> {selectedDuration.label}</p>
              <p><strong>Price:</strong> <span style={{ fontSize: '20px', fontWeight: '700', color: '#0070f3' }}>${selectedDuration.price}</span></p>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handleConfirmBooking}
                disabled={submitting}
                style={{ flex: 1, padding: '12px', fontSize: '16px', background: '#22c55e' }}
              >
                {submitting ? 'Booking...' : 'Confirm & Pay'}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                style={{ flex: 1, padding: '12px', fontSize: '16px', background: '#e8e8e8', color: '#333' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
