export default function BookingCard({ booking, onCancel }) {
  const status = (booking.status || 'confirmed').toLowerCase()
  const statusClass = `status-${status}`

  return (
    <div className={`booking-card ${status}`}>
      <div className="booking-info">
        <h3>🏓 {booking.court_name || 'Court'}</h3>
        <p>📍 {booking.location || 'N/A'}</p>
        <p>🕐 {booking.time_slot}</p>
        <div style={{ marginTop: 8 }}>
          <span className={`status-badge ${statusClass}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
      {status !== 'cancelled' && onCancel && (
        <button className="btn btn-danger btn-sm" onClick={() => onCancel(booking.id)}>
          Cancel
        </button>
      )}
    </div>
  )
}
