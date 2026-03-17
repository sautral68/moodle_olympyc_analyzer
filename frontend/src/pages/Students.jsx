import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, ChevronUp, ChevronDown, X, Download, FileText } from 'lucide-react'
import { api } from '../api/index'
import { exportToCSV, exportToExcel } from '../utils/export'
import { useLang } from '../i18n/index.jsx'
import StudentModal from '../components/StudentModal'

function GradeBadge({ grade }) {
  const rounded = Math.round(grade)
  const config = {
    5: { bg: '#f0faf4', color: '#229954' },
    4: { bg: '#ebf5fb', color: '#2980b9' },
    3: { bg: '#fef9e7', color: '#d68910' },
    2: { bg: '#fdedec', color: '#c0392b' },
  }
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

function Toast({ message, type, onClose }) {
  const config = {
    success: { bg: '#f0faf4', border: 'var(--green-border)', color: 'var(--green-dark)', icon: '✅' },
    info:    { bg: '#ebf5fb', border: '#aed6f1', color: '#2980b9', icon: '📥' },
    error:   { bg: '#fdedec', border: '#f1948a', color: '#c0392b', icon: '❌' },
  }
  const c = config[type] || config.info
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', background: c.bg,
        border: `1px solid ${c.border}`, borderRadius: 'var(--radius-sm)',
        fontSize: 13, color: c.color, fontWeight: 500,
      }}
    >
      <span>{c.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', cursor: 'pointer', color: c.color, padding: 2,
      }}>
        <X size={14} />
      </button>
    </motion.div>
  )
}

export default function Students() {
  const { t } = useLang()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterGrade, setFilterGrade] = useState('all')
  const [sortField, setSortField] = useState('final_grade')
  const [sortDir, setSortDir] = useState('desc')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 250))
      const res = await api.getStudents()
      setStudents(res.data.students)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function showToast(message, type = 'info') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  function handleExport(type) {
    if (filtered.length === 0) return
    try {
      if (type === 'csv') {
        exportToCSV(filtered, 'olympiad_report')
        showToast(`${t.students.csvDownloaded} — ${filtered.length} ${t.header.students}`, 'success')
      } else {
        exportToExcel(filtered, 'olympiad_report')
        showToast(`${t.students.excelDownloaded}, ${filtered.length} ${t.header.students}`, 'success')
      }
    } catch (e) {
      showToast(`${t.students.exportError}: ` + e.message, 'error')
    }
  }

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const filtered = students
    .filter(s => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.institution.toLowerCase().includes(q) ||
        s.individual_number.toLowerCase().includes(q)
      const matchGrade = filterGrade === 'all' || Math.round(s.final_grade) === Number(filterGrade)
      return matchSearch && matchGrade
    })
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      if (sortField === 'final_grade') return (a.final_grade - b.final_grade) * mul
      if (sortField === 'last_name') return a.last_name.localeCompare(b.last_name) * mul
      if (sortField === 'institution') return a.institution.localeCompare(b.institution) * mul
      return 0
    })

  function SortIcon({ field }) {
    if (sortField !== field) return <ChevronUp size={14} style={{ opacity: 0.3 }} />
    return sortDir === 'asc'
      ? <ChevronUp size={14} color="var(--green-main)" />
      : <ChevronDown size={14} color="var(--green-main)" />
  }

  const thStyle = (field) => ({
    padding: '10px 14px', textAlign: 'left',
    fontSize: 11, fontWeight: 600, color: 'var(--gray-400)',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    cursor: field ? 'pointer' : 'default',
    userSelect: 'none', whiteSpace: 'nowrap',
    borderBottom: '1px solid var(--gray-100)',
    background: 'var(--gray-50)',
  })

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <Search size={16} style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--gray-400)',
            }} />
            <input
              type="text"
              placeholder={t.students.search}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px 9px 36px',
                border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)',
                fontSize: 13, outline: 'none',
                background: 'var(--white)', color: 'var(--gray-900)',
                transition: 'var(--transition)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--green-main)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
            />
          </div>

          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={{
            padding: '9px 12px', border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-sm)', fontSize: 13, outline: 'none',
            background: 'var(--white)', color: 'var(--gray-900)', cursor: 'pointer',
          }}>
            <option value="all">{t.students.allGrades}</option>
            <option value="5">5 — {t.students.excellent}</option>
            <option value="4">4 — {t.students.good}</option>
            <option value="3">3 — {t.students.medium}</option>
            <option value="2">2 — {t.students.bad}</option>
          </select>

          <div style={{
            padding: '9px 14px', background: 'var(--green-bg)',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--green-border)',
            fontSize: 13, fontWeight: 600, color: 'var(--green-dark)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Users size={14} />
            {loading ? '...' : `${filtered.length} ${t.students.outOf} ${students.length}`}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleExport('csv')} disabled={filtered.length === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
                background: 'var(--white)', border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius-sm)', color: 'var(--gray-600)',
                fontSize: 13, fontWeight: 500,
                cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
                opacity: filtered.length === 0 ? 0.5 : 1, transition: 'var(--transition)',
              }}>
              <Download size={14} /> CSV
            </motion.button>

            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleExport('excel')} disabled={filtered.length === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
                background: 'var(--green-bg)', border: '1px solid var(--green-border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--green-dark)',
                fontSize: 13, fontWeight: 600,
                cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
                opacity: filtered.length === 0 ? 0.5 : 1, transition: 'var(--transition)',
              }}>
              <FileText size={14} /> {t.header.report}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>

        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-100)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle(null)}>{t.students.colNum}</th>
                <th style={thStyle('last_name')} onClick={() => handleSort('last_name')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {t.students.colStudent} <SortIcon field="last_name" />
                  </div>
                </th>
                <th style={thStyle('institution')} onClick={() => handleSort('institution')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {t.students.colInstitution} <SortIcon field="institution" />
                  </div>
                </th>
                <th style={thStyle(null)}>{t.students.colDept}</th>
                <th style={thStyle(null)}>{t.students.colId}</th>
                <th style={thStyle('final_grade')} onClick={() => handleSort('final_grade')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {t.students.colGrade} <SortIcon field="final_grade" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} style={{ padding: '12px 14px' }}>
                        <div style={{
                          height: 14, borderRadius: 4, background: 'var(--gray-100)',
                          width: j === 1 ? '80%' : j === 2 ? '60%' : '40%',
                        }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{
                    padding: '40px', textAlign: 'center',
                    color: 'var(--gray-400)', fontSize: 14,
                  }}>
                    {t.students.notFound}
                  </td>
                </tr>
              ) : (
                filtered.map((student, index) => (
                  <motion.tr key={student.individual_number}
                    whileHover={{ background: 'var(--gray-50)' }}
                    onClick={() => setSelectedStudent(student)}
                    style={{
                      borderBottom: '1px solid var(--gray-100)',
                      transition: 'background 0.15s', cursor: 'pointer',
                    }}
                  >
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--gray-400)', fontWeight: 500 }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-900)' }}>
                        {student.last_name} {student.first_name}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>{student.email}</p>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--gray-600)', maxWidth: 180 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {student.institution}
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--gray-600)' }}>
                      {student.department}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                      {student.individual_number}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <GradeBadge grade={student.final_grade} />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && (
        <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </>
  )
}