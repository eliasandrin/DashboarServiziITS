import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TimelineNode from '../components/TimelineNode';
import EditNodeModal from '../components/EditNodeModal';

const API = process.env.REACT_APP_API_URL || '/api';

export default function TimelinePage({ onBack }) {
  const { user } = useAuth();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editNode, setEditNode] = useState(null);

  useEffect(() => {
    axios.get(`${API}/timeline`).then(r => {
      setNodes(r.data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (nodeId, courses) => {
    const r = await axios.put(`${API}/timeline/${nodeId}`, { courses });
    setNodes(prev => prev.map(n => n.id === nodeId ? r.data : n));
    setEditNode(null);
  };

  if (loading) return (
    <div style={styles.loading}>
      <div style={styles.spinner} />
      <span>Caricamento timeline...</span>
    </div>
  );

  return (
    <div style={styles.root}>
      <div style={styles.bg}>
        <div style={styles.grid} />
        <div style={styles.orb1} />
      </div>

      {/* Top Bar */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backBtn} onClick={onBack}>← Dashboard</button>
          <div style={styles.divider} />
          <span style={styles.logoIcon}>Ɣ</span>
          <span style={styles.pageTitle}>Timeline</span>
        </div>
        <div style={styles.headerRight}>
          {user?.role === 'admin' && (
            <div style={styles.adminBadge}>
              <span style={styles.adminDot} />
              MODALITÀ ADMIN — modifica attiva
            </div>
          )}
          <div style={styles.userChip}>
            <div style={styles.avatar}>{user?.nome?.[0]}{user?.cognome?.[0]}</div>
            <span style={styles.userName}>{user?.nome} {user?.cognome}</span>
          </div>
        </div>
      </header>

      {/* Timeline */}
      <main style={styles.main}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Timeline</h1>
          <p style={styles.subtitle}>Novembre 2025 - Luglio 2026</p>
        </div>

        <div style={styles.timelineWrapper}>
          <div style={styles.timelineLine} />
          <div style={styles.nodesContainer}>
            {nodes.map((node, idx) => (
              <TimelineNode
                key={node.id}
                node={node}
                index={idx}
                isAdmin={user?.role === 'admin'}
                onEdit={() => setEditNode(node)}
              />
            ))}
          </div>
        </div>
      </main>

      {editNode && (
        <EditNodeModal
          node={editNode}
          onClose={() => setEditNode(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

const styles = {
  root: { minHeight: '100vh', background: '#050a0f', fontFamily: "'Syne', sans-serif", color: '#e8f4f8', position: 'relative', overflow: 'hidden' },
  bg: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 },
  grid: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' },
  orb1: { position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)' },
  loading: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#050a0f', color: '#00d4ff', fontFamily: "'Space Mono', monospace", fontSize: 14 },
  spinner: { width: 32, height: 32, border: '2px solid rgba(0,212,255,0.2)', borderTopColor: '#00d4ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  header: { position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64, borderBottom: '1px solid rgba(0,212,255,0.1)', background: 'rgba(5,10,15,0.8)', backdropFilter: 'blur(20px)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, color: '#00d4ff', padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontFamily: "'Space Mono', monospace" },
  divider: { width: 1, height: 20, background: 'rgba(0,212,255,0.2)' },
  logoIcon: { fontSize: 18, color: '#00d4ff' },
  pageTitle: { fontSize: 13, color: 'rgba(180,210,220,0.7)', fontFamily: "'Space Mono', monospace", letterSpacing: 2 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  adminBadge: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 14px', background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: 20, fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#ffa500', letterSpacing: 1 },
  adminDot: { width: 6, height: 6, borderRadius: '50%', background: '#ffa500', boxShadow: '0 0 8px #ffa500' },
  userChip: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 24 },
  avatar: { width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#0088cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#050a0f' },
  userName: { fontSize: 13, fontWeight: 600 },
  main: { position: 'relative', zIndex: 1, padding: '48px 0 80px' },
  titleSection: { textAlign: 'center', marginBottom: 60 },
  title: { fontWeight: 800, fontSize: 40, letterSpacing: -1, margin: '0 0 8px' },
  subtitle: { color: '#00d4ff', fontFamily: "'Space Mono', monospace", fontSize: 13, margin: 0, letterSpacing: 3 },
  timelineWrapper: { position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '0 48px' },
  timelineLine: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.4) 5%, rgba(0,212,255,0.4) 95%, transparent)', transform: 'translateX(-50%)', zIndex: 0 },
  nodesContainer: { display: 'flex', flexDirection: 'column', gap: 0 },
};
