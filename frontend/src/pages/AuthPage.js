import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ nome: '', cognome: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.nome || !form.cognome) { setError('Nome e cognome sono obbligatori'); setLoading(false); return; }
        await register(form.nome, form.cognome, form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Errore di connessione');
    }
    setLoading(false);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={styles.root}>
      <div style={styles.bg}>
        <div style={styles.gridLines} />
        <div style={styles.glowOrb1} />
        <div style={styles.glowOrb2} />
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>Ɣ</span>
            <span style={styles.logoText}>CLOUD<span style={styles.logoAccent}>gamma</span></span>
          </div>
        </div>

        <div style={styles.tabs}>
          {['login', 'register'].map(m => (
            <button key={m} style={{ ...styles.tab, ...(mode === m ? styles.tabActive : {}) }}
              onClick={() => { setMode(m); setError(''); }}>
              {m === 'login' ? 'Accedi' : 'Registrati'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'register' && (
            <div style={styles.row}>
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Nome</label>
                <input style={styles.input} placeholder="Mario" value={form.nome} onChange={set('nome')} required />
              </div>
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Cognome</label>
                <input style={styles.input} placeholder="Rossi" value={form.cognome} onChange={set('cognome')} required />
              </div>
            </div>
          )}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="mario.rossi@gmail.com"
              value={form.email} onChange={set('email')} required />
          </div>
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="••••••••"
              value={form.password} onChange={set('password')} required />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button style={{ ...styles.btn, ...(loading ? styles.btnLoading : {}) }} type="submit" disabled={loading}>
            {loading ? 'Caricamento...' : (mode === 'login' ? 'Accedi →' : 'Registrati →')}
          </button>
        </form>

        {mode === 'login' && (
          <div style={styles.adminHint}>
            <span style={styles.adminHintDot} />
            Admin di default: <strong>nome.cognome@gmail.com</strong> / <strong>Admin1234!</strong>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050a0f', position: 'relative', overflow: 'hidden', fontFamily: "'Syne', sans-serif" },
  bg: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  gridLines: {
    position: 'absolute', inset: 0,
    backgroundImage: 'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)',
    backgroundSize: '60px 60px'
  },
  glowOrb1: { position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)' },
  glowOrb2: { position: 'absolute', bottom: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,0,0.1) 0%, transparent 70%)' },
  card: { position: 'relative', zIndex: 1, background: 'rgba(10,20,30,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 16, padding: '40px 48px', width: '100%', maxWidth: 460, boxShadow: '0 0 60px rgba(0,212,255,0.08), 0 20px 60px rgba(0,0,0,0.5)' },
  cardHeader: { textAlign: 'center', marginBottom: 32 },
  logo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 },
  logoIcon: { fontSize: 28, color: '#00d4ff' },
  logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: '#e8f4f8', letterSpacing: 4 },
  logoAccent: { color: '#00d4ff' },
  subtitle: { color: 'rgba(180,210,220,0.6)', fontSize: 13, margin: 0, letterSpacing: 1, fontFamily: "'Space Mono', monospace" },
  tabs: { display: 'flex', background: 'rgba(0,212,255,0.05)', borderRadius: 8, padding: 4, marginBottom: 28, border: '1px solid rgba(0,212,255,0.1)' },
  tab: { flex: 1, padding: '10px 0', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: 1, background: 'transparent', color: 'rgba(180,210,220,0.5)', transition: 'all 0.2s' },
  tabActive: { background: 'rgba(0,212,255,0.15)', color: '#00d4ff', boxShadow: '0 0 20px rgba(0,212,255,0.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', gap: 12 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  label: { fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(0,212,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' },
  input: { padding: '12px 16px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, color: '#e8f4f8', fontSize: 14, fontFamily: "'Syne', sans-serif", outline: 'none', transition: 'border-color 0.2s' },
  error: { background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ff6b6b', fontSize: 13, fontFamily: "'Space Mono', monospace" },
  btn: { marginTop: 8, padding: '14px', background: 'linear-gradient(135deg, #00d4ff, #0088cc)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: 2, cursor: 'pointer', transition: 'opacity 0.2s, transform 0.1s' },
  btnLoading: { opacity: 0.6, cursor: 'not-allowed' },
  adminHint: { marginTop: 20, padding: '10px 14px', background: 'rgba(255,140,0,0.07)', border: '1px solid rgba(255,140,0,0.2)', borderRadius: 8, fontSize: 12, color: 'rgba(255,200,100,0.8)', fontFamily: "'Space Mono', monospace", display: 'flex', alignItems: 'center', gap: 8 },
  adminHintDot: { width: 6, height: 6, borderRadius: '50%', background: '#ffa500', flexShrink: 0 }
};
