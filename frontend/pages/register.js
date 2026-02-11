import { useState } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'

const SKILL_LEVELS = [
  { value: 'beginner', label: '🌱 Beginner', desc: 'Just starting out' },
  { value: 'intermediate', label: '🎯 Intermediate', desc: 'Know the basics' },
  { value: 'advanced', label: '🔥 Advanced', desc: 'Competitive player' },
  { value: 'professional', label: '🏆 Professional', desc: 'Tournament level' },
]

export default function Register({ setUser }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', role: 'player', skillLevel: 'intermediate',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        email: formData.email, password: formData.password, name: formData.name,
        role: formData.role, skill_level: formData.skillLevel,
      }
      const response = await api.post('/auth/register', payload)
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      if (setUser) setUser(response.data.user)
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-icon">🏓</div>
          <h1>Join PicklePlay</h1>
          <p>Create your free account</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-input" value={formData.name}
              onChange={handleChange} placeholder="John Smith" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" value={formData.email}
              onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" value={formData.password}
              onChange={handleChange} placeholder="Min. 6 characters" required />
          </div>

          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ v: 'player', l: '🎾 Player' }, { v: 'owner', l: '🏟️ Court Owner' }].map(r => (
                <button key={r.v} type="button"
                  className={`btn ${formData.role === r.v ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1 }}
                  onClick={() => setFormData(p => ({ ...p, role: r.v }))}
                >{r.l}</button>
              ))}
            </div>
          </div>

          {formData.role === 'player' && (
            <div className="form-group">
              <label className="form-label">Skill Level</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {SKILL_LEVELS.map(s => (
                  <button key={s.value} type="button"
                    className={`btn btn-sm ${formData.skillLevel === s.value ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFormData(p => ({ ...p, skillLevel: s.value }))}
                    style={{ flexDirection: 'column', padding: '10px 8px' }}
                  >
                    <span>{s.label}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <a href="/login">Sign in</a>
        </div>
      </div>
    </div>
  )
}
