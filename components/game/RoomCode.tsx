'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function RoomCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        background: 'var(--red)',
        borderRadius: 20,
        padding: '20px 24px',
        boxShadow: '0 6px 0 var(--red-dark)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Kode Room
      </p>
      <div style={{ display: 'flex', gap: 6 }}>
        {code.split('').map((char, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              width: 38,
              height: 48,
              background: '#fff',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 22,
              color: 'var(--red)',
              fontFamily: 'monospace',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            {char}
          </motion.div>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={copy}
        style={{
          background: copied ? '#fff' : 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: 10,
          padding: '8px 20px',
          color: copied ? 'var(--red)' : '#fff',
          fontWeight: 800,
          fontSize: 12,
          fontFamily: 'inherit',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={copied ? 'copied' : 'copy'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {copied ? 'Disalin!' : 'Salin Kode'}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
