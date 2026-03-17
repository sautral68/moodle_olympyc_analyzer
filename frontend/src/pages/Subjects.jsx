import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { BookOpen, TrendingUp, Users, Award } from 'lucide-react'
import { api } from '../api/index'
import { useLang } from '../i18n/index.jsx'
import { ChartSkeleton, StatCardSkeleton } from '../components/LoadingSkeleton'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius-sm)', padding: '10px 14px',
      boxShadow: 'var(--shadow-md)', fontSize: 13,
    }}>
      <p style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || 'var(--green-main)' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

function GradeBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--gray-600)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{count} ({pct.toFixed(0)}%)</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--gray-100)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ height: '100%', borderRadius: 3, background: color }}
        />
      </div>
    </div>
  )
}

function SubjectCard({ subject, isSelected, onClick, t }) {
  const avgColor = subject.average_grade >= 4.5 ? 'var(--status-excellent)'
    : subject.average_grade >= 3.5 ? 'var(--status-good)'
    : subject.average_grade >= 2.5 ? 'var(--status-medium)'
    : 'var(--status-bad)'

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: 'var(--shadow-lg)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: 'var(--white)', borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        boxShadow: isSelected ? 'var(--shadow-green)' : 'var(--shadow-md)',
        border: isSelected ? '1.5px solid var(--green-main)' : '1px solid var(--gray-100)',
        cursor: 'pointer', transition: 'var(--transition)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-sm)',
          background: isSelected ? 'var(--green-bg)' : 'var(--gray-50)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <BookOpen size={16} color={isSelected ? 'var(--green-main)' : 'var(--gray-400)'} />
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: avgColor }}>
          {subject.average_grade.toFixed(2)}
        </span>
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 4, lineHeight: 1.3 }}>
        {subject.subject_name}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Users size={11} color="var(--gray-400)" />
        <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
          {subject.student_count} {t.subjects.studentCount}
        </span>
      </div>
    </motion.div>
  )
}

export default function Subjects() {
  const { t } = useLang()
  const [subjects, setSubjects] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        await new Promise(r => setTimeout(r, 250))
        const res = await api.getSubjectsStats()
        const data = res.data.subjects || []
        setSubjects(data)
        if (data.length > 0) setSelected(data[0])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const PALETTE = ['#27ae60', '#3498db', '#9b59b6', '#f39c12', '#e74c3c', '#1abc9c', '#e67e22']
  const barData = subjects.map(s => ({
    name: s.subject_name.length > 12 ? s.subject_name.slice(0, 12) + '…' : s.subject_name,
    avg: s.average_grade,
  }))
  const barColors = subjects.map((_, i) => {
    const hue = (i * 137.5) % 360
    return `hsl(${hue}, 65%, 50%)`
  })

  const distData = selected ? [
    { label: t.subjects.grade5, count: selected.distribution[5] || 0, color: '#27ae60' },
    { label: t.subjects.grade4, count: selected.distribution[4] || 0, color: '#3498db' },
    { label: t.subjects.grade3, count: selected.distribution[3] || 0, color: '#f39c12' },
    { label: t.subjects.grade2, count: selected.distribution[2] || 0, color: '#e74c3c' },
  ] : []

  const totalDist = distData.reduce((s, d) => s + d.count, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {loading ? <ChartSkeleton height={200} /> : (
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-md)',
          padding: '20px 24px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-100)',
        }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>
              {t.subjects.avgBySubject}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
              {t.subjects.clickCard}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} ticks={[2, 3, 4, 5]} tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--gray-50)' }} />
              <Bar dataKey="avg" name={t.subjects.colAvg} radius={[6, 6, 0, 0]}
                shape={(props) => {
                  const { x, y, width, height, index } = props
                  return <rect x={x} y={y} width={width} height={height} fill={barColors[index]} rx={6} ry={6} />
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.subject_name}
              subject={subject}
              t={t}
              isSelected={selected?.subject_name === subject.subject_name}
              onClick={() => setSelected(subject)}
            />
          ))}
        </div>
      )}

      {!loading && selected && (
        <motion.div
          key={selected.subject_name}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            background: 'var(--white)', borderRadius: 'var(--radius-md)',
            padding: '20px 24px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-100)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-sm)',
              background: 'var(--green-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={18} color="var(--green-main)" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>
                {selected.subject_name}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>{t.subjects.detailed}</p>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 24 }}>
              {[
                { label: t.subjects.colStudents, value: selected.student_count,            icon: <Users size={14} /> },
                { label: t.subjects.colAvg,      value: selected.average_grade.toFixed(2), icon: <TrendingUp size={14} /> },
                { label: t.subjects.colMin,      value: selected.min_grade,                icon: <Award size={14} /> },
                { label: t.subjects.colMax,      value: selected.max_grade,                icon: <Award size={14} color="var(--green-main)" /> },
              ].map(kpi => (
                <div key={kpi.label} style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: 'var(--gray-400)', marginBottom: 2 }}>
                    {kpi.icon}
                    <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                      {kpi.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)' }}>{kpi.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: 480 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              {t.subjects.distTitle}
            </p>
            {distData.map(d => (
              <GradeBar key={d.label} label={d.label} count={d.count} total={totalDist} color={d.color} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}