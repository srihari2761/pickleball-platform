export default function CourtCard({ court, index, onViewTimes }) {
  const amenities = court.amenities
    ? (typeof court.amenities === 'string' ? court.amenities.split(',') : court.amenities)
    : []

  return (
    <div className="court-card">
      <div className="court-card-header">
        <span style={{ fontWeight: 600, fontSize: '1rem' }}>🏓</span>
        <span className="court-number">Court #{index + 1}</span>
      </div>
      <div className="court-card-body">
        <div className="court-card-name">{court.name}</div>
        <div className="court-card-location">📍 {court.location}</div>
        <div className="surface-badge">{court.surface_type || 'Standard'}</div>
        {amenities.length > 0 && (
          <div className="amenities-list">
            {amenities.map((a, i) => (
              <span key={i} className="amenity-tag">{a.trim()}</span>
            ))}
          </div>
        )}
      </div>
      <div className="court-card-footer">
        <button className="btn btn-primary btn-full btn-sm" onClick={() => onViewTimes(court)}>
          View Available Times
        </button>
      </div>
    </div>
  )
}
