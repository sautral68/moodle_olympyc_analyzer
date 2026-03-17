import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { api } from '../api/index'
import { useLang } from '../i18n/index.jsx'
import { ChartSkeleton } from '../components/LoadingSkeleton'

const MEDAL = {
  0: { emoji: '🥇', bg: '#fffbeb', border: '#fde68a', color: '#d97706' },
  1: { emoji: '🥈', bg: '#f8fafc', border: '#e2e8f0', color: '#64748b' },
  2: { emoji: '🥉', bg: '#fff7ed', border: '#fed7aa', color: '#c2410c' },
}

function TopCard({ student, index }) {
  const medal = MEDAL[index]
  const isTop3 = index < 3
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: 'var(--shadow-lg)' }}
      style={{
        background: isTop3 ? medal.bg : 'var(--white)',
        borderRadius: 'var(--radius-md)', padding: '20px 24px',
        boxShadow: 'var(--shadow-md)',
        border: `1.5px solid ${isTop3 ? medal.border : 'var(--gray-100)'}`,
        transition: 'var(--transition)', cursor: 'default',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', right: 16, top: 8,
        fontSize: 64, fontWeight: 900, lineHeight: 1,
        color: isTop3 ? medal.border : 'var(--gray-100)',
        userSelect: 'none', pointerEvents: 'none',
      }}>
        {index + 1}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: isTop3 ? medal.border : 'var(--gray-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isTop3 ? 24 : 16, fontWeight: 700,
          color: isTop3 ? 'white' : 'var(--gray-500)', flexShrink: 0,
          boxShadow: isTop3 ? `0 4px 12px ${medal.border}` : 'none',
        }}>
          {isTop3 ? medal.emoji : index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 3 }}>
            {student.last_name} {student.first_name}
          </p>
          <p style={{ fontSize: 12, color: 'var(--gray-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {student.institution}
          </p>
        </div>
        <div style={{
          padding: '6px 14px', borderRadius: 20,
          background: isTop3 ? medal.color : 'var(--gray-100)',
          color: isTop3 ? 'white' : 'var(--gray-600)',
          fontSize: 15, fontWeight: 800, flexShrink: 0,
        }}>
          {student.final_grade.toFixed(2)}
        </div>
      </div>
    </motion.div>
  )
}

export default function TopStudents() {
  const { t } = useLang()
  const [topData, setTopData] = useState([])
  const [n, setN] = useState(10)
  const [loading, setLoading] = useState(true)

  async function load(count) {
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 250))
      const res = await api.getTop(count)
      setTopData(res.data.students || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(n) }, [])

  const handleN = (val) => { setN(val); load(val) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Шапка */}
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-md)',
        padding: '16px 24px', boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--gray-100)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--radius-sm)',
          background: 'var(--green-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Trophy size={18} color="var(--green-main)" />
        </div>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>
            {t.top.rating}
          </h2>
          <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{t.top.byGrade}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {[5, 10, 20, 50].map(val => (
            <motion.button
              key={val} whileTap={{ scale: 0.95 }}
              onClick={() => handleN(val)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none',
                background: n === val ? 'var(--green-main)' : 'var(--gray-100)',
                color: n === val ? 'white' : 'var(--gray-600)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              {t.top.title.split(' ')[0]} {val}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Топ 3 подиум */}
      {!loading && topData.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {topData.slice(0, 3).map((student, index) => (
            <TopCard key={student.individual_number} student={student} index={index} />
          ))}
        </div>
      )}

      {/* Таблица */}
      {loading ? <ChartSkeleton height={300} /> : (
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-100)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-100)' }}>
                {[t.top.colNum, t.top.colStudent, t.top.colInst, t.top.colId, t.top.colGrade].map((h, i) => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: i === 4 ? 'right' : 'left',
                    fontSize: 11, fontWeight: 600, color: 'var(--gray-400)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topData.map((student, index) => {
                const medal = MEDAL[index]
                const isTop3 = index < 3
                return (
                  <motion.tr
                    key={student.individual_number}
                    whileHover={{ background: 'var(--gray-50)' }}
                    style={{
                      borderBottom: '1px solid var(--gray-100)',
                      transition: 'background 0.15s',
                      background: isTop3 ? medal.bg : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 16px', width: 48 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: isTop3 ? medal.color : 'var(--gray-100)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: isTop3 ? 14 : 12,
                        color: isTop3 ? 'white' : 'var(--gray-500)', fontWeight: 700,
                      }}>
                        {isTop3 ? medal.emoji : index + 1}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-900)' }}>
                        {student.last_name} {student.first_name}
                      </p>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-500)', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {student.institution}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                      {student.individual_number}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span style={{
                        padding: '3px 12px', borderRadius: 20,
                        background: isTop3 ? medal.bg : 'var(--gray-50)',
                        color: isTop3 ? medal.color : 'var(--gray-600)',
                        border: `1px solid ${isTop3 ? medal.border : 'var(--gray-200)'}`,
                        fontSize: 13, fontWeight: 700,
                      }}>
                        {student.final_grade.toFixed(2)}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}