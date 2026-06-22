'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GreenPickPhase, SabotagePhase } from './Hand'
import { JudgeView } from './JudgeView'
import { Scoreboard } from './Scoreboard'
import { FlagIcon } from '../ui/FlagIcon'
import type { GameState } from '@/lib/game/types'

interface GameBoardProps {
  state: GameState
  roomCode: string
  onStateChange: () => void
}

export function GameBoard({ state, roomCode, onStateChange }: GameBoardProps) {
  const {
    room, currentRound, myPlayer, myGreenCards, myRedCards,
    greenSubmittedPlayerIds, sabotageSubmittedPlayerIds, isJudge, players,
  } = state
  const [submitting, setSubmitting] = useState(false)
  const [sabotageSending, setSabotageSending] = useState(false)
  const [picking, setPicking] = useState(false)
  const [nextLoading, setNextLoading] = useState(false)

  const hasSubmittedGreen = !!(myPlayer && greenSubmittedPlayerIds.includes(myPlayer.id))
  const hasSubmittedSabotage = !!(myPlayer && sabotageSubmittedPlayerIds.includes(myPlayer.id))
  const nonJudgeCount = players.length - 1

  // Compute circular sabotage target client-side (mirrors server logic)
  const nonJudgePlayers = [...players]
    .filter(p => currentRound ? p.id !== currentRound.judge_player_id : true)
    .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime())
  const myNonJudgeIndex = myPlayer ? nonJudgePlayers.findIndex(p => p.id === myPlayer.id) : -1
  const sabotageTarget = myNonJudgeIndex >= 0
    ? nonJudgePlayers[(myNonJudgeIndex + 1) % nonJudgePlayers.length]
    : null

  const handleSubmitGreen = async (cardIds: string[]) => {
    if (!myPlayer || !currentRound) return
    setSubmitting(true)
    await fetch(`/api/rounds/${currentRound.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: myPlayer.id, card_ids: cardIds }),
    })
    setSubmitting(false)
    onStateChange()
  }

  const handleSabotage = async (cardId: string) => {
    if (!myPlayer || !currentRound) return
    setSabotageSending(true)
    await fetch(`/api/rounds/${currentRound.id}/sabotage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: myPlayer.id, card_id: cardId }),
    })
    setSabotageSending(false)
    onStateChange()
  }

  const handlePick = async (winnerPlayerId: string) => {
    if (!myPlayer || !currentRound) return
    setPicking(true)
    await fetch(`/api/rounds/${currentRound.id}/judge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: myPlayer.id, winner_player_id: winnerPlayerId }),
    })
    setPicking(false)
    onStateChange()
  }

  const handleNext = async () => {
    if (!myPlayer || !currentRound) return
    setNextLoading(true)
    await fetch(`/api/rounds/${currentRound.id}/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: myPlayer.id }),
    })
    setNextLoading(false)
    onStateChange()
  }

  if (room.status === 'finished') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
        <div style={{ maxWidth: 420, margin: '0 auto', padding: '24px 20px' }}>
          <Scoreboard state={state} isFinished={true} />
        </div>
      </div>
    )
  }

  if (!currentRound) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
        <p style={{ fontWeight: 700, color: '#6b7280' }}>Memuat ronde...</p>
      </div>
    )
  }

  const judgeName = players.find(p => p.id === currentRound.judge_player_id)?.name ?? 'Hakim'

  // Progress counters per phase
  const phaseProgress = currentRound.status === 'pitching_green'
    ? { current: greenSubmittedPlayerIds.length, total: nonJudgeCount, label: 'Pitch' }
    : currentRound.status === 'sabotage'
    ? { current: sabotageSubmittedPlayerIds.length, total: nonJudgeCount, label: 'Sabotase' }
    : null

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
      {/* Top bar */}
      <div
        style={{
          background: '#fff',
          borderBottom: '2px solid #F3F4F6',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <div>
          <p style={{ color: '#9ca3af', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Ronde
          </p>
          <p style={{ color: 'var(--navy)', fontWeight: 900, fontSize: 20, lineHeight: 1 }}>
            {currentRound.round_number}
            <span style={{ color: '#D1D5DB', fontWeight: 700, fontSize: 15 }}> /{room.rounds_total}</span>
          </p>
        </div>

        <motion.div
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', type: 'tween' }}
        >
          <FlagIcon size={28} />
        </motion.div>

        {phaseProgress ? (
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#9ca3af', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {phaseProgress.label}
            </p>
            <p style={{ color: 'var(--navy)', fontWeight: 900, fontSize: 20, lineHeight: 1 }}>
              {phaseProgress.current}
              <span style={{ color: '#D1D5DB', fontWeight: 700, fontSize: 15 }}> /{phaseProgress.total}</span>
            </p>
          </div>
        ) : (
          <PhaseChip status={currentRound.status} />
        )}
      </div>

      {/* Progress bar (round-level) */}
      <div style={{ height: 4, background: '#F3F4F6' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentRound.round_number / room.rounds_total) * 100}%` }}
          style={{ height: '100%', background: 'var(--red)' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Phase progress strip (within a round) */}
      <PhaseStrip status={currentRound.status} />

      {/* Judge badge */}
      <div
        style={{
          background: isJudge ? '#FFF1F2' : '#F0FDF4',
          borderBottom: `2px solid ${isJudge ? '#FECDD3' : '#BBF7D0'}`,
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: isJudge ? 'var(--red)' : 'var(--green)',
          flexShrink: 0,
        }} />
        <p style={{ fontWeight: 700, fontSize: 13, color: isJudge ? '#9F1239' : '#166534' }}>
          {isJudge ? 'Kamu adalah Hakim ronde ini' : `Hakim: ${judgeName}`}
        </p>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <AnimatePresence mode="wait">

            {currentRound.status === 'finished' && (
              <motion.div key="scoreboard" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <Scoreboard state={state} isFinished={false} onNext={handleNext} onNextLoading={nextLoading} />
              </motion.div>
            )}

            {currentRound.status === 'judging' && (
              <motion.div key="judge" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <JudgeView
                  roundId={currentRound.id}
                  players={players}
                  myPlayerId={myPlayer?.id ?? ''}
                  isJudge={isJudge}
                  onPick={handlePick}
                  picking={picking}
                />
              </motion.div>
            )}

            {currentRound.status === 'sabotage' && isJudge && (
              <motion.div key="judge-wait-sabotage" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <JudgeWait
                  title="Fase Sabotase"
                  subtitle="Pemain sedang saling menyabotase..."
                  current={sabotageSubmittedPlayerIds.length}
                  total={nonJudgeCount}
                  iconColor="var(--red)"
                />
              </motion.div>
            )}

            {currentRound.status === 'sabotage' && !isJudge && (
              <motion.div key="sabotage" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <SabotagePhase
                  redCards={myRedCards}
                  targetPlayerName={sabotageTarget?.name ?? '...'}
                  onSubmit={handleSabotage}
                  submitting={sabotageSending}
                  submitted={hasSubmittedSabotage}
                />
              </motion.div>
            )}

            {currentRound.status === 'pitching_green' && isJudge && (
              <motion.div key="judge-wait-green" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <JudgeWait
                  title="Kamu Hakim!"
                  subtitle="Menunggu semua pemain memilih kartu hijau..."
                  current={greenSubmittedPlayerIds.length}
                  total={nonJudgeCount}
                  iconColor="var(--green)"
                />
              </motion.div>
            )}

            {currentRound.status === 'pitching_green' && !isJudge && (
              <motion.div key="green-pick" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <GreenPickPhase
                  greenCards={myGreenCards}
                  onSubmit={handleSubmitGreen}
                  submitting={submitting}
                  submitted={hasSubmittedGreen}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PhaseChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    judging: { label: 'Judging', color: '#9F1239', bg: '#FFF1F2' },
    finished: { label: 'Selesai', color: '#166534', bg: '#F0FDF4' },
  }
  const cfg = map[status] ?? { label: status, color: '#6b7280', bg: '#F9FAFB' }
  return (
    <div style={{ background: cfg.bg, borderRadius: 20, padding: '4px 12px' }}>
      <p style={{ fontSize: 12, fontWeight: 800, color: cfg.color }}>{cfg.label}</p>
    </div>
  )
}

function PhaseStrip({ status }: { status: string }) {
  const phases = [
    { key: 'pitching_green', label: 'Pilih Hijau', color: 'var(--green)' },
    { key: 'sabotage', label: 'Sabotase', color: 'var(--red)' },
    { key: 'judging', label: 'Judging', color: 'var(--gold)' },
  ]
  const activeIdx = phases.findIndex(p => p.key === status)

  return (
    <div style={{ display: 'flex', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
      {phases.map((phase, i) => {
        const isDone = i < activeIdx
        const isActive = i === activeIdx
        return (
          <div
            key={phase.key}
            style={{
              flex: 1,
              padding: '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              borderBottom: isActive ? `3px solid ${phase.color}` : '3px solid transparent',
              transition: 'border-color 0.3s',
            }}
          >
            <p style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: isActive ? phase.color : isDone ? '#9ca3af' : '#D1D5DB',
            }}>
              {phase.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function JudgeWait({ title, subtitle, current, total, iconColor }: {
  title: string; subtitle: string; current: number; total: number; iconColor: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '48px 0', textAlign: 'center' }}
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', type: 'tween' }}
      >
        <ScaleWaitIcon color={iconColor} />
      </motion.div>
      <div>
        <p style={{ fontWeight: 900, fontSize: 22, color: 'var(--navy)' }}>{title}</p>
        <p style={{ color: '#6b7280', fontWeight: 600, fontSize: 14, marginTop: 4 }}>{subtitle}</p>
      </div>
      <SubmitProgress current={current} total={total} color={iconColor} />
    </motion.div>
  )
}

function ScaleWaitIcon({ color }: { color: string }) {
  const light = color === 'var(--green)' ? '#F0FDF4' : '#FFF1F2'
  const faint = color === 'var(--green)' ? '#BBF7D0' : '#FECDD3'
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
      <circle cx="40" cy="40" r="36" fill={light} />
      <rect x="38" y="18" width="4" height="32" rx="2" fill={faint} />
      <path d="M24 34 L24 44 Q24 52 32 52 Q40 52 40 44 L40 34 Z" fill={color} opacity="0.9" />
      <path d="M40 34 L40 44 Q40 52 48 52 Q56 52 56 44 L56 34 Z" fill={color} opacity="0.35" />
      <rect x="20" y="32" width="20" height="3" rx="1.5" fill={color} opacity="0.9" />
      <rect x="40" y="32" width="20" height="3" rx="1.5" fill={color} opacity="0.35" />
    </svg>
  )
}

function SubmitProgress({ current, total, color }: { current: number; total: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {[...Array(total)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.08 }}
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: i < current ? color : '#E5E7EB',
              border: `2.5px solid ${i < current ? color : '#D1D5DB'}`,
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
        {current} dari {total} sudah submit
      </p>
    </div>
  )
}
