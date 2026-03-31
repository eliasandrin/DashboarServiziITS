import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function EditNodeModal({ node, onClose, onSave }) {
  const [courses, setCourses] = useState(JSON.parse(JSON.stringify(node.courses)));
  const [saving, setSaving] = useState(false);

  const addCourse = () => {
    setCourses(c => [...c, { id: uuidv4(), name: '', professor: '', technologies: [] }]);
  };
  const removeCourse = (id) => setCourses(c => c.filter(x => x.id !== id));
  const updateCourse = (id, field, val) => setCourses(c => c.map(x => x.id === id ? { ...x, [field]: val } : x));
  const updateTech = (id, val) => {
    const techs = val.split(',').map(t => t.trim()).filter(Boolean);
    updateCourse(id, 'technologies', techs);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(node.id, courses);
    setSaving(false);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>Modifica Nodo</h2>
            <p style={styles.modalSub}>{node.month}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.coursesList}>
          {courses.map((course, idx) => (
            <div key={course.id} style={styles.courseEdit}>
              <div style={styles.courseEditHeader}>
                <span style={styles.courseNum}>Corso #{idx + 1}</span>
                <button style={styles.removeBtn} onClick={() => removeCourse(course.id)}>✕ Rimuovi</button>
              </div>
              <div style={styles.fields}>
                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Nome corso</label>
                    <input style={styles.input} value={course.name} placeholder="Es: Networking"
                      onChange={e => updateCourse(course.id, 'name', e.target.value)} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Professore</label>
                    <input style={styles.input} value={course.professor} placeholder="Es: Gobbo Daniele"
                      onChange={e => updateCourse(course.id, 'professor', e.target.value)} />
                  </div>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Tecnologie (separate da virgola)</label>
                  <input style={styles.input} value={course.technologies.join(', ')}
                    placeholder="Es: Router, IP, MAC Address, Switch"
                    onChange={e => updateTech(course.id, e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <button style={styles.addBtn} onClick={addCourse}>+ Aggiungi corso</button>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose}>Annulla</button>
          <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: 'rgba(8,16,26,0.98)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 0 60px rgba(0,212,255,0.08)' },
  modalHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '24px 28px 20px', borderBottom: '1px solid rgba(0,212,255,0.1)' },
  modalTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, margin: '0 0 4px', color: '#e8f4f8' },
  modalSub: { fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#00d4ff', margin: 0 },
  closeBtn: { background: 'none', border: 'none', color: 'rgba(180,210,220,0.5)', fontSize: 18, cursor: 'pointer' },
  coursesList: { flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 },
  courseEdit: { background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 10, padding: '16px' },
  courseEditHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  courseNum: { fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#00d4ff', letterSpacing: 2, textTransform: 'uppercase' },
  removeBtn: { background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 6, color: '#ff6b6b', fontSize: 12, padding: '4px 10px', cursor: 'pointer', fontFamily: "'Space Mono', monospace" },
  fields: { display: 'flex', flexDirection: 'column', gap: 10 },
  fieldRow: { display: 'flex', gap: 10 },
  field: { display: 'flex', flexDirection: 'column', gap: 5, flex: 1 },
  label: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(0,212,255,0.6)', letterSpacing: 2, textTransform: 'uppercase' },
  input: { padding: '9px 12px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 7, color: '#e8f4f8', fontSize: 13, fontFamily: "'Syne', sans-serif", outline: 'none' },
  addBtn: { alignSelf: 'flex-start', background: 'rgba(0,212,255,0.08)', border: '1px dashed rgba(0,212,255,0.3)', borderRadius: 8, color: '#00d4ff', padding: '10px 18px', cursor: 'pointer', fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 600 },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '16px 28px 24px', borderTop: '1px solid rgba(0,212,255,0.1)' },
  cancelBtn: { padding: '10px 20px', background: 'rgba(180,210,220,0.07)', border: '1px solid rgba(180,210,220,0.15)', borderRadius: 8, color: 'rgba(180,210,220,0.7)', fontSize: 14, cursor: 'pointer', fontFamily: "'Syne', sans-serif" },
  saveBtn: { padding: '10px 24px', background: 'linear-gradient(135deg,#00d4ff,#0088cc)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Syne', sans-serif" },
};
