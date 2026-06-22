'use client'

import { motion } from 'framer-motion'
import { MokadoIcon } from './MokadoIcon'

const CARDS = [
  { color: '#047857', border: '#059669', delay: 0 },
  { color: '#B91C1C', border: '#DC2626', delay: 0.18 },
  { color: '#047857', border: '#059669', delay: 0.36 },
]

export function MokadoLoader({ label = 'Memuat...' }: { label?: string }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--cream)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        padding: 24,
      }}
    >
      {/* Icon */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', type: 'tween' }}
        style={{ marginBottom: 20 }}
      >
        <MokadoIcon size={72} />
      </motion.div>

      {/* Wordmark */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{
          fontWeight: 900,
          fontSize: 38,
          color: 'var(--navy)',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        MOKADO
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        style={{ fontWeight: 700, fontSize: 13, color: '#9ca3af', marginBottom: 36, letterSpacing: '0.01em' }}
      >
        Modal Kartu Doang!
      </motion.p>

      {/* Animated dealing cards */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {CARDS.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40, rotate: -8 + i * 8 }}
            animate={{
              opacity: 1,
              y: [0, -5, 0],
              rotate: -8 + i * 8,
            }}
            transition={{
              opacity: { delay: 0.3 + i * 0.15, duration: 0.4 },
              y: {
                delay: 0.7 + card.delay,
                repeat: Infinity,
                duration: 1.8,
                ease: 'easeInOut',
                type: 'tween',
              },
              rotate: { delay: 0 },
            }}
            style={{
              width: 44,
              height: 62,
              borderRadius: 8,
              background: `linear-gradient(145deg, ${card.color} 0%, ${card.border} 100%)`,
              border: '1.5px solid rgba(255,255,255,0.15)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: card.delay, ease: 'easeInOut', type: 'tween' }}
              style={{
                width: 10, height: 10,
                background: 'rgba(255,255,255,0.7)',
                borderRadius: 2,
                transform: 'rotate(45deg)',
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Label with animated dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <p style={{ fontWeight: 700, fontSize: 13, color: '#9ca3af' }}>{label}</p>
        <div style={{ display: 'flex', gap: 3, marginTop: 1 }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: 'easeInOut', type: 'tween' }}
              style={{ width: 5, height: 5, borderRadius: '50%', background: '#9ca3af' }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
