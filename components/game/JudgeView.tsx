'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import type { Card, FinalPitch, Player } from '@/lib/game/types'

interface JudgeViewProps {
  roundId: string
  players: Player[]
  myPlayerId: string
  isJudge: boolean
  onPick: (winnerPlayerId: string) => void
  picking: boolean
}

interface PitchDisplay extends FinalPitch {
  revealed: boolean
}

export function JudgeView({ roundId, players, myPlayerId, isJudge, onPick, picking }: JudgeViewProps) {
  const [pitches, setPitches] = useState<PitchDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await fetch(`/api/rounds/${roundId}/final-pitch`)
      if (res.ok) {
        const data = await res.json()
        setPitches((data.pitches ?? []).map((p: FinalPitch) => ({ ...p, revealed: false })))
      }
      setLoading(false)
    }
    load()
  }, [roundId])

  const reveal = (playerId: string) => {
    setPitches(prev => prev.map(p => p.player_id === playerId ? { ...p, revealed: true } : p))
  }

  const playerName = (id: string) => players.find(p => p.id === id)?.name ?? '?'
  const allRevealed = pitches.length > 0 && pitches.every(p => p.revealed)

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '48px 0' }}>
        <LoadingCards />
        <p style={{ fontWeight: 700, color: '#6b7280', fontSize: 14 }}>Mengumpulkan pitch...</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <ScaleIcon />
        </div>
        <h2 style={{ fontWeight: 900, fontSize: 22, color: 'var(--navy)' }}>
          {isJudge ? 'Pilih Pitch Terbaik!' : 'Hakim Sedang Memilih...'}
        </h2>
        <p style={{ color: '#6b7280', fontWeight: 600, fontSize: 13, marginTop: 4 }}>
          {isJudge ? 'Ketuk kartu untuk lihat, lalu pilih pemenang' : 'Tunggu keputusan hakim'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AnimatePresence>
          {pitches.map((pitch, idx) => {
            const isMe = pitch.player_id === myPlayerId
            const isSelected = selected === pitch.player_id
            return (
              <motion.div
                key={pitch.player_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, type: 'spring', stiffness: 280, damping: 24 }}
              >
                {!pitch.revealed ? (
                  <motion.button
                    whileHover={isJudge ? { scale: 1.02, y: -2 } : {}}
                    whileTap={isJudge ? { scale: 0.97 } : {}}
                    onClick={() => isJudge && reveal(pitch.player_id)}
                    style={{
                      width: '100%',
                      background: '#fff',
                      borderRadius: 16,
                      padding: '18px',
                      border: '2.5px dashed #E5E7EB',
                      cursor: isJudge ? 'pointer' : 'default',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    }}
                  >
                    <CardBackLight />
                    <div>
                      <p style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700 }}>Pitch #{idx + 1}</p>
                      {isJudge && (
                        <p style={{ color: 'var(--red)', fontSize: 13, fontWeight: 800, marginTop: 2 }}>
                          Ketuk untuk buka
                        </p>
                      )}
                    </div>
                    {isJudge && (
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut', type: 'tween' }}
                        style={{ marginLeft: 'auto', color: 'var(--red)', fontSize: 18 }}
                      >
                        →
                      </motion.div>
                    )}
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    onClick={() => isJudge && setSelected(pitch.player_id)}
                    style={{
                      background: '#fff',
                      borderRadius: 16,
                      padding: '16px 18px',
                      border: `2.5px solid ${isSelected ? 'var(--red)' : '#E5E7EB'}`,
                      cursor: isJudge ? 'pointer' : 'default',
                      boxShadow: isSelected ? '0 6px 24px rgba(220,27,46,0.18)' : '0 2px 10px rgba(0,0,0,0.07)',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <p style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700 }}>
                        Pitch #{idx + 1}{isMe ? ' (kamu)' : ''}
                      </p>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                              background: 'var(--red)',
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 800,
                              padding: '4px 12px',
                              borderRadius: 20,
                            }}
                          >
                            Terpilih
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 2 green cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                      {pitch.green_cards.map((card: Card) => (
                        <CardRow key={card.id} card={card} type="green" />
                      ))}
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: '#F3F4F6', marginBottom: 8 }} />

                    {/* 1 red card (sabotage) */}
                    {pitch.red_card ? (
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                          Bendera Merah
                        </p>
                        <CardRow card={pitch.red_card} type="red" />
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: '#D1D5DB', fontWeight: 600 }}>Tidak ada kartu merah</p>
                    )}

                    {/* Player reveal (only judge sees after selecting) */}
                    {isSelected && isJudge && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: 'var(--red)', textAlign: 'right' }}
                      >
                        Pemain: {playerName(pitch.player_id)}
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {isJudge && (
        <Button
          size="lg"
          onClick={() => selected && onPick(selected)}
          disabled={!selected || !allRevealed}
          loading={picking}
          style={{ width: '100%' }}
        >
          {!allRevealed ? 'Buka semua kartu dulu' : 'Pilih Pemenang'}
        </Button>
      )}
    </motion.div>
  )
}

// ── Shared ────────────────────────────────────────────────────────────────────
function CardRow({ card, type }: { card: Card; type: 'red' | 'green' }) {
  const bg = type === 'red' ? '#FFF1F2' : '#F0FDF4'
  const dot = type === 'red' ? 'var(--red)' : 'var(--green)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: bg, borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>{card.text}</p>
    </div>
  )
}

function ScaleIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#FFF1F2" />
      <rect x="22.5" y="10" width="3" height="28" rx="1.5" fill="#FECDD3" />
      <path d="M12 20 L12 27 Q12 32 17 32 Q22 32 22 27 L22 20 Z" fill="var(--red)" opacity="0.85" />
      <path d="M26 20 L26 27 Q26 32 31 32 Q36 32 36 27 L36 20 Z" fill="var(--red)" opacity="0.3" />
      <rect x="10" y="18" width="12" height="2.5" rx="1.25" fill="var(--red)" opacity="0.85" />
      <rect x="26" y="18" width="12" height="2.5" rx="1.25" fill="var(--red)" opacity="0.3" />
    </svg>
  )
}

function CardBackLight() {
  return (
    <div style={{
      width: 44,
      height: 56,
      borderRadius: 8,
      background: '#F9FAFB',
      border: '2px dashed #D1D5DB',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 4,
      padding: 8,
      flexShrink: 0,
    }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ borderRadius: 3, background: '#E5E7EB' }} />
      ))}
    </div>
  )
}

function LoadingCards() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.2, ease: 'easeInOut', type: 'tween' }}
          style={{ width: 44, height: 60, background: '#E5E7EB', borderRadius: 10, opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  )
}
