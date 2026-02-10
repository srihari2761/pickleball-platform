import Head from 'next/head'
import Link from 'next/link'
import { useAuthStore } from '../hooks/useAuthStore'

export default function Home() {
  const user = useAuthStore((state) => state.user)

  return (
    <div>
      <Head>
        <title>Pickleball Platform</title>
        <meta name="description" content="Find courts, book time, connect with players" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome to Pickleball Court Tracking Platform</h1>
        
        {user ? (
          <div>
            <p>Welcome back, {user.full_name}!</p>
            <nav>
              <Link href="/courts">Browse Courts</Link>
              <Link href="/bookings">My Bookings</Link>
              <Link href="/friends">Friends</Link>
              <Link href="/profile">Profile</Link>
            </nav>
          </div>
        ) : (
          <div>
            <p>Find available courts, book time, and connect with pickleball players.</p>
            <nav>
              <Link href="/login">Login</Link>
              <Link href="/register">Sign Up</Link>
            </nav>
          </div>
        )}
      </main>
    </div>
  )
}
