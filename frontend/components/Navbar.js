import { useRouter } from 'next/router'

export default function Navbar({ user }) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => router.push('/dashboard')}>
        🏓 PicklePlay
      </div>
      <div className="navbar-links">
        <span className="navbar-user">Welcome, {user?.name}</span>
        <button
          className={`navbar-link ${router.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={() => router.push('/dashboard')}
        >
          Courts
        </button>
        <button
          className={`navbar-link ${router.query?.tab === 'bookings' ? 'active' : ''}`}
          onClick={() => router.push('/dashboard?tab=bookings')}
        >
          My Bookings
        </button>
        <button className="navbar-link logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}
