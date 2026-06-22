'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DecorBg } from '@/components/ui/DecorBg'
import { FlagIcon } from '@/components/ui/FlagIcon'
import type { Room } from '@/lib/game/types'

interface Props {
  username: string
  rooms: Room[]
}

const statusConfig: Record<Room['status'], { label: string; color: string; bg: string }> = {
  waiting: { label: 'Menunggu', color: '#D97706', bg: '#FFFBEB' },
  playing: { label: 'Bermain', color: '#059669', bg: '#F0FDF4' },
  finished: { label: 'Selesai', color: '#6b7280', bg: '#F3F4F6' },
}

export function DashboardClient({ username, rooms: initialRooms }: Props) {
  const [rooms, setRooms] = useState(initialRooms)
  const [creating, setCreating] = useState(false)
  const [hostName, setHostName] = useState(username)
  const [rounds, setRounds] = useState(5)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const deleteRoom = async (room: Room) => {
    setDeletingId(room.id)
    const res = await fetch(`/api/rooms/${room.code}`, { method: 'DELETE' })
    setDeletingId(null)
    if (res.ok) {
      setConfirmId(null)
      setRooms(prev => prev.filter(r => r.id !== room.id))
    }
  }

  const createRoom = async () => {
    setCreating(true)
    setError('')
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host_name: hostName, rounds_total: rounds }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) { setError(data.error); return }
    const roomCode = data.room.code
    const playerId = data.player?.id ?? ''
    localStorage.setItem(`player_id_${roomCode}`, playerId)
    window.location.href = `/room/${roomCode}`
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ background: 'var(--cream)' }}
    >
      <DecorBg />

      <div style={{ maxWidth: 440, margin: '0 auto', padding: '24px 20px', position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FlagIcon size={28} />
            <div>
              <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--navy)', lineHeight: 1.1 }}>
                Halo, {username}!
              </p>
              <p style={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Dashboard Host</p>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'none',
              border: '2px solid #E5E7EB',
              borderRadius: 10,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              color: '#6b7280',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Keluar
          </button>
        </motion.div>

        {/* Create room card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: '24px',
            boxShadow: '0 6px 24px rgba(26,26,46,0.08)',
            marginBottom: 20,
          }}
        >
          <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--navy)', marginBottom: 18 }}>
            Buat Room Baru
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Nama tampilmu"
              value={hostName}
              onChange={e => setHostName(e.target.value)}
              placeholder="nama kamu"
            />

            <div>
              <label style={{
                fontWeight: 700,
                fontSize: 12,
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: 8,
              }}>
                Jumlah Ronde
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[3, 5, 7, 10].map(n => (
                  <motion.button
                    key={n}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setRounds(n)}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 10,
                      border: `2.5px solid ${rounds === n ? 'var(--red)' : '#E5E7EB'}`,
                      background: rounds === n ? '#FEF2F2' : '#F9FAFB',
                      color: rounds === n ? 'var(--red)' : '#6b7280',
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    {n}
                  </motion.button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
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
                </motion.div>
              )}
            </AnimatePresence>

            <Button size="lg" onClick={createRoom} loading={creating} style={{ width: '100%' }}>
              Buat Room
            </Button>
          </div>
        </motion.div>

        {/* Past rooms */}
        {rooms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
          >
            <p style={{ fontWeight: 800, fontSize: 13, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Room Sebelumnya
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rooms.map((room, i) => {
                const s = statusConfig[room.status]
                const isConfirming = confirmId === room.id
                const isDeleting = deletingId === room.id

                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                  >
                    <AnimatePresence mode="wait">
                      {isConfirming ? (
                        <motion.div
                          key="confirm"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            background: '#FEF2F2',
                            border: '2px solid #FECACA',
                            borderRadius: 16,
                            padding: '14px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>
                            Hapus room <span style={{ fontFamily: 'monospace', fontWeight: 900 }}>{room.code}</span>?
                          </p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <motion.button
                              whileTap={{ scale: 0.93 }}
                              onClick={() => deleteRoom(room)}
                              disabled={isDeleting}
                              style={{
                                background: 'var(--red)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 10,
                                padding: '7px 16px',
                                fontSize: 13,
                                fontWeight: 800,
                                cursor: isDeleting ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit',
                                opacity: isDeleting ? 0.6 : 1,
                              }}
                            >
                              {isDeleting ? '...' : 'Hapus'}
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.93 }}
                              onClick={() => setConfirmId(null)}
                              disabled={isDeleting}
                              style={{
                                background: '#fff',
                                color: '#6b7280',
                                border: '2px solid #E5E7EB',
                                borderRadius: 10,
                                padding: '7px 14px',
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              Batal
                            </motion.button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="row"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}
                        >
                          <Link
                            href={`/room/${room.code}?host=1`}
                            style={{ textDecoration: 'none', flex: 1 }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.015, y: -1 }}
                              whileTap={{ scale: 0.98 }}
                              style={{
                                background: '#fff',
                                borderRadius: 16,
                                padding: '14px 18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                                cursor: 'pointer',
                                height: '100%',
                              }}
                            >
                              <div>
                                <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--navy)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                                  {room.code}
                                </p>
                                <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af' }}>
                                  {room.rounds_total} ronde
                                </p>
                              </div>
                              <div
                                style={{
                                  background: s.bg,
                                  color: s.color,
                                  fontWeight: 700,
                                  fontSize: 12,
                                  padding: '5px 12px',
                                  borderRadius: 20,
                                }}
                              >
                                {s.label}
                              </div>
                            </motion.div>
                          </Link>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setConfirmId(room.id)}
                            title="Hapus room"
                            style={{
                              background: '#fff',
                              border: '2px solid #E5E7EB',
                              borderRadius: 16,
                              padding: '0 14px',
                              cursor: 'pointer',
                              color: '#d1d5db',
                              fontSize: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                              transition: 'color 0.15s, border-color 0.15s',
                            }}
                            onMouseEnter={e => {
                              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--red)'
                              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#FECACA'
                            }}
                            onMouseLeave={e => {
                              ;(e.currentTarget as HTMLButtonElement).style.color = '#d1d5db'
                              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
