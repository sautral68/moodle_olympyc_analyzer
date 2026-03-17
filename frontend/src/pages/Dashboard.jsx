import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Users, TrendingUp, Award, BookOpen } from 'lucide-react'
import { api } from '../api/index'
import { useLang } from '../i18n/index.jsx'
import StatCard from '../components/StatCard'
import { StatCardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton'

const GRADE_COLORS = {
  5: '#27ae60',
  4: '#3498db',
  3: '#f39c12',
  2: '#e74c3c',
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius-sm)', padding: '10px 14px',
      boxShadow: 'var(--shadow-md)', fontSize: 13, pointerEvents: 'none',
    }}>
      <p style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: 4 }}>
        {payload[0]?.name || label}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color || 'var(--green-main)' }}>
          <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--radius-md)',
      padding: '20px 24px', boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--gray-100)', ...style
    }}>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const { t } = useLang()
  const [stats, setStats] = useState(null)
  const [top, setTop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, topRes] = await Promise.all([api.getStats(), api.getTop(5)])
        await new Promise(r => setTimeout(r, 250))
        setStats(statsRes.data)
        setTop(topRes.data)
      } catch (e) {
        setError(t.dashboard.noData)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (error) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '60vh', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ fontSize: 40 }}>⚠️</div>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-900)' }}>{error}</p>
        <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>{t.dashboard.noDataHint}</p>
      </div>
    )
  }

  const pieData = stats ? [
    { name: t.grades.excellent, value: stats.grade_distribution.grade_5, color: '#27ae60' },
    { name: t.grades.good,      value: stats.grade_distribution.grade_4, color: '#3498db' },
    { name: t.grades.medium,    value: stats.grade_distribution.grade_3, color: '#f39c12' },
    { name: t.grades.bad,       value: stats.grade_distribution.grade_2, color: '#e74c3c' },
  ].filter(d => d.value > 0) : []

  const barData = top?.students?.map(s => ({
    name: `${s.last_name} ${s.first_name[0]}.`,
    grade: s.final_grade,
  })) || []

  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#94a3b8', '#94a3b8']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPI карточки */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {loading ? Array(5).fill(0).map((_, i) => <StatCardSkeleton key={i} />) : (
          <>
            <StatCard index={0} title={t.dashboard.totalStudents}
              value={stats.total_students} subtitle={t.dashboard.participants}
              icon={<Users size={20} color="var(--green-main)" />} color="var(--green-main)" />
            <StatCard index={1} title={t.dashboard.avgGrade}
              value={stats.average_final_grade.toFixed(2)} subtitle={t.dashboard.byFinalGrades}
              icon={<TrendingUp size={20} color="#3498db" />} color="#3498db" />
            <StatCard index={2} title={t.dashboard.maxGrade}
              value={stats.max_final_grade.toFixed(2)} subtitle={t.dashboard.bestResult}
              icon={<Award size={20} color="#f39c12" />} color="#f39c12" />
            <StatCard index={3} title={t.dashboard.minGrade}
              value={stats.min_final_grade.toFixed(2)} subtitle={t.dashboard.worstResult}
              icon={<Award size={20} color="#e74c3c" />} color="#e74c3c" />
            <StatCard index={4} title={t.dashboard.median}
              value={stats.median_final_grade.toFixed(2)} subtitle={t.dashboard.medianValue}
              icon={<BookOpen size={20} color="#9b59b6" />} color="#9b59b6" />
          </>
        )}
      </div>

      {/* Графики */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {loading ? <ChartSkeleton /> : (
          <Card>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>
                {t.dashboard.gradeDist}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
                {t.dashboard.byFinalGrades}
              </p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000, outline: 'none' }} />
                <Legend formatter={(value) => (
                  <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>{value}</span>
                )} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {loading ? <ChartSkeleton /> : (
          <Card>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>
                {t.dashboard.bestStudents}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
                {t.dashboard.top5byGrade}
              </p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} ticks={[2, 3, 4, 5]} tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--gray-50)' }} />
                <Bar dataKey="grade" radius={[6, 6, 0, 0]}>
                  {barData.map((_, index) => (
                    <Cell key={index} fill={medalColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Топ 5 список */}
      {loading ? <ChartSkeleton height={160} /> : (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>
              {t.dashboard.top5title}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
              {t.dashboard.winners}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {top?.students?.map((student, index) => (
              <motion.div
                key={student.individual_number}
                whileHover={{ x: 4 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  background: index === 0 ? '#fffbeb' : 'var(--gray-50)',
                  border: `1px solid ${index === 0 ? '#fde68a' : 'var(--gray-100)'}`,
                  transition: 'var(--transition)', cursor: 'default',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--gray-200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700,
                  color: index < 3 ? 'white' : 'var(--gray-600)', flexShrink: 0,
                }}>
                  {index < 3 ? ['🥇','🥈','🥉'][index] : index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>
                    {student.last_name} {student.first_name}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{student.institution}</p>
                </div>
                <div style={{
                  padding: '4px 12px', borderRadius: 20,
                  background: student.final_grade >= 4.5 ? 'var(--green-bg)' : 'var(--gray-100)',
                  color: student.final_grade >= 4.5 ? 'var(--green-dark)' : 'var(--gray-600)',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {student.final_grade.toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}