import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { useAuthStore } from '../../hooks/useAuthStore'

export default function CourtDetail() {
  const router = useRouter()
  const { id } = router.query
  const [court, setCourt] = useState(null)
  const [loading, setLoading] = useState(true)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (!id) return
    const fetchCourt = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/courts/${id}`)
        setCourt(response.data)
      } catch (error) {
        console.error('Failed to fetch court:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourt()
  }, [id, API_URL])

  if (loading) return <main><p>Loading court details...</p></main>
  if (!court) return <main><p>Court not found.</p></main>

  return (
    <main>
      <a href="/courts">← Back to Courts</a>
      <h1>{court.name}</h1>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '20px' }}>
        <p><strong>Address:</strong> {court.address}</p>
        <p><strong>Surface:</strong> {court.surface_type}</p>
        <p><strong>Number of Courts:</strong> {court.number_of_courts}</p>
        {court.description && <p><strong>Description:</strong> {court.description}</p>}
        {court.amenities && <p><strong>Amenities:</strong> {court.amenities}</p>}
      </div>

      {isAuthenticated ? (
        <button
          onClick={() => router.push(`/courts/${id}/book`)}
          style={{ marginTop: '20px', padding: '12px 24px', fontSize: '16px' }}
        >
          Book This Court
        </button>
      ) : (
        <p style={{ marginTop: '20px' }}>
          <a href="/login">Log in</a> to book this court.
        </p>
      )}
    </main>
  )
}
