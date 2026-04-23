import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Metrics from './pages/Metrics'
import Backups from './pages/Backups'

const NAV = [
  { id: 'dashboard', label: 'Dashboard',  icon: '▣' },
  { id: 'inventory', label: 'Inventario', icon: '☰' },
  { id: 'metrics',   label: 'Metriche',   icon: '◎' },
  { id: 'backups',   label: 'Backup',     icon: '⊡' },
]

function Sidebar({ page, onNavigate, user, onLogout }) {
  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: '#0f172a',
      borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 10
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ color: '#3b82f6', fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>PWMO</div>
        <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>Proxmox Orchestrator</div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: page === item.id ? '#1e3a5f' : 'transparent',
              color: page === item.id ? '#93c5fd' : '#64748b',
              fontSize: 13, fontWeight: page === item.id ? 500 : 400,
              marginBottom: 2, textAlign: 'left'
            }}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '16px 16px', borderTop: '1px solid #1e293b' }}>
        <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>
          {user?.username}
          <span style={{
            marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 10,
            background: '#1e3a5f', color: '#93c5fd'
          }}>{user?.role}</span>
        </div>
        <button
          onClick={onLogout}
          style={{
            background: 'transparent', border: '1px solid #334155', borderRadius: 6,
            color: '#64748b', fontSize: 12, padding: '5px 10px', cursor: 'pointer', marginTop: 4
          }}
        >
          Esci
        </button>
      </div>
    </aside>
  )
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [page, setPage] = useState('dashboard')

  const handleLogin = (data) => {
    setUser({ username: data.username, role: data.role })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (!user) return <Login onLogin={handleLogin} />

  const pages = { dashboard: <Dashboard />, inventory: <Inventory />, metrics: <Metrics />, backups: <Backups /> }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      <Sidebar page={page} onNavigate={setPage} user={user} onLogout={handleLogout} />
      <main style={{ marginLeft: 220, flex: 1, padding: 32, minHeight: '100vh' }}>
        {pages[page]}
      </main>
    </div>
  )
}
