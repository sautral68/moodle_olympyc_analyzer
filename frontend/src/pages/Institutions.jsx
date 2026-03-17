import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { Building2, Users, TrendingUp, Layers } from 'lucide-react'
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
        <p key={i} style={{ color: p.fill }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

const INST_COLORS = ['#27ae60','#3498db','#9b59b6','#f39c12','#e74c3c','#1abc9c','#2980b9','#8e44ad','#d35400','#c0392b']

export default function Institutions() {
  const { t } = useLang()
  const [institutions, setInstitutions] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        await new Promise(r => setTimeout(r, 250))
        const res = await api.getInstitutionsStats()
        const data = res.data || []
        setInstitutions(data)
        if (data.length > 0) setSelected(data[0])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const shortName = (name) => {
    const words = name.split(' ')
    return words.length > 1 ? words.map(w => w[0]).join('').toUpperCase() : name.slice(0, 6)
  }

  const barData = institutions.map((inst, i) => ({
    name: shortName(inst.institution_name),
    fullName: inst.institution_name,
    avg: inst.average_final_grade,
    color: INST_COLORS[i % INST_COLORS.length],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {loading ? <ChartSkeleton height={220} /> : (
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-md)',
          padding: '20px 24px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-100)',
        }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>
              {t.institutions.avgByInst}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
              {t.institutions.sortedDesc}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} ticks={[2, 3, 4, 5]} tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--gray-50)' }} />
              <Bar dataKey="avg" name={t.institutions.colAvg} radius={[6, 6, 0, 0]}
                shape={(props) => {
                  const { x, y, width, height, index } = props
                  return <rect x={x} y={y} width={width} height={height} fill={INST_COLORS[index % INST_COLORS.length]} rx={6} ry={6} />
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {Array(3).fill(0).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {institutions.map((inst, index) => {
            const color = INST_COLORS[index % INST_COLORS.length]
            const isSelected = selected?.institution_name === inst.institution_name
            const avgColor = inst.average_final_grade >= 4.5 ? '#27ae60'
              : inst.average_final_grade >= 3.5 ? '#3498db'
              : inst.average_final_grade >= 2.5 ? '#f39c12' : '#e74c3c'

            return (
              <motion.div
                key={inst.institution_name}
                whileHover={{ y: -2, boxShadow: 'var(--shadow-lg)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(inst)}
                style={{
                  background: 'var(--white)', borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  boxShadow: isSelected ? `0 4px 20px ${color}30` : 'var(--shadow-md)',
                  border: isSelected ? `1.5px solid ${color}` : '1px solid var(--gray-100)',
                  cursor: 'pointer', transition: 'var(--transition)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 'var(--radius-sm)',
                    background: `${color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Building2 size={16} color={color} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-900)', lineHeight: 1.35, paddingTop: 2 }}>
                    {inst.institution_name}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={12} color="var(--gray-400)" />
                      <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                        {inst.students_count} {t.institutions.studShort}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Layers size={12} color="var(--gray-400)" />
                      <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                        {inst.departments.length} {t.institutions.deptShort}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: avgColor }}>
                    {inst.average_final_grade.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {!loading && selected && (
        <motion.div
          key={selected.institution_name}
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
              <Building2 size={18} color="var(--green-main)" />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>
                {selected.institution_name}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{t.institutions.detailed}</p>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 28 }}>
              {[
                { label: t.institutions.colStudents, value: selected.students_count,                icon: <Users size={14} /> },
                { label: t.institutions.colAvg,      value: selected.average_final_grade.toFixed(2), icon: <TrendingUp size={14} /> },
                { label: t.institutions.colDepts,    value: selected.departments.length,             icon: <Layers size={14} /> },
              ].map(kpi => (
                <div key={kpi.label} style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: 'var(--gray-400)', marginBottom: 2 }}>
                    {kpi.icon}
                    <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                      {kpi.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)' }}>{kpi.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              {t.institutions.departments}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {selected.departments.map(dept => (
                <span key={dept} style={{
                  padding: '5px 12px', borderRadius: 20,
                  background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
                  fontSize: 13, color: 'var(--gray-600)', fontWeight: 500,
                }}>
                  {dept}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}