'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { AuthCard } from '@/components/ui/AuthCard'

export default function JoinPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch(`/api/rooms/${code.toUpperCase()}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? 'Gagal masuk'); return }
    localStorage.setItem(`player_id_${code.toUpperCase()}`, data.player.id)
    router.push(`/room/${code.toUpperCase()}`)
  }

  return (
    <AuthCard title="Gabung Room" subtitle="Masukkan kode dari host">
      <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Code input — big & chunky */}
        <div>
          <label
            style={{
              fontWeight: 700,
              fontSize: 12,
              color: '#374151',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'block',
              marginBottom: 8,
            }}
          >
            Kode Room
          </label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={code[i] ? { scale: [1, 1.15, 1] } : {}}
                transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
                style={{
                  width: 40,
                  height: 52,
                  background: code[i] ? 'var(--navy)' : '#F9FAFB',
                  border: `2px solid ${code[i] ? 'var(--navy)' : '#E5E7EB'}`,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 20,
                  color: code[i] ? '#fff' : '#D1D5DB',
                  fontFamily: 'monospace',
                  transition: 'all 0.15s',
                }}
              >
                {code[i] ?? ''}
              </motion.div>
            ))}
          </div>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            maxLength={6}
            required
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
              width: 1,
              height: 1,
            }}
          />
          {/* Invisible tap area to focus a hidden input — use a visible clickable */}
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            maxLength={6}
            required
            placeholder="Ketik kode di sini..."
            style={{
              width: '100%',
              marginTop: 10,
              background: '#F9FAFB',
              border: '2px solid #E5E7EB',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'monospace',
              textAlign: 'center',
              letterSpacing: '0.2em',
              color: 'var(--navy)',
              outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--red)' }}
            onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
          />
        </div>

        <div>
          <label
            style={{
              fontWeight: 700,
              fontSize: 12,
              color: '#374151',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'block',
              marginBottom: 6,
            }}
          >
            Namamu
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
            required
            placeholder="Nama yang tampil ke pemain lain"
            style={{
              width: '100%',
              background: '#F9FAFB',
              border: '2px solid #E5E7EB',
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'inherit',
              color: 'var(--navy)',
              outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--red)'; e.target.style.background = '#fff' }}
            onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB' }}
          />
        </div>

        {error && (
          <div
            style={{
              background: '#FEF2F2',
              border: '2px solid #FECACA',
              borderRadius: 10,
              padding: '10px 14px',
              color: 'var(--red)',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        )}

        <Button type="submit" size="lg" loading={loading} style={{ width: '100%' }}>
          Masuk ke Room
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Link
          href="/"
          style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
        >
          Kembali ke beranda
        </Link>
      </div>
    </AuthCard>
  )
}
