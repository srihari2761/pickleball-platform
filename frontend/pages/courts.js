import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '../hooks/useAuthStore'

export default function Courts() {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLocation, setSearchLocation] = useState('')
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    fetchCourts()
  }, [searchLocation])

  const fetchCourts = async () => {
    try {
      setLoading(true)
      const url = searchLocation
        ? `${API_URL}/api/v1/courts?location=${searchLocation}`
        : `${API_URL}/api/v1/courts`
      
      const response = await axios.get(url)
      setCourts(response.data)
    } catch (error) {
      console.error('Failed to fetch courts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Available Courts</h1>

      <div>
        <input
          type="text"
          placeholder="Search by location..."
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />
        <button onClick={fetchCourts}>Search</button>
      </div>

      {loading ? (
        <p>Loading courts...</p>
      ) : courts.length > 0 ? (
        <div>
          {courts.map((court) => (
            <div key={court.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <h3>{court.name}</h3>
              <p>Address: {court.address}</p>
              <p>Surface: {court.surface_type}</p>
              <p>Courts: {court.number_of_courts}</p>
              {court.description && <p>{court.description}</p>}
              <a href={`/courts/${court.id}`}>View Details</a>
              {isAuthenticated && (
                <a href={`/courts/${court.id}/book`}>Book This Court</a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No courts found. Try searching in a different location.</p>
      )}
    </div>
  )
}
