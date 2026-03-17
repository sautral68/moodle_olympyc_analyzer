import { motion } from 'framer-motion'

function Pulse({ width = '100%', height = 20, radius = 8, style = {} }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'var(--gray-100)',
        ...style,
      }}
    />
  )
}

export function StatCardSkeleton() {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-md)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--gray-100)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Pulse width={80} height={12} style={{ marginBottom: 10 }} />
          <Pulse width={60} height={28} style={{ marginBottom: 8 }} />
          <Pulse width={100} height={10} />
        </div>
        <Pulse width={44} height={44} radius={8} />
      </div>
    </div>
  )
}

export function ChartSkeleton({ height = 260 }) {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-md)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--gray-100)',
    }}>
      <Pulse width={140} height={16} style={{ marginBottom: 6 }} />
      <Pulse width={200} height={11} style={{ marginBottom: 20 }} />
      <Pulse width="100%" height={height} radius={8} />
    </div>
  )
}