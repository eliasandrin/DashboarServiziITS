import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserPanel({ onClose }) {
  const { user, changePassword } = useAuth();
  const [tab, setTab] = useState('info');
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ type: 'error', text: 'Le password non coincidono' }); return; }
    if (pwForm.newPw.length < 6) { setPwMsg({ type: 'error', text: 'Minimo 6 caratteri' }); return; }
    setLoading(true);
    try {
      await changePassword(pwForm.current, pwForm.newPw);
      setPwMsg({ type: 'ok', text: 'Password aggiornata con successo!' });
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.error || 'Errore' });
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>

        <div style={styles.avatarSection}>
          <div style={styles.avatarLarge}>{user?.nome?.[0]}{user?.cognome?.[0]}</div>
          <h2 style={styles.fullName}>{user?.nome} {user?.cognome}</h2>
          <span style={{ ...styles.roleBadge, ...(user?.role === 'admin' ? styles.roleAdmin : styles.roleUser) }}>
            {user?.role === 'admin' ? '⬡ ADMIN' : '● UTENTE'}
          </span>
        </div>

        <div style={styles.tabs}>
          {[['info', 'Profilo'], ['pw', 'Modifica Password']].map(([k, l]) => (
            <button key={k} style={{ ...styles.tab, ...(tab === k ? styles.tabActive : {}) }} onClick={() => { setTab(k); setPwMsg({ type: '', text: '' }); }}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div style={styles.infoGrid}>
            {[['Nome', user?.nome], ['Cognome', user?.cognome], ['Email', user?.email], ['Ruolo', user?.role === 'admin' ? 'Amministratore' : 'Utente standard']].map(([label, val]) => (
              <div key={label} style={styles.infoRow}>
                <span style={styles.infoLabel}>{label}</span>
                <span style={styles.infoVal}>{val}</span>
              </div>
            ))}
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Password</span>
              <span style={styles.infoVal}>••••••••</span>
            </div>
          </div>
        )}

        {tab === 'pw' && (
          <form onSubmit={handlePwChange} style={styles.form}>
            {[['current', 'Password attuale'], ['newPw', 'Nuova password'], ['confirm', 'Conferma password']].map(([k, l]) => (
              <div key={k} style={styles.field}>
                <label style={styles.label}>{l}</label>
                <input type="password" style={styles.input} value={pwForm[k]}
                  onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))} required />
              </div>
            ))}
            {pwMsg.text && (
              <div style={{ ...styles.msg, ...(pwMsg.type === 'ok' ? styles.msgOk : styles.msgErr) }}>
                {pwMsg.text}
              </div>
            )}
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Aggiornamento...' : 'Aggiorna Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  panel: { background: 'rgba(10,20,30,0.95)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 16, padding: 40, width: 420, position: 'relative', boxShadow: '0 0 60px rgba(0,212,255,0.08)' },
  closeBtn: { position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'rgba(180,210,220,0.5)', fontSize: 18, cursor: 'pointer' },
  avatarSection: { textAlign: 'center', marginBottom: 28 },
  avatarLarge: { width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#0088cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#050a0f', margin: '0 auto 12px' },
  fullName: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: '#e8f4f8', margin: '0 0 8px' },
  roleBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 2 },
  roleAdmin: { background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)', color: '#ffa500' },
  roleUser: { background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' },
  tabs: { display: 'flex', background: 'rgba(0,212,255,0.05)', borderRadius: 8, padding: 4, marginBottom: 24, border: '1px solid rgba(0,212,255,0.1)' },
  tab: { flex: 1, padding: '8px 0', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13, background: 'transparent', color: 'rgba(180,210,220,0.5)', transition: 'all 0.2s' },
  tabActive: { background: 'rgba(0,212,255,0.15)', color: '#00d4ff' },
  infoGrid: { display: 'flex', flexDirection: 'column', gap: 12 },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(0,212,255,0.05)', borderRadius: 8, border: '1px solid rgba(0,212,255,0.08)' },
  infoLabel: { fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(0,212,255,0.6)', letterSpacing: 1, textTransform: 'uppercase' },
  infoVal: { fontSize: 14, color: '#e8f4f8', fontWeight: 600 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(0,212,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' },
  input: { padding: '11px 14px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, color: '#e8f4f8', fontSize: 14, fontFamily: "'Syne', sans-serif", outline: 'none' },
  msg: { padding: '10px 14px', borderRadius: 8, fontSize: 13, fontFamily: "'Space Mono', monospace" },
  msgOk: { background: 'rgba(0,200,100,0.1)', border: '1px solid rgba(0,200,100,0.3)', color: '#00c864' },
  msgErr: { background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', color: '#ff6b6b' },
  submitBtn: { padding: '12px', background: 'linear-gradient(135deg,#00d4ff,#0088cc)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontFamily: "'Syne', sans-serif", fontSize: 14, cursor: 'pointer', letterSpacing: 1 },
};
