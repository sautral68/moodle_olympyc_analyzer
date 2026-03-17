import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, BookOpen,
  Trophy, Building2, Activity
} from 'lucide-react'
import { useLang } from '../i18n/index.jsx'

export default function Sidebar() {
  const { t } = useLang()

  const navItems = [
    { to: '/dashboard',    icon: LayoutDashboard, label: t.nav.dashboard },
    { to: '/students',     icon: Users,           label: t.nav.students },
    { to: '/subjects',     icon: BookOpen,        label: t.nav.subjects },
    { to: '/top',          icon: Trophy,          label: t.nav.top },
    { to: '/institutions', icon: Building2,       label: t.nav.institutions },
  ]

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      background: 'linear-gradient(180deg, #1a3a2a 0%, #0d2018 60%, #0a1a12 100%)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(39,174,96,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 40, left: -40,
        width: 140, height: 140, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,204,113,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        height: 'var(--header-height)',
        display: 'flex', alignItems: 'center',
        padding: '0 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        gap: 12, position: 'relative', zIndex: 1,
      }}>
        <div style={{ position: 'relative' }}>
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'linear-gradient(135deg, var(--green-main), var(--green-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(39,174,96,0.4)',
              position: 'relative', zIndex: 1,
            }}
          >
            <Activity size={18} color="white" strokeWidth={2.5} />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: 0, borderRadius: 11,
              background: 'rgba(39,174,96,0.3)', zIndex: 0,
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
            {t.nav.appName}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
            {t.nav.appSub}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1, padding: '16px 10px',
        display: 'flex', flexDirection: 'column', gap: 3,
        position: 'relative', zIndex: 1,
      }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: isActive ? 'rgba(39,174,96,0.18)' : 'transparent',
                  color: isActive ? '#2ecc71' : 'rgba(255,255,255,0.5)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14, transition: 'all 0.2s',
                  cursor: 'pointer', position: 'relative', overflow: 'hidden',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBar"
                    style={{
                      position: 'absolute', left: 0, top: '20%',
                      width: 3, height: '60%',
                      background: 'linear-gradient(180deg, var(--green-light), var(--green-main))',
                      borderRadius: '0 3px 3px 0',
                      boxShadow: '0 0 8px rgba(46,204,113,0.6)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        position: 'relative', zIndex: 1,
      }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          Olympic Analyzer v1.0
        </p>
      </div>
    </aside>
  )
}