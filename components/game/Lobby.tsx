'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RoomCode } from './RoomCode'
import { PlayerAvatar } from './PlayerAvatar'
import { Button } from '../ui/Button'
import { DecorBg } from '../ui/DecorBg'
import { MokadoIcon } from '../ui/MokadoIcon'
import type { GameState } from '@/lib/game/types'

interface LobbyProps {
  state: GameState
  onStart: () => void
  onLeave: () => void
  starting: boolean
}

export function Lobby({ state, onStart, onLeave, starting }: LobbyProps) {
  const { room, players, myPlayer } = state
  const canStart = myPlayer?.is_host && players.length >= 3

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-5 relative"
      style={{ background: 'var(--cream)' }}
    >
      <DecorBg />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative z-10 w-full max-w-sm flex flex-col gap-4"
      >
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', type: 'tween' }}
            style={{ display: 'inline-block' }}
          >
            <MokadoIcon size={52} />
          </motion.div>
          <h1 style={{ fontWeight: 900, fontSize: 28, color: 'var(--navy)', marginTop: 8, letterSpacing: '-0.02em' }}>
            MOKADO
          </h1>
          <p style={{ color: '#059669', fontWeight: 800, fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 2 }}>
            Modal Kartu Doang!
          </p>
          <p style={{ color: '#9ca3af', fontWeight: 600, fontSize: 13, marginTop: 4 }}>Menunggu pemain bergabung...</p>
        </div>

        {/* Room code */}
        <RoomCode code={room.code} />

        {/* Players list */}
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: 20,
            boxShadow: '0 4px 20px rgba(26,26,46,0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--navy)' }}>Pemain</p>
            <span
              style={{
                background: '#F3F4F6',
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 12,
                fontWeight: 700,
                color: '#6b7280',
              }}
            >
              {players.length} / {room.max_players}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence initial={false}>
              {players.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.04 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: player.id === myPlayer?.id ? '#FFF5F5' : '#F9FAFB',
                    borderRadius: 12,
                    padding: '10px 14px',
                    border: `2px solid ${player.id === myPlayer?.id ? '#FECACA' : 'transparent'}`,
                  }}
                >
                  <PlayerAvatar name={player.name} index={i} size={34} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--navy)', lineHeight: 1.2 }}>
                      {player.name}
                    </p>
                    {player.is_host && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)' }}>Host</span>
                    )}
                  </div>
                  {/* Online dot */}
                  <motion.div
                    animate={{ scale: [1, 0.6, 1], opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3, type: 'tween' }}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#22C55E',
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Game info chips */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {[
            { label: `${room.rounds_total} Ronde` },
            { label: `Maks ${room.max_players} Pemain` },
          ].map(chip => (
            <div
              key={chip.label}
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                color: '#374151',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              }}
            >
              {chip.label}
            </div>
          ))}
        </div>

        {/* Table view link */}
        <TableViewCard roomCode={room.code} />

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {myPlayer?.is_host ? (
            <>
              {!canStart && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: '#FFFBEB',
                    border: '2px solid #FDE68A',
                    borderRadius: 12,
                    padding: '10px 14px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#92400E',
                    textAlign: 'center',
                  }}
                >
                  Butuh minimal 3 pemain untuk mulai
                </motion.div>
              )}
              <Button
                size="lg"
                onClick={onStart}
                disabled={!canStart}
                loading={starting}
                style={{ width: '100%' }}
              >
                Mulai Game!
              </Button>
            </>
          ) : (
            <div
              style={{
                background: '#F0FDF4',
                borderRadius: 12,
                padding: '14px',
                textAlign: 'center',
                border: '2px solid #BBF7D0',
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, type: 'tween' }}
                style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}
              >
                Menunggu host memulai game...
              </motion.div>
            </div>
          )}
          <Button variant="ghost" onClick={onLeave} style={{ width: '100%', color: '#9ca3af', fontSize: 13 }}>
            Keluar Room
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Table view card ───────────────────────────────────────────────────────────

function TableViewCard({ roomCode }: { roomCode: string }) {
  const [copied, setCopied] = useState(false)
  const tableUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${roomCode}/table`
    : `/room/${roomCode}/table`

  const copy = () => {
    navigator.clipboard.writeText(tableUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '14px 16px',
      boxShadow: '0 2px 12px rgba(26,26,46,0.07)',
      border: '2px solid #E5E7EB',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        {/* TV icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: '#0D1221',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <rect x="1" y="1" width="18" height="12" rx="2" stroke="#F1F5F9" strokeWidth="1.6" />
            <rect x="6" y="13" width="8" height="2" rx="1" fill="#F1F5F9" opacity="0.5" />
            <rect x="8" y="15" width="4" height="1" rx="0.5" fill="#F1F5F9" opacity="0.3" />
          </svg>
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: 13, color: 'var(--navy)' }}>Table View</p>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', lineHeight: 1.3 }}>
            Buka di TV / tablet di meja
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{
          flex: 1, background: '#F9FAFB', border: '1.5px solid #E5E7EB',
          borderRadius: 8, padding: '7px 10px',
          fontSize: 11, fontWeight: 700, color: '#6b7280',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          /room/{roomCode}/table
        </div>
        <motion.button
          onClick={copy}
          whileTap={{ scale: 0.94 }}
          style={{
            background: copied ? '#059669' : 'var(--navy)',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '7px 14px', fontSize: 12, fontWeight: 800,
            cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s',
          }}
        >
          {copied ? '✓ Disalin' : 'Salin'}
        </motion.button>
        <motion.a
          href={tableUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.94 }}
          style={{
            background: '#F3F4F6', color: 'var(--navy)', border: '1.5px solid #E5E7EB',
            borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 800,
            cursor: 'pointer', flexShrink: 0, textDecoration: 'none', display: 'block',
          }}
        >
          Buka →
        </motion.a>
      </div>
    </div>
  )
}
