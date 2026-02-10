import '../styles/globals.css'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../hooks/useAuthStore'

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)
  const initAuth = useAuthStore((state) => state.initAuth)

  useEffect(() => {
    // Initialize auth on app load
    initAuth()
    setMounted(true)
  }, [initAuth])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return <Component {...pageProps} />
}

export default MyApp
