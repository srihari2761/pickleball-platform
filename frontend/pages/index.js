import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home({ user, loading }) {
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [loading, user])

  return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
}
