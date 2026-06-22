'use client'

import { use } from 'react'
import { useRoom } from '@/hooks/useRoom'
import { TableView } from '@/components/game/TableView'
import { MokadoLoader } from '@/components/ui/MokadoLoader'

interface Props {
  params: Promise<{ code: string }>
}

export default function TablePage({ params }: Props) {
  const { code } = use(params)

  // Table view is read-only — no player ID
  const { state, loading, error } = useRoom({ code, myPlayerId: null })

  if (loading) return <MokadoLoader label="Memuat meja" />

  if (error || !state) {
    return (
      <div style={{
        minHeight: '100dvh', background: '#0D1221',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <p style={{ fontWeight: 700, fontSize: 16, color: '#EF4444' }}>{error ?? 'Room tidak ditemukan'}</p>
        <a href="/" style={{ color: '#64748B', fontSize: 14, fontWeight: 600 }}>← Kembali</a>
      </div>
    )
  }

  return <TableView state={state} />
}
