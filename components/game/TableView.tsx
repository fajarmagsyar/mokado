'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayingCard } from './Hand'
import { PlayerAvatar } from './PlayerAvatar'
import { MokadoIcon } from '../ui/MokadoIcon'
import type { Card, FinalPitch, GameState, Player, RoundSabotage, RoundSubmission } from '@/lib/game/types'

// ── Top bar ───────────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  pitching_green: { label: 'Pilih Green Flag', color: '#059669' },
  sabotage:       { label: 'Fase Sabotase',    color: '#DC2626' },
  judging:        { label: 'Judging',          color: '#D97706' },
  finished:       { label: 'Selesai',          color: '#6B7280' },
}

function TopBar({ state }: { state: GameState }) {
  const { room, currentRound, players } = state
  const phase = currentRound ? (PHASE_LABELS[currentRound.status] ?? { label: currentRound.status, color: '#6B7280' }) : null
  const judge = players.find(p => p.id === currentRound?.judge_player_id)
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 28px',
      background: 'rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      gap: 20, flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <MokadoIcon size={36} />
        <span style={{ fontWeight: 900, fontSize: 20, color: '#F1F5F9', letterSpacing: '-0.02em' }}>MOKADO</span>
      </div>

      {/* Phase + round */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {currentRound && (
          <>
            <div style={{
              background: 'rgba(255,255,255,0.08)', borderRadius: 10,
              padding: '5px 12px', fontSize: 13, fontWeight: 800, color: '#94A3B8',
            }}>
              Ronde {currentRound.round_number} / {room.rounds_total}
            </div>
            {phase && (
              <div style={{
                background: `${phase.color}22`, border: `1.5px solid ${phase.color}55`,
                borderRadius: 10, padding: '5px 14px',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: phase.color }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: phase.color }}>{phase.label}</span>
              </div>
            )}
            {judge && (
              <div style={{
                background: 'rgba(255,255,255,0.06)', borderRadius: 10,
                padding: '5px 12px', fontSize: 13, fontWeight: 700, color: '#94A3B8',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ opacity: 0.6 }}>Jomblo:</span>
                <span style={{ color: '#F1F5F9' }}>{judge.name}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Score strip */}
      <div style={{ display: 'flex', gap: 8 }}>
        {sorted.slice(0, 5).map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: i === 0 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
            borderRadius: 10, padding: '5px 10px',
            border: i === 0 ? '1px solid rgba(245,158,11,0.4)' : '1px solid transparent',
          }}>
            <PlayerAvatar name={p.name} index={players.indexOf(p)} size={22} />
            <span style={{ fontSize: 12, fontWeight: 800, color: i === 0 ? '#FCD34D' : '#94A3B8' }}>{p.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Card back ─────────────────────────────────────────────────────────────────

function TableCardBack({ type = 'green', size = 'lg' }: { type?: 'green' | 'red'; size?: 'md' | 'lg' }) {
  const w = size === 'lg' ? 136 : 112
  const h = size === 'lg' ? 190 : 156
  const bg = type === 'green'
    ? 'linear-gradient(145deg, #064e3b 0%, #065f46 100%)'
    : 'linear-gradient(145deg, #7f1d1d 0%, #991b1b 100%)'
  return (
    <div style={{
      width: w, height: h, borderRadius: 10,
      background: bg, border: '2px solid rgba(255,255,255,0.1)',
      position: 'relative', overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={w - 20} height={h - 20} viewBox="0 0 60 80" fill="none" style={{ opacity: 0.14 }}>
        {Array.from({ length: 7 }, (_, i) => <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="80" stroke="#fff" strokeWidth="1" />)}
        {Array.from({ length: 9 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 10} x2="60" y2={i * 10} stroke="#fff" strokeWidth="1" />)}
      </svg>
      <div style={{
        position: 'absolute', width: 28, height: 28,
        border: '2px solid rgba(255,255,255,0.28)', borderRadius: 4,
        transform: 'rotate(45deg)',
      }} />
    </div>
  )
}

// ── Lobby ─────────────────────────────────────────────────────────────────────

function TableLobby({ state }: { state: GameState }) {
  const { room, players } = state

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 60px', gap: 80,
    }}>
      {/* Left: branding + code */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', type: 'tween' }}
        >
          <MokadoIcon size={100} />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontWeight: 900, fontSize: 52, color: '#F1F5F9', letterSpacing: '-0.03em', lineHeight: 1 }}>MOKADO</h1>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#059669', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 6 }}>Modal Kartu Doang!</p>
        </div>

        {/* Room code */}
        <div style={{
          background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.12)',
          borderRadius: 20, padding: '20px 40px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Kode Room</p>
          <p style={{ fontSize: 52, fontWeight: 900, color: '#F1F5F9', letterSpacing: '0.12em', fontFamily: 'monospace, system-ui' }}>
            {room.code}
          </p>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 8 }}>Masukkan kode ini di mokado.app</p>
        </div>

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.8, type: 'tween' }}
          style={{ fontSize: 14, fontWeight: 700, color: '#64748B' }}
        >
          Menunggu host memulai game...
        </motion.div>
      </div>

      {/* Right: players */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 280 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <p style={{ fontWeight: 800, fontSize: 16, color: '#94A3B8' }}>Pemain</p>
          <span style={{
            background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '3px 12px',
            fontSize: 13, fontWeight: 700, color: '#64748B',
          }}>
            {players.length} / {room.max_players}
          </span>
        </div>
        <AnimatePresence>
          {players.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 26 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: '12px 16px',
              }}
            >
              <PlayerAvatar name={player.name} index={i} size={38} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: 15, color: '#F1F5F9' }}>{player.name}</p>
                {player.is_host && <p style={{ fontSize: 11, fontWeight: 700, color: '#DC2626' }}>Host</p>}
              </div>
              <motion.div
                animate={{ scale: [1, 0.5, 1], opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.25, type: 'tween' }}
                style={{ width: 9, height: 9, borderRadius: '50%', background: '#22C55E' }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Green pitching phase ──────────────────────────────────────────────────────

function TableGreenPhase({ state }: { state: GameState }) {
  const { players, pitchOrder, greenSubmissions, currentPitcherId, currentRound } = state
  const subMap = new Map(greenSubmissions.map((s: RoundSubmission) => [s.player_id, s]))
  const judge = players.find(p => p.id === currentRound?.judge_player_id)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 36px', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ fontWeight: 900, fontSize: 22, color: '#F1F5F9' }}>Pilih Green Flag</h2>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>— setiap pemain kirim 2 kartu</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(pitchOrder.length, 4)}, 1fr)`,
        gap: 16, flex: 1, alignContent: 'start',
      }}>
        {pitchOrder.map(pid => {
          const player = players.find(p => p.id === pid)
          const sub = subMap.get(pid)
          const cards: Card[] = sub?.cards ?? []
          const count = sub?.card_ids?.length ?? 0
          const isDone = count >= 2
          const isActive = pid === currentPitcherId

          return (
            <motion.div
              key={pid}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: isDone
                  ? 'rgba(5,150,105,0.12)'
                  : isActive
                    ? 'rgba(255,255,255,0.07)'
                    : 'rgba(255,255,255,0.04)',
                border: isDone
                  ? '2px solid rgba(5,150,105,0.5)'
                  : isActive
                    ? '2px dashed rgba(5,150,105,0.4)'
                    : '2px solid rgba(255,255,255,0.07)',
                borderRadius: 20, padding: '20px 24px',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <PlayerAvatar name={player?.name ?? '?'} index={players.findIndex(p => p.id === pid)} size={36} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: 15, color: '#F1F5F9' }}>{player?.name}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: isDone ? '#059669' : isActive ? '#94A3B8' : '#475569' }}>
                    {isDone ? '✓ Selesai' : isActive ? 'Giliran sekarang...' : 'Menunggu...'}
                  </p>
                </div>
                <span style={{ fontWeight: 900, fontSize: 22, color: isDone ? '#059669' : isActive ? '#94A3B8' : '#334155' }}>
                  {count}/2
                </span>
              </div>

              {/* Card slots — show actual cards face-up as they arrive */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                {[0, 1].map(slot => {
                  const card = cards[slot]
                  return (
                    <div key={slot}>
                      {card ? (
                        <motion.div
                          initial={{ scale: 0.7, opacity: 0, rotateY: 90 }}
                          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        >
                          <PlayingCard card={card} size="md" disabled />
                        </motion.div>
                      ) : (
                        <div style={{
                          width: 112, height: 156, borderRadius: 10,
                          border: `2px dashed ${isActive ? 'rgba(5,150,105,0.3)' : 'rgba(255,255,255,0.08)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isActive && (
                            <motion.div
                              animate={{ opacity: [0.3, 0.8, 0.3] }}
                              transition={{ repeat: Infinity, duration: 1.4, type: 'tween' }}
                              style={{ width: 20, height: 20, borderRadius: 4, background: 'rgba(5,150,105,0.3)', transform: 'rotate(45deg)' }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Judge tag */}
      {judge && (
        <div style={{
          alignSelf: 'flex-end', background: 'rgba(220,38,38,0.12)',
          border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '8px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <PlayerAvatar name={judge.name} index={players.findIndex(p => p.id === judge.id)} size={24} />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#FCA5A5' }}>Jomblo: {judge.name}</span>
        </div>
      )}
    </div>
  )
}

// ── Sabotage phase ────────────────────────────────────────────────────────────

function TableSabotagePhase({ state }: { state: GameState }) {
  const { players, pitchOrder, greenSubmissions, sabotageSubmissions, currentSabotageTargetId } = state
  const greenSubMap = new Map(greenSubmissions.map((s: RoundSubmission) => [s.player_id, s]))
  const sabMap = new Map(sabotageSubmissions.map((s: RoundSabotage) => [s.receiver_player_id, s]))

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 36px', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ fontWeight: 900, fontSize: 22, color: '#F1F5F9' }}>Fase Sabotase</h2>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>— tiap pitch dapat satu Red Flag</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(pitchOrder.length, 4)}, 1fr)`,
        gap: 16, flex: 1, alignContent: 'start',
      }}>
        {pitchOrder.map(pid => {
          const player = players.find(p => p.id === pid)
          const greenCards: Card[] = greenSubMap.get(pid)?.cards ?? []
          const sab = sabMap.get(pid)
          const isActive = pid === currentSabotageTargetId
          const isDone = !!sab

          return (
            <motion.div
              key={pid}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: isDone
                  ? 'rgba(220,38,38,0.08)'
                  : isActive
                    ? 'rgba(255,255,255,0.07)'
                    : 'rgba(255,255,255,0.04)',
                border: isDone
                  ? '2px solid rgba(220,38,38,0.35)'
                  : isActive
                    ? '2px dashed rgba(220,38,38,0.4)'
                    : '2px solid rgba(255,255,255,0.07)',
                borderRadius: 20, padding: '16px 20px',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <PlayerAvatar name={player?.name ?? '?'} index={players.findIndex(p => p.id === pid)} size={32} />
                <p style={{ fontWeight: 800, fontSize: 14, color: '#F1F5F9', flex: 1 }}>{player?.name}</p>
                {isDone && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5 L4 7 L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Green cards */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {greenCards.map(card => (
                  <PlayingCard key={card.id} card={card} size="md" disabled />
                ))}
              </div>

              {/* Red flag divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  Red Flag
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </div>

              {/* Red card slot */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {sab?.card ? (
                  <motion.div
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <PlayingCard card={sab.card} size="md" disabled />
                  </motion.div>
                ) : (
                  <div style={{
                    width: 112, height: 156, borderRadius: 10,
                    border: `2px dashed ${isActive ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isActive && (
                      <motion.div
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.2, type: 'tween' }}
                        style={{ width: 16, height: 16, borderRadius: 3, background: 'rgba(220,38,38,0.4)', transform: 'rotate(45deg)' }}
                      />
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Judging phase ─────────────────────────────────────────────────────────────

interface PitchDisplay extends FinalPitch { revealed: boolean }

function TableJudging({ state }: { state: GameState }) {
  const { currentRound, players } = state
  const [pitches, setPitches] = useState<PitchDisplay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentRound) return
    let cancelled = false

    async function load() {
      for (let attempt = 0; attempt < 8; attempt++) {
        if (cancelled) return
        if (attempt > 0) await new Promise(r => setTimeout(r, 800))
        const res = await fetch(`/api/rounds/${currentRound!.id}/final-pitch`)
        if (!res.ok) continue
        const data = await res.json()
        const loaded: PitchDisplay[] = (data.pitches ?? []).map((p: FinalPitch) => ({ ...p, revealed: false }))
        if (loaded.length > 0) {
          if (!cancelled) { setPitches(loaded); setLoading(false) }
          return
        }
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [currentRound?.id])

  // Auto-reveal all pitches one by one
  useEffect(() => {
    if (pitches.length === 0) return
    const timers = pitches.map((_, i) =>
      setTimeout(() => {
        setPitches(prev => prev.map((p, j) => j === i ? { ...p, revealed: true } : p))
      }, 1200 + i * 1800)
    )
    return () => timers.forEach(clearTimeout)
  }, [pitches.length])

  const winnerId = currentRound?.winner_player_id

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.3, type: 'tween' }}
              style={{ width: 80, height: 112, background: 'rgba(255,255,255,0.06)', borderRadius: 10 }}
            />
          ))}
        </div>
        <p style={{ fontWeight: 700, fontSize: 15, color: '#64748B' }}>Mengumpulkan pitch...</p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 36px', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ fontWeight: 900, fontSize: 22, color: '#F1F5F9' }}>
          {winnerId ? 'Pemenang Ronde!' : 'Jomblo Memilih...'}
        </h2>
        {!winnerId && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, type: 'tween' }}
            style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}
          >
            semua pitch sedang dinilai
          </motion.div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(pitches.length, 4)}, 1fr)`,
        gap: 20, flex: 1, alignContent: 'start',
      }}>
        <AnimatePresence>
          {pitches.map((pitch, idx) => {
            const isWinner = winnerId === pitch.player_id
            const winnerPlayer = players.find(p => p.id === pitch.player_id)

            return (
              <motion.div
                key={pitch.player_id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, type: 'spring', stiffness: 260, damping: 24 }}
                style={{
                  background: isWinner
                    ? 'rgba(245,158,11,0.15)'
                    : 'rgba(255,255,255,0.05)',
                  border: isWinner
                    ? '2.5px solid rgba(245,158,11,0.7)'
                    : '1.5px solid rgba(255,255,255,0.08)',
                  borderRadius: 20, padding: '20px',
                  boxShadow: isWinner ? '0 0 40px rgba(245,158,11,0.2)' : 'none',
                  transition: 'all 0.4s ease',
                  display: 'flex', flexDirection: 'column', gap: 16, position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>Pitch #{idx + 1}</p>
                  {isWinner && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      style={{
                        background: '#F59E0B', color: '#fff',
                        fontSize: 12, fontWeight: 900, padding: '4px 12px', borderRadius: 20,
                      }}
                    >
                      🏆 {winnerPlayer?.name}
                    </motion.div>
                  )}
                </div>

                {!pitch.revealed ? (
                  /* Card backs */
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <TableCardBack type="green" size="md" />
                    <TableCardBack type="green" size="md" />
                    <TableCardBack type="red" size="md" />
                  </div>
                ) : (
                  <motion.div
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                  >
                    {/* Green cards */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {pitch.green_cards.map(card => (
                        <PlayingCard key={card.id} card={card} size="md" disabled />
                      ))}
                    </div>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Red Flag</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                    </div>

                    {/* Red card */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {pitch.red_card
                        ? <PlayingCard card={pitch.red_card} size="md" disabled />
                        : <p style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Tidak ada red flag</p>
                      }
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Scoreboard (round finished) ───────────────────────────────────────────────

function TableScoreView({ state }: { state: GameState }) {
  const { players, currentRound, room } = state
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const winner = players.find(p => p.id === currentRound?.winner_player_id)

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 60px', gap: 80 }}>
      {/* Winner banner */}
      {winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.08) 100%)',
            border: '2px solid rgba(245,158,11,0.5)',
            borderRadius: 28, padding: '40px 50px', textAlign: 'center',
            boxShadow: '0 0 60px rgba(245,158,11,0.15)',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2, type: 'tween' }}
            style={{ fontSize: 56, marginBottom: 16 }}
          >
            🏆
          </motion.div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Pemenang Ronde {currentRound?.round_number}
          </p>
          <p style={{ fontSize: 48, fontWeight: 900, color: '#FCD34D', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {winner.name}
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#94A3B8', marginTop: 12 }}>
            Menunggu host untuk ronde berikutnya...
          </p>
        </motion.div>
      )}

      {/* Scoreboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 300 }}>
        <p style={{ fontWeight: 800, fontSize: 14, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
          Skor — Ronde {currentRound?.round_number} / {room.rounds_total}
        </p>
        {sorted.map((player, idx) => {
          const isWinner = player.id === winner?.id
          const medalColors = ['#F59E0B', '#94A3B8', '#B45309']

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06, type: 'spring', stiffness: 280, damping: 24 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: isWinner ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.05)',
                border: isWinner ? '1.5px solid rgba(245,158,11,0.4)' : '1.5px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '12px 16px',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: idx < 3 ? medalColors[idx] : 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 900, color: idx < 3 ? '#fff' : '#475569',
              }}>
                {idx + 1}
              </div>
              <PlayerAvatar name={player.name} index={players.indexOf(player)} size={34} />
              <p style={{ flex: 1, fontWeight: 800, fontSize: 15, color: '#F1F5F9' }}>{player.name}</p>
              <motion.p
                animate={isWinner ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.4, type: 'tween' }}
                style={{ fontWeight: 900, fontSize: 24, color: isWinner ? '#FCD34D' : '#64748B' }}
              >
                {player.score}
              </motion.p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function TableView({ state }: { state: GameState }) {
  const { room, currentRound } = state

  const showLobby = room.status === 'waiting'
  const showGame = room.status === 'playing' && currentRound

  return (
    <div style={{
      minHeight: '100dvh', background: '#0D1221',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-nunito), Nunito, sans-serif',
    }}>
      {!showLobby && <TopBar state={state} />}

      {showLobby && <TableLobby state={state} />}

      {showGame && currentRound.status === 'pitching_green' && <TableGreenPhase state={state} />}
      {showGame && currentRound.status === 'sabotage' && <TableSabotagePhase state={state} />}
      {showGame && currentRound.status === 'judging' && <TableJudging state={state} />}
      {showGame && currentRound.status === 'finished' && <TableScoreView state={state} />}

      {room.status === 'finished' && <TableScoreView state={state} />}
    </div>
  )
}
