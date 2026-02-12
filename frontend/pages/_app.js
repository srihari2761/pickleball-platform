import { useEffect, useState } from 'react'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  return <Component {...pageProps} user={user} setUser={setUser} loading={loading} />
}

export default MyApp
