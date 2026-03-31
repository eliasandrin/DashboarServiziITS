import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserPanel from '../components/UserPanel';
import TimelinePage from './TimelinePage';

const services = [
  { id: 'timeline', icon: '◈', label: 'Timeline', desc: 'Linea del tempo interattiva con corsi e tecnologie', color: '#00d4ff' },
  { id: 'coming1', icon: '◉', label: 'Prossimamente', desc: 'Nuovo servizio in arrivo', color: '#444', locked: true },
  { id: 'coming2', icon: '◎', label: 'Prossimamente', desc: 'Nuovo servizio in arrivo', color: '#444', locked: true },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [activeService, setActiveService] = useState(null);

  if (activeService === 'timeline') {
    return <TimelinePage onBack={() => setActiveService(null)} />;
  }

  return (
    <div style={styles.root}>
      <div style={styles.bg}>
        <div style={styles.grid} />
        <div style={styles.orb1} />
        <div style={styles.orb2} />
      </div>

      {/* Top Bar */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logoIcon}>Ɣ</span>
          <span style={styles.logoText}>CLOUD<span style={styles.logoAccent}>gamma</span></span>
          <div style={styles.divider} />
          <span style={styles.pageTitle}>Dashboard</span>
        </div>
        <div style={styles.headerRight}>
          {user?.role === 'admin' && (
            <div style={styles.adminBadge}>
              <span style={styles.adminDot} />
              ADMIN
            </div>
          )}
          <button style={styles.userBtn} onClick={() => setUserPanelOpen(true)}>
            <div style={styles.avatar}>
              {user?.nome?.[0]}{user?.cognome?.[0]}
            </div>
            <span style={styles.userName}>{user?.nome} {user?.cognome}</span>
            <span style={styles.chevron}>›</span>
          </button>
          <button style={styles.logoutBtn} onClick={logout}>Esci</button>
        </div>
      </header>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>
            Benvenuto, <span style={styles.welcomeName}>{user?.nome}</span>
          </h1>
          <p style={styles.welcomeSub}>Seleziona un servizio per iniziare</p>
        </div>

        <div style={styles.servicesGrid}>
          {services.map(s => (
            <button
              key={s.id}
              style={{ ...styles.serviceCard, ...(s.locked ? styles.serviceCardLocked : {}) }}
              onClick={() => !s.locked && setActiveService(s.id)}
              disabled={s.locked}
            >
              <div style={{ ...styles.serviceIcon, color: s.color, borderColor: s.color + '40', background: s.color + '10' }}>
                {s.icon}
              </div>
              <div style={styles.serviceInfo}>
                <h3 style={{ ...styles.serviceLabel, color: s.locked ? '#555' : '#e8f4f8' }}>{s.label}</h3>
                <p style={{ ...styles.serviceDesc, color: s.locked ? '#333' : 'rgba(180,210,220,0.5)' }}>{s.desc}</p>
              </div>
              {!s.locked && (
                <div style={{ ...styles.serviceArrow, color: s.color }}>→</div>
              )}
              {s.locked && <div style={styles.lockIcon}>🔒</div>}
            </button>
          ))}
        </div>
      </main>

      {userPanelOpen && <UserPanel onClose={() => setUserPanelOpen(false)} />}
    </div>
  );
}

const styles = {
  root: { minHeight: '100vh', background: '#050a0f', fontFamily: "'Syne', sans-serif", color: '#e8f4f8', position: 'relative', overflow: 'hidden' },
  bg: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 },
  grid: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' },
  orb1: { position: 'absolute', top: '-15%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)' },
  orb2: { position: 'absolute', bottom: '-20%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,0,0.06) 0%, transparent 70%)' },
  header: { position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64, borderBottom: '1px solid rgba(0,212,255,0.1)', background: 'rgba(5,10,15,0.8)', backdropFilter: 'blur(20px)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon: { fontSize: 20, color: '#00d4ff' },
  logoText: { fontWeight: 800, fontSize: 16, color: '#e8f4f8', letterSpacing: 3 },
  logoAccent: { color: '#00d4ff' },
  divider: { width: 1, height: 20, background: 'rgba(0,212,255,0.2)' },
  pageTitle: { fontSize: 13, color: 'rgba(180,210,220,0.5)', fontFamily: "'Space Mono', monospace", letterSpacing: 2 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  adminBadge: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: 20, fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#ffa500', letterSpacing: 2 },
  adminDot: { width: 6, height: 6, borderRadius: '50%', background: '#ffa500', boxShadow: '0 0 6px #ffa500' },
  userBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 24, cursor: 'pointer', color: '#e8f4f8', fontFamily: "'Syne', sans-serif', transition: 'all 0.2s" },
  avatar: { width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#0088cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#050a0f' },
  userName: { fontSize: 13, fontWeight: 600 },
  chevron: { fontSize: 16, color: 'rgba(0,212,255,0.5)' },
  logoutBtn: { padding: '6px 14px', background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 8, color: '#ff6b6b', fontSize: 13, fontFamily: "'Syne', sans-serif", cursor: 'pointer', letterSpacing: 1 },
  main: { position: 'relative', zIndex: 1, padding: '60px 48px' },
  welcomeSection: { marginBottom: 48 },
  welcomeTitle: { fontWeight: 800, fontSize: 36, margin: '0 0 8px', letterSpacing: -1 },
  welcomeName: { color: '#00d4ff' },
  welcomeSub: { color: 'rgba(180,210,220,0.5)', fontFamily: "'Space Mono', monospace", fontSize: 13, margin: 0 },
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 },
  serviceCard: { display: 'flex', alignItems: 'center', gap: 20, padding: '28px 24px', background: 'rgba(10,20,30,0.7)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.25s', backdropFilter: 'blur(10px)', width: '100%' },
  serviceCardLocked: { cursor: 'not-allowed', opacity: 0.4 },
  serviceIcon: { width: 52, height: 52, borderRadius: 12, border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 },
  serviceInfo: { flex: 1 },
  serviceLabel: { fontWeight: 700, fontSize: 16, margin: '0 0 4px', letterSpacing: 0.5 },
  serviceDesc: { fontSize: 13, margin: 0, fontFamily: "'Space Mono', monospace", lineHeight: 1.5 },
  serviceArrow: { fontSize: 20, fontWeight: 700, flexShrink: 0 },
  lockIcon: { fontSize: 16, flexShrink: 0 },
};
