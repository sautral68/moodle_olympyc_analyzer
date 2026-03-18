import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Upload, FileText, CheckCircle, XCircle, X } from 'lucide-react'
import Sidebar from './Sidebar'
import UploadModal from './UploadModal'
import { exportToExcel } from '../utils/export'
import { useLang } from '../i18n/index.jsx'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

function Toast({ message, type, onClose }) {
  const config = {
    success: { bg: '#f0faf4', border: 'var(--green-border)', color: 'var(--green-dark)', icon: <CheckCircle size={15} /> },
    error:   { bg: '#fdedec', border: '#f1948a',             color: '#c0392b',            icon: <XCircle size={15} /> },
  }
  const c = config[type] || config.success
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', top: 16, right: 16, zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        background: c.bg, border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-lg)',
        fontSize: 13, color: c.color, fontWeight: 500,
        minWidth: 280, maxWidth: 400,
      }}
    >
      <span style={{ flexShrink: 0 }}>{c.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: c.color, padding: 2, flexShrink: 0,
      }}>
        <X size={14} />
      </button>
    </motion.div>
  )
}

export default function Layout() {
  const location = useLocation()
  const { lang, setLang, t } = useLang()
  const [showUpload, setShowUpload] = useState(false)
  const [uploadDone, setUploadDone] = useState(null)
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const pageTitles = {
    '/dashboard':    { title: t.dashboard.title,    subtitle: t.dashboard.subtitle },
    '/students':     { title: t.students.title,     subtitle: t.students.subtitle },
    '/subjects':     { title: t.subjects.title,     subtitle: t.subjects.subtitle },
    '/top':          { title: t.top.title,           subtitle: t.top.subtitle },
    '/institutions': { title: t.institutions.title,  subtitle: t.institutions.subtitle },
  }

  const meta = pageTitles[location.pathname] || { title: '', subtitle: '' }

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Цветная полоска сверху */}
          <div style={{
            height: 3, flexShrink: 0,
            background: 'linear-gradient(90deg, var(--green-dark) 0%, var(--green-main) 40%, var(--green-light) 70%, #58d68d 100%)',
            boxShadow: '0 2px 8px rgba(39,174,96,0.35)',
          }} />

          {/* Header */}
          <header style={{
            height: 'calc(var(--header-height) - 3px)',
            background: 'var(--white)',
            borderBottom: '1px solid var(--gray-100)',
            display: 'flex', alignItems: 'center',
            padding: '0 28px', flexShrink: 0,
            boxShadow: 'var(--shadow-sm)', gap: 16,
          }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
              >
                <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1.2 }}>
                  {meta.title}
                </h1>
                <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 1 }}>
                  {meta.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>

              {/* Переключатель языка */}
              <div style={{
                display: 'flex', gap: 3,
                background: 'var(--gray-100)',
                borderRadius: 8, padding: 3,
                marginRight: 8,
              }}>
                {['ru', 'en', 'tk'].map(l => (
                  <motion.button
                    key={l}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLang(l)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6, border: 'none',
                      background: lang === l
                        ? 'linear-gradient(135deg, var(--green-main), var(--green-light))'
                        : 'transparent',
                      color: lang === l ? 'white' : 'var(--gray-400)',
                      fontSize: 11, fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transition: 'var(--transition)',
                      boxShadow: lang === l ? '0 2px 6px rgba(39,174,96,0.3)' : 'none',
                    }}
                  >
                    {l}
                  </motion.button>
                ))}
              </div>

              {/* Сообщение после загрузки файла */}
              {uploadDone && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, color: 'var(--green-dark)', fontWeight: 500,
                  }}
                >
                  <CheckCircle size={14} color="var(--green-main)" />
                  {t.header.uploaded}: {uploadDone.students_count} {t.header.students}
                </motion.div>
              )}

              {/* Отчёт Excel */}
              <motion.button
                whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  import('../api/index').then(({ api }) => {
                    api.getStudents().then(res => {
                      const students = res.data.students
                      if (!students || students.length === 0) {
                        showToast(t.dashboard.noData, 'error')
                        return
                      }
                      exportToExcel(students, 'olympiad_report', t)
                      showToast(
                        `${t.students.excelDownloaded} — ${students.length} ${t.header.students}`,
                        'success'
                      )
                    }).catch(() => {
                      showToast(t.dashboard.noData, 'error')
                    })
                  })
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px',
                  background: 'var(--green-bg)',
                  border: '1px solid var(--green-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--green-dark)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'var(--transition)',
                }}
              >
                <FileText size={14} />
                {t.header.report}
              </motion.button>

              {/* Загрузить */}
              <motion.button
                whileHover={{ y: -1, boxShadow: 'var(--shadow-green)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowUpload(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 16px',
                  background: 'linear-gradient(135deg, var(--green-main), var(--green-light))',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  color: 'white', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'var(--transition)',
                  boxShadow: '0 2px 8px rgba(39,174,96,0.25)',
                }}
              >
                <Upload size={14} />
                {t.header.upload}
              </motion.button>
            </div>
          </header>

          {/* Page content */}
          <main style={{ flex: 1, overflow: 'auto', padding: '24px 28px', position: 'relative' }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={(result) => {
            setUploadDone(result)
            setShowUpload(false)
            showToast(
              `${t.header.uploaded}: ${result.students_count} ${t.header.students}`,
              'success'
            )
            setTimeout(() => setUploadDone(null), 4000)
            setTimeout(() => window.location.reload(), 500)
          }}
        />
      )}

      {/* Toast уведомление — поверх всего */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}