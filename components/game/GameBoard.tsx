'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GreenPickPhase, SabotagePhase, PlayingCard, LoadingDots } from './Hand'
import { JudgeView } from './JudgeView'
import { Scoreboard } from './Scoreboard'
import { Button } from '../ui/Button'
import type { Card, GameState, Player, RoundSubmission, RoundSabotage } from '@/lib/game/types'

interface GameBoardProps {
  state: GameState
  roomCode: string
  onStateChange: () => void
}

export function GameBoard({ state, roomCode, onStateChange }: GameBoardProps) {
  const {
    room, currentRound, myPlayer, myGreenCards, myRedCards,
    greenSubmittedPlayerIds, sabotageSubmittedPlayerIds, isJudge, players,
    greenSubmissions, sabotageSubmissions,
    pitchOrder, currentPitcherId, allGreenDone,
    currentSabotageTargetId, currentSabotagerId,
  } = state

  const [submitting, setSubmitting] = useState(false)
  const [sabotageSending, setSabotageSending] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [picking, setPicking] = useState(false)
  const [nextLoading, setNextLoading] = useState(false)

  void roomCode

  const myGreenSubmission = greenSubmissions.find(s => s.player_id === myPlayer?.id)
  const mySubmittedCardIds = myGreenSubmission?.card_ids ?? []
  const hasSubmittedGreen = mySubmittedCardIds.length >= 2
  const hasSubmittedSabotage = !!(myPlayer && sabotageSubmittedPlayerIds.includes(myPlayer.id))
  const isMyGreenTurn = currentPitcherId === myPlayer?.id
  const isMyTurnToSabotage = currentSabotagerId === myPlayer?.id

  // Target's green cards for sabotage
  const targetGreenSub = greenSubmissions.find(s => s.player_id === currentSabotageTargetId)
  const targetGreenCards: Card[] = targetGreenSub?.cards ?? []
  const targetPlayer = players.find(p => p.id === currentSabotageTargetId) ?? null

  const handleSubmitGreen = async (cardId: string) => {
    if (!myPlayer || !currentRound) return
    setSubmitting(true)
    await fetch(`/api/rounds/${currentRound.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: myPlayer.id, card_id: cardId }),
    })
    setSubmitting(false)
    onStateChange()
  }

  const handleAdvanceToSabotage = async () => {
    if (!myPlayer || !currentRound) return
    setAdvancing(true)
    await fetch(`/api/rounds/${currentRound.id}/advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: myPlayer.id }),
    })
    setAdvancing(false)
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

  const judgeName = players.find(p => p.id === currentRound.judge_player_id)?.name ?? 'Jomblo'

  const phaseConfig: Record<string, { label: string; color: string }> = {
    pitching_green: { label: 'Pilih Hijau', color: '#059669' },
    sabotage:       { label: 'Sabotase',    color: 'var(--red)' },
    judging:        { label: 'Judging',     color: '#D97706' },
    finished:       { label: 'Selesai',     color: '#6B7280' },
  }
  const activePhase = phaseConfig[currentRound.status] ?? { label: currentRound.status, color: '#6B7280' }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
      {/* Top bar */}
      <div style={{
        background: '#fff',
        borderBottom: '1.5px solid #F0F0F2',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>

          {/* Left: round counter pill */}
          <div style={{
            background: '#F4F4F6', borderRadius: 12,
            padding: '6px 11px', display: 'flex', alignItems: 'center', gap: 5,
            minWidth: 68,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--navy)', opacity: 0.6 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--navy)', lineHeight: 1 }}>
              {currentRound.round_number}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#B0B0BC', lineHeight: 1 }}>
              /{room.rounds_total}
            </span>
          </div>

          {/* Center: phase pill */}
          <div style={{
            flex: 1, display: 'flex', justifyContent: 'center',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `color-mix(in srgb, ${activePhase.color} 12%, transparent)`,
              borderRadius: 20, padding: '6px 14px',
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: activePhase.color, flexShrink: 0,
              }} />
              <p style={{ fontSize: 12, fontWeight: 800, color: activePhase.color, whiteSpace: 'nowrap' }}>
                {activePhase.label}
              </p>
            </div>
          </div>

          {/* Right: role pill */}
          {isJudge ? (
            <div style={{
              background: '#FEF2F2', border: '1.5px solid #FECDD3',
              borderRadius: 12, padding: '6px 11px', minWidth: 68,
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5,
            }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--red)', whiteSpace: 'nowrap' }}>Jomblo</p>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', opacity: 0.7 }} />
            </div>
          ) : (
            <div style={{
              background: '#F4F4F6', borderRadius: 12,
              padding: '6px 11px', minWidth: 68, textAlign: 'right',
            }}>
              <p style={{ fontSize: 8, fontWeight: 700, color: '#B0B0BC', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Jomblo</p>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{judgeName}</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: '#F0F0F2' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentRound.round_number / room.rounds_total) * 100}%` }}
            style={{ height: '100%', background: activePhase.color }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
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
                  expectedPitchCount={players.length - 1}
                />
              </motion.div>
            )}

            {currentRound.status === 'sabotage' && isJudge && (
              <motion.div key="judge-sabotage" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <JudgeSabotageView
                  greenSubmissions={greenSubmissions}
                  sabotageSubmissions={sabotageSubmissions}
                  players={players}
                  pitchOrder={pitchOrder}
                  currentSabotageTargetId={currentSabotageTargetId}
                  currentSabotagerId={currentSabotagerId}
                />
              </motion.div>
            )}

            {currentRound.status === 'sabotage' && !isJudge && (
              <motion.div key="sabotage" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <SabotagePhase
                  redCards={myRedCards}
                  targetPlayer={targetPlayer}
                  targetGreenCards={targetGreenCards}
                  onSubmit={handleSabotage}
                  submitting={sabotageSending}
                  submitted={hasSubmittedSabotage}
                  isMyTurn={isMyTurnToSabotage}
                  currentSabotagerId={currentSabotagerId}
                  currentSabotageTargetId={currentSabotageTargetId}
                  players={players}
                />
              </motion.div>
            )}

            {currentRound.status === 'pitching_green' && isJudge && (
              <motion.div key="judge-green" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <JudgeLivePitch
                  greenSubmissions={greenSubmissions}
                  players={players}
                  pitchOrder={pitchOrder}
                  currentPitcherId={currentPitcherId}
                  allGreenDone={allGreenDone}
                  onAdvance={handleAdvanceToSabotage}
                  advancing={advancing}
                />
              </motion.div>
            )}

            {currentRound.status === 'pitching_green' && !isJudge && (
              <motion.div key="green-pick" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <GreenPickPhase
                  greenCards={myGreenCards}
                  redCards={myRedCards}
                  onSubmit={handleSubmitGreen}
                  submitting={submitting}
                  mySubmittedCardIds={mySubmittedCardIds}
                  isMyTurn={isMyGreenTurn}
                  currentPitcherId={currentPitcherId}
                  pitchOrder={pitchOrder}
                  players={players}
                  greenSubmissions={greenSubmissions}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ── Judge: live green pitch view ──────────────────────────────────────────────

function JudgeLivePitch({ greenSubmissions, players, pitchOrder, currentPitcherId, allGreenDone, onAdvance, advancing }: {
  greenSubmissions: RoundSubmission[]
  players: Player[]
  pitchOrder: string[]
  currentPitcherId: string | null
  allGreenDone: boolean
  onAdvance: () => void
  advancing: boolean
}) {
  const subMap = new Map(greenSubmissions.map(s => [s.player_id, s]))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: 'var(--green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 900, fontSize: 16, flexShrink: 0,
        }}>1</div>
        <div>
          <h2 style={{ fontWeight: 900, fontSize: 20, color: 'var(--navy)', lineHeight: 1.1 }}>Kamu Jomblo!</h2>
          <p style={{ color: '#6b7280', fontWeight: 600, fontSize: 13, marginTop: 3 }}>
            Perhatikan kartu masuk — setiap pemain mengirim 2 kartu
          </p>
        </div>
      </div>

      {/* Per-player sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pitchOrder.map(pid => {
          const sub = subMap.get(pid)
          const cardCount = sub?.card_ids?.length ?? 0
          const isDone = cardCount >= 2
          const isActive = pid === currentPitcherId
          const player = players.find(p => p.id === pid)
          const submittedCards: Card[] = sub?.cards ?? []

          if (isDone) {
            return (
              <motion.div
                key={pid}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: '#fff',
                  border: '2.5px solid #BBF7D0',
                  borderRadius: 16,
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: 'var(--green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5 L4 7 L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 14, color: '#166534' }}>{player?.name}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginLeft: 'auto' }}>2/2</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {submittedCards.map(card => (
                    <PlayingCard key={card.id} card={card} size="lg" disabled />
                  ))}
                </div>
              </motion.div>
            )
          }

          if (isActive) {
            return (
              <motion.div
                key={pid}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: '#fff',
                  border: '2.5px dashed #BBF7D0',
                  borderRadius: 16,
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
                  <p style={{ fontWeight: 800, fontSize: 13, color: 'var(--navy)' }}>{player?.name}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', marginLeft: 'auto' }}>
                    {cardCount}/2 kartu
                  </p>
                </div>
                {submittedCards.length > 0 ? (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {submittedCards.map(card => (
                      <AnimatePresence key={card.id} mode="popLayout">
                        <motion.div
                          key={card.id}
                          initial={{ y: -20, opacity: 0, scale: 0.85 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        >
                          <PlayingCard card={card} size="lg" disabled />
                        </motion.div>
                      </AnimatePresence>
                    ))}
                    {cardCount < 2 && (
                      <div style={{
                        width: 136, height: 190, borderRadius: 10,
                        border: '2.5px dashed #D1D5DB',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <LoadingDots />
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
                    <LoadingDots />
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#9ca3af' }}>Menunggu kartu pertama...</p>
                  </div>
                )}
              </motion.div>
            )
          }

          // Upcoming — not shown yet
          return null
        })}
      </div>

      {/* Continue button for judge */}
      {allGreenDone && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Button size="lg" onClick={onAdvance} loading={advancing} style={{ width: '100%' }}>
            Lanjut ke Fase Sabotase →
          </Button>
        </motion.div>
      )}

      {!allGreenDone && (
        <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>
          Tombol lanjut muncul setelah semua pemain mengirim 2 kartu
        </p>
      )}
    </div>
  )
}

// ── Judge: sabotage view ──────────────────────────────────────────────────────

function JudgeSabotageView({ greenSubmissions, sabotageSubmissions, players, pitchOrder, currentSabotageTargetId, currentSabotagerId }: {
  greenSubmissions: RoundSubmission[]
  sabotageSubmissions: RoundSabotage[]
  players: Player[]
  pitchOrder: string[]
  currentSabotageTargetId: string | null
  currentSabotagerId: string | null
}) {
  const greenSubMap = new Map(greenSubmissions.map(s => [s.player_id, s]))
  const receivedMap = new Map(sabotageSubmissions.map(s => [s.receiver_player_id, s]))
  const currentPitcher = players.find(p => p.id === currentSabotagerId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: 'var(--red)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 900, fontSize: 16, flexShrink: 0,
        }}>2</div>
        <div>
          <h2 style={{ fontWeight: 900, fontSize: 20, color: 'var(--navy)', lineHeight: 1.1 }}>Fase Sabotase</h2>
          <p style={{ color: '#6b7280', fontWeight: 600, fontSize: 13, marginTop: 3 }}>
            Setiap pemain mengirim red flag ke pitch lawan
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {pitchOrder.map(pid => {
          const isDone = receivedMap.has(pid)
          const isActive = pid === currentSabotageTargetId
          if (!isDone && !isActive) return null

          const player = players.find(p => p.id === pid)
          const greenCards: Card[] = greenSubMap.get(pid)?.cards ?? []
          const sab = receivedMap.get(pid)

          if (isDone) {
            return (
              <motion.div
                key={pid}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: '#fff', border: '2.5px solid #FECDD3',
                  borderRadius: 16, padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: 'var(--red)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5 L4 7 L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 14, color: '#9F1239' }}>{player?.name}</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 14 }}>
                  {greenCards.map(card => (
                    <PlayingCard key={card.id} card={card} size="lg" disabled />
                  ))}
                </div>
                {sab?.card && (
                  <>
                    <div style={{ height: 1, background: '#F3F4F6', marginBottom: 12 }} />
                    <p style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                      Red Flag
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <PlayingCard card={sab.card} size="lg" disabled />
                    </div>
                  </>
                )}
              </motion.div>
            )
          }

          // isActive — target's green combo + incoming red
          return (
            <motion.div
              key={pid}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#fff', border: '2.5px dashed #FECDD3',
                borderRadius: 16, padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
                <p style={{ fontWeight: 800, fontSize: 13, color: 'var(--navy)' }}>
                  {player?.name}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 14 }}>
                {greenCards.map(card => (
                  <PlayingCard key={card.id} card={card} size="lg" disabled />
                ))}
              </div>
              <div style={{ height: 1, background: '#F3F4F6', marginBottom: 12 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', opacity: 0.5 }} />
                <p style={{ fontWeight: 600, fontSize: 12, color: '#9ca3af' }}>
                  {currentPitcher?.name} sedang memilih red flag...
                </p>
                <div style={{ marginLeft: 'auto' }}><LoadingDots /></div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

