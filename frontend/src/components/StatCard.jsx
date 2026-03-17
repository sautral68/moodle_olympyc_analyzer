import { motion } from 'framer-motion'

export default function StatCard({ title, value, subtitle, icon, color = 'var(--green-main)', index = 0 }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: 'var(--shadow-lg)' }}
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--gray-100)',
        cursor: 'default',
        transition: 'var(--transition)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            {title}
          </p>
          <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1 }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6 }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{
          width: 44, height: 44,
          borderRadius: 'var(--radius-sm)',
          background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}