import { useEffect, useState } from 'react'
import api from '../api/client'

function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString('it-IT')
}

function formatSize(gb) {
  if (!gb) return '—'
  return gb >= 1 ? `${gb} GB` : `${Math.round(gb * 1024)} MB`
}

export default function Backups() {
  const [vms, setVms] = useState([])
  const [selected, setSelected] = useState(null)
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [message, setMessage] = useState(null)
  const [pbsOffline, setPbsOffline] = useState(false)

  useEffect(() => {
    api.get('/vms/').then(r => {
      const running = r.data.filter(v => v.status === 'running')
      setVms(r.data)
      if (running.length > 0) setSelected(running[0])
      else if (r.data.length > 0) setSelected(r.data[0])
    })
  }, [])

  const fetchBackups = async (vm) => {
    if (!vm) return
    setLoading(true)
    setPbsOffline(false)
    try {
      const res = await api.get(`/backups/${vm.node}/${vm.vmid}`)
      const list = res.data.backups || []
      // Controlla se qualche storage ha dato warning
      const hasWarning = list.some(b => b.warning)
      setPbsOffline(hasWarning)
      setBackups(list.filter(b => !b.warning))
    } catch (e) {
      const detail = e.response?.data?.detail
      if (e.response?.status === 503) setPbsOffline(true)
      else setMessage({ type: 'error', text: typeof detail === 'object' ? detail.detail : detail || 'Errore' })
      setBackups([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBackups(selected) }, [selected])

  const triggerSnapshot = async () => {
    if (!selected) return
    setTriggering(true)
    setMessage(null)
    try {
      await api.post(`/backups/${selected.node}/${selected.type}/${selected.vmid}/snapshot`)
      setMessage({ type: 'success', text: `Snapshot avviato per ${selected.name}. Potrebbe richiedere qualche minuto.` })
      setTimeout(() => fetchBackups(selected), 5000)
    } catch (e) {
      const detail = e.response?.data?.detail
      const text = typeof detail === 'object' ? detail.message || detail.detail : detail
      if (e.response?.status === 503) setPbsOffline(true)
      setMessage({ type: 'error', text: text || 'Errore durante lo snapshot' })
    } finally {
      setTriggering(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 600, margin: 0 }}>Backup & Snapshot</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={selected ? `${selected.node}-${selected.vmid}` : ''}
            onChange={e => {
              const [node, vmid] = e.target.value.split('-')
              setSelected(vms.find(v => v.node === node && String(v.vmid) === vmid))
            }}
            style={{
              background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
              padding: '8px 12px', color: '#f1f5f9', fontSize: 13
            }}
          >
            {vms.map(v => (
              <option key={`${v.node}-${v.vmid}`} value={`${v.node}-${v.vmid}`}>
                [{v.node}] {v.name} ({v.vmid})
              </option>
            ))}
          </select>
          <button
            onClick={triggerSnapshot} disabled={triggering || !selected}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: triggering ? '#334155' : '#7c3aed',
              color: '#fff', fontSize: 13, fontWeight: 500,
              cursor: triggering ? 'not-allowed' : 'pointer'
            }}
          >
            {triggering ? 'Avvio...' : '+ Nuovo snapshot'}
          </button>
        </div>
      </div>

      {/* Banner PBS offline */}
      {pbsOffline && (
        <div style={{
          background: '#451a03', border: '1px solid #92400e', borderRadius: 8,
          padding: '12px 16px', marginBottom: 16, color: '#fcd34d', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{ fontSize: 16 }}>⚠</span>
          Proxmox Backup Server non raggiungibile. I backup esistenti potrebbero non essere visibili.
        </div>
      )}

      {message && (
        <div style={{
          background: message.type === 'success' ? '#14532d' : '#450a0a',
          border: `1px solid ${message.type === 'success' ? '#166534' : '#7f1d1d'}`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 16,
          color: message.type === 'success' ? '#86efac' : '#fca5a5', fontSize: 13
        }}>{message.text}</div>
      )}

      {loading && <div style={{ color: '#94a3b8', padding: 32 }}>Caricamento backup...</div>}

      {!loading && (
        <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden', border: '1px solid #334155' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                {['Storage', 'Data', 'Dimensione', 'Formato', 'Note'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: 12, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backups.map((b, i) => (
                <tr key={i} style={{ borderTop: '1px solid #0f172a' }}>
                  <td style={{ padding: '12px 16px', color: '#93c5fd', fontSize: 13 }}>{b.storage}</td>
                  <td style={{ padding: '12px 16px', color: '#f1f5f9', fontSize: 13 }}>{formatDate(b.ctime)}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 13 }}>{formatSize(b.size_gb)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11, padding: '2px 7px', borderRadius: 4,
                      background: '#1e3a5f', color: '#93c5fd', fontWeight: 500
                    }}>{b.format || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>{b.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {backups.length === 0 && !pbsOffline && (
            <div style={{ color: '#64748b', textAlign: 'center', padding: 48 }}>
              Nessun backup trovato per questa VM
            </div>
          )}
        </div>
      )}
    </div>
  )
}
