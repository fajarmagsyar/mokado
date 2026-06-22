'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import { PlayingCard } from './Hand'
import type { Card, FinalPitch, Player } from '@/lib/game/types'

interface JudgeViewProps {
  roundId: string
  players: Player[]
  myPlayerId: string
  isJudge: boolean
  onPick: (winnerPlayerId: string) => void
  picking: boolean
  expectedPitchCount: number
}

interface PitchDisplay extends FinalPitch {
  revealed: boolean
}

export function JudgeView({ roundId, players, myPlayerId, isJudge, onPick, picking, expectedPitchCount }: JudgeViewProps) {
  const [pitches, setPitches] = useState<PitchDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      for (let attempt = 0; attempt < 8; attempt++) {
        if (cancelled) return
        if (attempt > 0) await new Promise(r => setTimeout(r, 800))
        const res = await fetch(`/api/rounds/${roundId}/final-pitch`)
        if (!res.ok) continue
        const data = await res.json()
        const loaded: PitchDisplay[] = (data.pitches ?? []).map((p: FinalPitch) => ({ ...p, revealed: false }))
        if (loaded.length >= expectedPitchCount || loaded.length === 0) {
          if (!cancelled) { setPitches(loaded); setLoading(false) }
          return
        }
        // Got some but not all — keep retrying
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [roundId, expectedPitchCount, retryCount])

  const reveal = (playerId: string) => {
    setPitches(prev => prev.map(p => p.player_id === playerId ? { ...p, revealed: true } : p))
  }

  const playerName = (id: string) => players.find(p => p.id === id)?.name ?? '?'
  const allRevealed = pitches.length > 0 && pitches.every(p => p.revealed)

  const missingPitches = !loading && pitches.length < expectedPitchCount

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
          {isJudge ? (pitches.length > 1 ? 'Pilih Pitch Terbaik!' : 'Nilai Pitch Ini!') : 'Jomblo Sedang Memilih...'}
        </h2>
        <p style={{ color: '#6b7280', fontWeight: 600, fontSize: 13, marginTop: 4 }}>
          {isJudge ? 'Ketuk kartu untuk lihat, lalu pilih pemenang' : 'Tunggu keputusan jomblo'}
        </p>
      </div>

      {missingPitches && (
        <div style={{
          background: '#FEF3C7', border: '1.5px solid #FDE68A',
          borderRadius: 12, padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>
            {pitches.length}/{expectedPitchCount} pitch dimuat
          </p>
          <button
            onClick={() => setRetryCount(n => n + 1)}
            style={{
              background: '#F59E0B', color: '#fff', border: 'none',
              borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer',
            }}
          >
            Muat ulang
          </button>
        </div>
      )}

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
                  <motion.div
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
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                      <CardBack />
                      <CardBack />
                      <CardBack type="red" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700 }}>Pitch #{idx + 1}</p>
                        {isJudge && (
                          <p style={{ color: 'var(--red)', fontSize: 13, fontWeight: 800, marginTop: 2 }}>
                            Ketuk untuk buka
                          </p>
                        )}
                      </div>
                      {isJudge && (
                        <span style={{ color: 'var(--red)', fontSize: 20, fontWeight: 700 }}>→</span>
                      )}
                    </div>
                  </motion.div>
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

                    {/* green card(s) */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                      {pitch.green_cards.map((card: Card) => (
                        <PlayingCard key={card.id} card={card} size="md" />
                      ))}
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: '#F3F4F6', marginBottom: 12 }} />

                    {/* 1 red card (sabotage) */}
                    {pitch.red_card ? (
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                          Red Flag
                        </p>
                        <PlayingCard card={pitch.red_card} size="md" />
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: '#D1D5DB', fontWeight: 600 }}>Tidak ada red flag</p>
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
function CardBack({ type = 'green' }: { type?: 'green' | 'red' }) {
  const bg = type === 'green'
    ? 'linear-gradient(145deg, #1a2744 0%, #1e3464 100%)'
    : 'linear-gradient(145deg, #7f1d1d 0%, #991b1b 100%)'
  return (
    <div style={{
      width: 68, height: 95, borderRadius: 10,
      background: bg,
      border: '2px solid rgba(255,255,255,0.1)',
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <svg width="60" height="87" viewBox="0 0 60 87" fill="none" style={{ position: 'absolute', top: 4, left: 4, opacity: 0.12 }}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="87" stroke="#fff" strokeWidth="1" />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 9} x2="60" y2={i * 9} stroke="#fff" strokeWidth="1" />
        ))}
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 24, height: 24,
        border: '1.5px solid rgba(255,255,255,0.3)',
        borderRadius: 3,
        transform: 'translate(-50%, -50%) rotate(45deg)',
      }} />
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

function LoadingCards() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.3, ease: 'easeInOut', type: 'tween' }}
          style={{ width: 52, height: 72, background: '#E5E7EB', borderRadius: 10 }}
        />
      ))}
    </div>
  )
}
