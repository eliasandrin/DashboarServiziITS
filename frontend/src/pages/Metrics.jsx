import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../api/client'

function MetricChart({ title, data, lines }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
      <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 500, marginBottom: 16 }}>{title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
          {lines.map(l => (
            <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color}
              dot={false} strokeWidth={2} name={l.name} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Metrics() {
  const [vms, setVms] = useState([])
  const [selected, setSelected] = useState(null)
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/vms/').then(r => {
      setVms(r.data)
      if (r.data.length > 0) setSelected(r.data[0])
    })
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    setError('')
    api.get(`/metrics/${selected.node}/${selected.type}/${selected.vmid}`)
      .then(r => {
        const points = r.data.datapoints.map((p, i) => ({
          ...p,
          label: i % 5 === 0 ? `${Math.round((30 - r.data.datapoints.length + i + 1))}m` : '',
        }))
        setMetrics(points)
      })
      .catch(e => {
        const detail = e.response?.data?.detail
        setError(typeof detail === 'object' ? detail.detail : detail || 'Errore metriche')
      })
      .finally(() => setLoading(false))
  }, [selected])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 600, margin: 0 }}>Metriche real-time</h2>
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
      </div>

      {error && (
        <div style={{
          background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 8,
          padding: '10px 16px', color: '#fca5a5', fontSize: 13, marginBottom: 16
        }}>Attenzione: {error}</div>
      )}

      {loading && <div style={{ color: '#94a3b8', padding: 32 }}>Caricamento metriche...</div>}

      {!loading && metrics.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <MetricChart
            title="CPU — ultimi 30 minuti"
            data={metrics}
            lines={[{ key: 'cpu', color: '#3b82f6', name: 'CPU %' }]}
          />
          <MetricChart
            title="RAM — ultimi 30 minuti"
            data={metrics}
            lines={[{ key: 'mem_percent', color: '#8b5cf6', name: 'RAM %' }]}
          />
        </div>
      )}

      {!loading && metrics.length === 0 && !error && (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 48 }}>Seleziona una VM per vedere le metriche</div>
      )}
    </div>
  )
}
