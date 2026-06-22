'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthCard } from '@/components/ui/AuthCard'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? 'Gagal login'); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <AuthCard title="Masuk sebagai Host" subtitle="Buat dan kelola room game kamu">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email@kamu.com"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

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

        <Button type="submit" size="lg" loading={loading} style={{ width: '100%', marginTop: 4 }}>
          Masuk
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <p style={{ color: '#6b7280', fontSize: 13, fontWeight: 600 }}>
          Belum punya akun?{' '}
          <Link
            href="/register"
            style={{ color: 'var(--red)', fontWeight: 800, textDecoration: 'none' }}
          >
            Daftar
          </Link>
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginTop: 10,
            color: '#9ca3af',
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Kembali ke beranda
        </Link>
      </div>
    </AuthCard>
  )
}
