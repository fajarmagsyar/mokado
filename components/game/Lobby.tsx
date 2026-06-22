'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { RoomCode } from './RoomCode'
import { PlayerAvatar } from './PlayerAvatar'
import { Button } from '../ui/Button'
import { DecorBg } from '../ui/DecorBg'
import { FlagIcon } from '../ui/FlagIcon'
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
            <FlagIcon size={40} />
          </motion.div>
          <h1 style={{ fontWeight: 900, fontSize: 28, color: 'var(--navy)', marginTop: 8, letterSpacing: '-0.01em' }}>
            Red Flag
          </h1>
          <p style={{ color: '#6b7280', fontWeight: 600, fontSize: 13 }}>Menunggu pemain bergabung...</p>
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
