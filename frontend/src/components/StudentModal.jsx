import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Building2, BookOpen, Hash, TrendingUp } from 'lucide-react'
import { useLang } from '../i18n/index.jsx'

function GradeBadge({ grade }) {
  const config = {
    5: { bg: '#f0faf4', color: '#229954' },
    4: { bg: '#ebf5fb', color: '#2980b9' },
    3: { bg: '#fef9e7', color: '#d68910' },
    2: { bg: '#fdedec', color: '#c0392b' },
  }
  const rounded = Math.round(grade)
  const c = config[rounded] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' }
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20,
      background: c.bg, color: c.color, fontSize: 12, fontWeight: 600,
    }}>
      {typeof grade === 'number' ? grade.toFixed(2) : grade}
    </span>
  )
}

export default function StudentModal({ student, onClose }) {
  const { t } = useLang()
  if (!student) return null

  const subjects = Object.entries(student.subject_grades || {}).sort((a, b) => b[1] - a[1])
  const avgSubject = subjects.length > 0
    ? (subjects.reduce((s, [, g]) => s + g, 0) / subjects.length).toFixed(2)
    : '—'

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--white)', borderRadius: 'var(--radius-lg)',
            width: '100%', maxWidth: 560, maxHeight: '85vh',
            overflow: 'hidden', boxShadow: 'var(--shadow-lg)',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Шапка */}
          <div style={{
            background: 'linear-gradient(135deg, var(--green-dark), var(--green-light))',
            padding: '24px 28px', position: 'relative',
          }}>
            <button onClick={onClose} style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white',
            }}>
              <X size={16} />
            </button>

            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: 'white',
              marginBottom: 12, border: '2px solid rgba(255,255,255,0.4)',
            }}>
              {student.first_name[0]}{student.last_name[0]}
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 4 }}>
              {student.last_name} {student.first_name}
            </h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Building2 size={13} color="rgba(255,255,255,0.8)" />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>{student.institution}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Mail size={13} color="rgba(255,255,255,0.8)" />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>{student.email}</span>
              </div>
            </div>
          </div>

          {/* Тело */}
          <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: t.studentModal.finalGrade,    value: student.final_grade.toFixed(2), icon: <TrendingUp size={14} />, highlight: true },
                { label: t.studentModal.avgBySubjects, value: avgSubject,                      icon: <BookOpen size={14} /> },
                { label: t.studentModal.individualNum, value: student.individual_number,        icon: <Hash size={14} />, mono: true },
              ].map(kpi => (
                <div key={kpi.label} style={{
                  padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                  background: kpi.highlight ? 'var(--green-bg)' : 'var(--gray-50)',
                  border: `1px solid ${kpi.highlight ? 'var(--green-border)' : 'var(--gray-100)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, color: 'var(--gray-400)' }}>
                    {kpi.icon}
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {kpi.label}
                    </span>
                  </div>
                  <p style={{
                    fontSize: kpi.mono ? 13 : 20, fontWeight: 700,
                    color: kpi.highlight ? 'var(--green-dark)' : 'var(--gray-900)',
                    fontFamily: kpi.mono ? 'monospace' : 'inherit',
                  }}>
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              {t.studentModal.gradesBySubj}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {subjects.map(([subject, grade]) => {
                const colors = { 5: '#27ae60', 4: '#3498db', 3: '#f39c12', 2: '#e74c3c' }
                const color = colors[grade] || 'var(--gray-400)'
                const pct = ((grade - 2) / 3) * 100
                return (
                  <div key={subject} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--gray-50)', border: '1px solid var(--gray-100)',
                  }}>
                    <span style={{ fontSize: 13, color: 'var(--gray-700)', flex: 1, fontWeight: 500 }}>
                      {subject}
                    </span>
                    <div style={{ width: 120, height: 5, borderRadius: 3, background: 'var(--gray-200)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        style={{ height: '100%', borderRadius: 3, background: color }}
                      />
                    </div>
                    <GradeBadge grade={grade} />
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}