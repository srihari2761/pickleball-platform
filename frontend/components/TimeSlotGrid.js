import { useState } from 'react'

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6) // 6AM to 9PM

function getNext7Days() {
  const days = []
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({
      date: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : dayNames[d.getDay()],
      dayNum: d.getDate(),
    })
  }
  return days
}

function formatHour(h) {
  if (h === 0 || h === 12) return `${h === 0 ? 12 : 12}:00 ${h < 12 ? 'AM' : 'PM'}`
  return `${h > 12 ? h - 12 : h}:00 ${h < 12 ? 'AM' : 'PM'}`
}

export default function TimeSlotGrid({ court, bookings = [], onBook }) {
  const [selectedDate, setSelectedDate] = useState(getNext7Days()[0].date)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const days = getNext7Days()

  const bookedSlots = bookings
    .filter((b) => b.court_id === court.id && b.status !== 'cancelled')
    .map((b) => b.time_slot)

  const handleSlotClick = (slot) => {
    if (bookedSlots.includes(slot)) return
    setSelectedSlot(slot === selectedSlot ? null : slot)
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <strong style={{ fontSize: '0.9rem', color: '#666' }}>Select a date:</strong>
      </div>
      <div className="date-picker">
        {days.map((d) => (
          <button
            key={d.date}
            className={`date-btn ${selectedDate === d.date ? 'active' : ''}`}
            onClick={() => { setSelectedDate(d.date); setSelectedSlot(null) }}
          >
            <div className="day-name">{d.dayName}</div>
            <div className="day-num">{d.dayNum}</div>
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 12 }}>
        <strong style={{ fontSize: '0.9rem', color: '#666' }}>Available time slots:</strong>
      </div>
      <div className="timeslots-grid">
        {HOURS.map((h) => {
          const slot = `${selectedDate} ${formatHour(h)}-${formatHour(h + 1)}`
          const isBooked = bookedSlots.includes(slot)
          const isSelected = selectedSlot === slot
          return (
            <button
              key={h}
              className={`timeslot ${isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSlotClick(slot)}
              disabled={isBooked}
            >
              {formatHour(h)}
            </button>
          )
        })}
      </div>
      {selectedSlot && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={() => onBook(court.id, selectedSlot)}>
            Confirm Booking — {selectedSlot.split(' ').slice(1).join(' ')}
          </button>
        </div>
      )}
    </div>
  )
}
