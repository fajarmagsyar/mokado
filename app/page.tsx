'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { DecorBg } from '@/components/ui/DecorBg'
import { FlagIcon } from '@/components/ui/FlagIcon'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } as never },
}

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'var(--cream)' }}
    >
      <DecorBg />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center gap-6 w-full max-w-xs"
      >
        {/* Logo mark */}
        <motion.div
          variants={item}
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut', type: 'tween' }}
          >
            <FlagIcon size={64} />
          </motion.div>

          <div className="text-center">
            <h1
              style={{
                fontWeight: 900,
                fontSize: 42,
                color: 'var(--navy)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              Red Flag
            </h1>
            <p style={{ color: '#6b7280', fontWeight: 600, fontSize: 14, marginTop: 8 }}>
              Game kartu seru bareng teman
            </p>
          </div>
        </motion.div>

        {/* Card container */}
        <motion.div
          variants={item}
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: '28px 24px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(26,26,46,0.10)',
          }}
        >
          <div className="flex flex-col gap-3">
            <Link href="/join" style={{ display: 'block', textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96, y: 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                style={{
                  background: 'var(--red)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  boxShadow: '0 4px 0 var(--red-dark)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 16,
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                Gabung Room
              </motion.div>
            </Link>

            <Link href="/dashboard" style={{ display: 'block', textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96, y: 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                style={{
                  background: '#F3F4F6',
                  borderRadius: 14,
                  padding: '16px 20px',
                  boxShadow: '0 4px 0 #D1D5DB',
                  color: 'var(--navy)',
                  fontWeight: 800,
                  fontSize: 16,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '2px solid #E5E7EB',
                }}
              >
                Buat Room
              </motion.div>
            </Link>
          </div>

          <p style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textAlign: 'center', marginTop: 16 }}>
            Hanya host yang perlu daftar akun
          </p>
        </motion.div>

        {/* Decorative cards preview */}
        <motion.div variants={item} className="flex gap-3 justify-center">
          {['red', 'green', 'red'].map((type, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -4, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'easeInOut',
                delay: i * 0.4,
                type: 'tween',
              }}
              style={{
                width: 48,
                height: 68,
                borderRadius: 8,
                background: '#fff',
                boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
                border: `3px solid ${type === 'red' ? 'var(--red)' : 'var(--green)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: type === 'red' ? 'var(--red)' : 'var(--green)',
                  opacity: 0.5,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
