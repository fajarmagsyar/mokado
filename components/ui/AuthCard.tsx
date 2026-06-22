'use client'

import { motion } from 'framer-motion'
import { DecorBg } from './DecorBg'
import { FlagIcon } from './FlagIcon'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{ background: 'var(--cream)' }}
    >
      <DecorBg />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', type: 'tween' }}
          >
            <FlagIcon size={48} />
          </motion.div>
          <h1
            style={{
              fontWeight: 900,
              fontSize: 24,
              color: 'var(--navy)',
              marginTop: 12,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, marginTop: 4 }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: '28px 24px',
            boxShadow: '0 8px 32px rgba(26,26,46,0.10)',
          }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  )
}
