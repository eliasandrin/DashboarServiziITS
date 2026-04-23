import { useState } from 'react'
import axios from 'axios'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const form = new URLSearchParams()
      form.append('username', username)
      form.append('password', password)
      const res = await axios.post('/api/auth/login', form)
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify({ username: res.data.username, role: res.data.role }))
      onLogin(res.data)
    } catch {
      setError('Username o password errati')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0f172a'
    }}>
      <div style={{
        background: '#1e293b', borderRadius: 12, padding: '40px 48px',
        width: 360, boxShadow: '0 4px 32px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚙️</div>
          <h1 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 600, margin: 0 }}>PWMO</h1>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Proxmox Web Management Orchestrator</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>Username</label>
            <input
              type="text" value={username}
              onChange={e => setUsername(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid #334155', background: '#0f172a',
                color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box'
              }}
              required autoFocus
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>Password</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid #334155', background: '#0f172a',
                color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 8,
              padding: '10px 12px', color: '#fca5a5', fontSize: 13, marginBottom: 16
            }}>{error}</div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '11px', borderRadius: 8, border: 'none',
              background: loading ? '#334155' : '#3b82f6', color: '#fff',
              fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  )
}
