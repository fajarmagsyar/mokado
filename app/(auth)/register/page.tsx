'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthCard } from '@/components/ui/AuthCard'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? 'Gagal daftar'); return }
    router.push('/login?registered=1')
  }

  return (
    <AuthCard title="Daftar sebagai Host" subtitle="Gratis, hanya untuk host">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Username"
          value={form.username}
          onChange={set('username')}
          placeholder="nama_kamu"
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="email@kamu.com"
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={set('password')}
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
          Daftar
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <p style={{ color: '#6b7280', fontSize: 13, fontWeight: 600 }}>
          Sudah punya akun?{' '}
          <Link href="/login" style={{ color: 'var(--red)', fontWeight: 800, textDecoration: 'none' }}>
            Masuk
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
