import React, { useState } from 'react';

export default function TimelineNode({ node, index, isAdmin, onEdit }) {
  const [open, setOpen] = useState(false);
  const isLeft = index % 2 === 0;
  const hasCourses = node.courses && node.courses.length > 0;

  return (
    <div style={{ ...styles.nodeRow, flexDirection: isLeft ? 'row' : 'row-reverse' }}>
      <div style={{ ...styles.cardWrap, alignItems: isLeft ? 'flex-end' : 'flex-start', paddingRight: isLeft ? 32 : 0, paddingLeft: isLeft ? 0 : 32 }}>
        <div
          style={{
            ...styles.card,
            ...(open ? styles.cardOpen : {}),
            cursor: hasCourses ? 'pointer' : 'default',
            border: open ? '1px solid rgba(0,212,255,0.35)' : '1px solid rgba(0,212,255,0.12)'
          }}
          onClick={() => hasCourses && setOpen(o => !o)}
        >
          <div style={styles.cardTop}>
            <span style={styles.monthLabel}>{node.month}</span>
            <div style={styles.cardActions}>
              {isAdmin && (
                <button
                  style={styles.editBtn}
                  onClick={e => { e.stopPropagation(); onEdit(); }}
                  title="Modifica nodo"
                >
                  ✎
                </button>
              )}
              {hasCourses && (
                <span style={{ ...styles.toggleIcon, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
              )}
            </div>
          </div>

          {!hasCourses && (
            <p style={styles.emptyMsg}>
              {isAdmin ? 'Nessun corso — clicca ✎ per aggiungerne' : 'Nessun corso registrato'}
            </p>
          )}

          {open && hasCourses && (
            <div style={styles.coursesSection}>
              {node.courses.map(course => (
                <div key={course.id} style={styles.courseCard}>
                  <div style={styles.courseHeader}>
                    <span style={styles.courseName}>{course.name}</span>
                    <span style={styles.professor}>👤 {course.professor}</span>
                  </div>
                  <div style={styles.techWrap}>
                    {course.technologies.map((t, i) => (
                      <span key={i} style={styles.techTag}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={styles.emptySide} />
    </div>
  );
}

const styles = {
  nodeRow: { display: 'flex', alignItems: 'flex-start', marginBottom: 0, minHeight: 80 },
  cardWrap: { flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 0' },
  card: { background: 'rgba(10,20,30,0.8)', borderRadius: 12, padding: '16px 20px', backdropFilter: 'blur(10px)', transition: 'all 0.25s', maxWidth: 420, width: '100%' },
  cardOpen: { background: 'rgba(0,30,50,0.9)', boxShadow: '0 0 30px rgba(0,212,255,0.06)' },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  monthLabel: { fontWeight: 700, fontSize: 15, color: '#e8f4f8', letterSpacing: 0.5 },
  cardActions: { display: 'flex', alignItems: 'center', gap: 8 },
  editBtn: { background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: 6, color: '#ffa500', width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  toggleIcon: { color: '#00d4ff', fontSize: 16, transition: 'transform 0.2s', display: 'inline-block' },
  emptyMsg: { margin: '8px 0 0', fontSize: 12, color: 'rgba(180,210,220,0.3)', fontFamily: "'Space Mono', monospace" },
  coursesSection: { marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  courseCard: { background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 8, padding: '12px 14px' },
  courseHeader: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 },
  courseName: { fontWeight: 700, fontSize: 14, color: '#00d4ff' },
  professor: { fontSize: 12, color: 'rgba(180,210,220,0.6)', fontFamily: "'Space Mono', monospace" },
  techWrap: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  techTag: { padding: '3px 8px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 20, fontSize: 11, color: 'rgba(180,210,220,0.8)', fontFamily: "'Space Mono', monospace" },
  dotWrap: { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 22, flexShrink: 0, zIndex: 1, width: 60 },
  dotSymbol: { color: '#00d4ff', fontSize: 20, lineHeight: 1 },
  emptySide: { flex: 1 },
};