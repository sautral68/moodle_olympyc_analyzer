import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, FileSpreadsheet, CheckCircle } from 'lucide-react'
import { api } from '../api/index'
import { useLang } from '../i18n/index.jsx'

export default function UploadModal({ onClose, onSuccess }) {
  const { t } = useLang()
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = (f) => {
    if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      setError(t.uploadModal.onlyExcel)
      return
    }
    setFile(f)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    try {
      const res = await api.uploadExcel(file)
      onSuccess(res.data)
    } catch (e) {
      setError(t.uploadModal.errorPrefix + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px', width: 480,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>
              {t.uploadModal.title}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
              {t.uploadModal.subtitle}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--gray-400)', padding: 4,
          }}>
            <X size={20} />
          </button>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
          onClick={() => document.getElementById('upload-file-input').click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--green-main)' : file ? 'var(--green-light)' : 'var(--gray-200)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
            background: dragging ? 'var(--green-bg)' : file ? '#f8fff9' : 'var(--gray-50)',
            transition: 'var(--transition)', marginBottom: 16,
          }}
        >
          <input
            id="upload-file-input" type="file" accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />

          {/* Иконка */}
          <div style={{
            width: 56, height: 56, borderRadius: 14, marginBottom: 14,
            background: file ? 'var(--green-bg)' : 'var(--gray-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${file ? 'var(--green-border)' : 'var(--gray-200)'}`,
            margin: '0 auto 14px',
          }}>
            {file
              ? <CheckCircle size={28} color="var(--green-main)" />
              : <FileSpreadsheet size={28} color="var(--gray-400)" />
            }
          </div>

          {file ? (
            <>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--green-dark)' }}>{file.name}</p>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-600)' }}>
                {t.uploadModal.dragOrClick}
              </p>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
                {t.uploadModal.supported}
              </p>
            </>
          )}
        </div>

        {error && (
          <p style={{ fontSize: 13, color: 'var(--status-bad)', marginBottom: 12, textAlign: 'center' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px 0', background: 'var(--gray-100)',
            border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            fontSize: 14, fontWeight: 500, color: 'var(--gray-600)',
          }}>
            {t.uploadModal.cancel}
          </button>
          <button onClick={handleUpload} disabled={!file || loading} style={{
            flex: 2, padding: '10px 0',
            background: file && !loading ? 'var(--green-main)' : 'var(--gray-200)',
            border: 'none', borderRadius: 'var(--radius-sm)',
            cursor: file && !loading ? 'pointer' : 'not-allowed',
            fontSize: 14, fontWeight: 600,
            color: file && !loading ? 'white' : 'var(--gray-400)',
          }}>
            {loading ? t.uploadModal.uploading : t.uploadModal.upload}
          </button>
        </div>
      </motion.div>
    </div>
  )
}