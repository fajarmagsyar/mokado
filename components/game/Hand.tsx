'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import type { Card, Player, RoundSubmission } from '@/lib/game/types'

// ── Playing Card ──────────────────────────────────────────────────────────────

type CardSize = 'sm' | 'md' | 'lg'

const DIMS: Record<CardSize, { w: number; h: number; text: number; icon: number; pad: number }> = {
  sm: { w: 68,  h: 95,  text: 10, icon: 12, pad: 7  },
  md: { w: 112, h: 156, text: 13, icon: 16, pad: 11 },
  lg: { w: 136, h: 190, text: 14, icon: 18, pad: 13 },
}

export function PlayingCard({
  card,
  size = 'md',
  selected,
  locked,
  disabled,
  onClick,
}: {
  card: Card
  size?: CardSize
  selected?: boolean
  locked?: boolean      // submitted card, not selectable, shown with checkmark
  disabled?: boolean    // can't select
  onClick?: () => void
}) {
  const d = DIMS[size]
  const isGreen = card.type === 'green'
  const bg = isGreen
    ? 'linear-gradient(145deg, #047857 0%, #059669 100%)'
    : 'linear-gradient(145deg, #B91C1C 0%, #DC2626 100%)'
  const accent = isGreen ? '#059669' : '#DC2626'
  const canInteract = !!(onClick && !disabled && !locked)

  return (
    <motion.div
      onClick={canInteract ? onClick : undefined}
      tabIndex={canInteract ? 0 : undefined}
      role={canInteract ? 'button' : undefined}
      whileHover={canInteract ? { y: -6, scale: 1.04 } : {}}
      whileTap={canInteract ? { scale: 0.97 } : {}}
      animate={selected ? { y: -10 } : { y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{
        width: d.w,
        height: d.h,
        borderRadius: 10,
        background: bg,
        border: `2px solid ${selected ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.18)'}`,
        boxShadow: selected
          ? `0 10px 28px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.25)`
          : '0 3px 12px rgba(0,0,0,0.22)',
        padding: d.pad,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: canInteract ? 'pointer' : 'default',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        opacity: disabled && !locked ? 0.6 : 1,
      }}
    >
      {/* Top-left suit icon */}
      <SuitIcon type={card.type} size={d.icon} />

      {/* Centered card text */}
      <p style={{
        fontSize: d.text,
        fontWeight: 700,
        color: '#fff',
        lineHeight: 1.3,
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${d.pad / 2}px 0`,
        textShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}>
        {card.text}
      </p>

      {/* Bottom-right suit icon (rotated) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ transform: 'rotate(180deg)' }}>
          <SuitIcon type={card.type} size={d.icon} />
        </div>
      </div>

      {/* Selected / locked check badge */}
      {(selected || locked) && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5 L3.5 6.5 L7.5 2.5" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}

      {/* Subtle inner highlight */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
        pointerEvents: 'none', borderRadius: '10px 10px 0 0',
      }} />
    </motion.div>
  )
}

function SuitIcon({ type, size }: { type: 'green' | 'red'; size: number }) {
  if (type === 'green') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 14 C8 14 3 10 3 6 A5 5 0 0 1 13 6 C13 10 8 14 8 14Z" fill="#fff" opacity="0.9" />
        <line x1="8" y1="14" x2="8" y2="9" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M8 11.5 C8 11.5 6 10.5 5.2 8.5" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="9.5" r="5" fill="#fff" opacity="0.9" />
      <rect x="7" y="2" width="2" height="4" rx="1" fill="#fff" opacity="0.7" />
      <circle cx="11" cy="3.5" r="1.5" fill="#fff" opacity="0.4" />
      <circle cx="6.2" cy="8" r="1.1" fill="rgba(0,0,0,0.15)" opacity="0.5" />
    </svg>
  )
}

// ── Turn queue ────────────────────────────────────────────────────────────────

export function TurnQueue({ pitchOrder, players, greenSubmissions, myPlayerId, currentPitcherId }: {
  pitchOrder: string[]
  players: Player[]
  greenSubmissions: RoundSubmission[]
  myPlayerId: string
  currentPitcherId: string | null
}) {
  if (!pitchOrder.length) return null
  const subMap = new Map(greenSubmissions.map(s => [s.player_id, s.card_ids?.length ?? 0]))
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
      {pitchOrder.map(pid => {
        const player = players.find(p => p.id === pid)
        const count = subMap.get(pid) ?? 0
        const done = count >= 2
        const active = pid === currentPitcherId
        const isMe = pid === myPlayerId
        return (
          <div
            key={pid}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              background: done ? '#F0FDF4' : active ? '#FFF1F2' : '#F9FAFB',
              border: `2px solid ${done ? '#059669' : active ? 'var(--red)' : '#E5E7EB'}`,
              fontSize: 12,
              fontWeight: 800,
              color: done ? '#059669' : active ? 'var(--red)' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span>{done ? '✓' : active ? `${count}/2` : '○'}</span>
            <span>{player?.name ?? '...'}{isMe ? ' (kamu)' : ''}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Green pick phase — sequential, 2 cards per player ────────────────────────

interface GreenPickProps {
  greenCards: Card[]
  redCards: Card[]
  onSubmit: (cardId: string) => void
  submitting: boolean
  mySubmittedCardIds: string[]          // 0, 1, or 2 already submitted
  isMyTurn: boolean
  currentPitcherId: string | null
  pitchOrder: string[]
  players: Player[]
  greenSubmissions: RoundSubmission[]
}

export function GreenPickPhase({
  greenCards, redCards, onSubmit, submitting,
  mySubmittedCardIds, isMyTurn,
  currentPitcherId, pitchOrder, players, greenSubmissions,
}: GreenPickProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const sentCount = mySubmittedCardIds.length
  const canSendMore = sentCount < 2

  // Done with my turn (2 cards sent)
  if (sentCount >= 2 && !isMyTurn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <PhaseHeader phase={1} title="Green Flag Terkirim!" desc="2 green flag sudah dikirim ke jomblo" color="var(--green)" />
        <TurnQueue pitchOrder={pitchOrder} players={players} greenSubmissions={greenSubmissions} myPlayerId="" currentPitcherId={currentPitcherId} />
        <SubmittedWaiting label="Menunggu pemain lain..." sublabel="Hakim sedang mengawasi kartu masuk" />
      </div>
    )
  }

  // Not my turn — waiting
  if (!isMyTurn) {
    const currentPitcher = players.find(p => p.id === currentPitcherId)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <PhaseHeader phase={1} title="Pilih Green Flag" desc="Setiap pemain mengirim 2 green flag satu per satu" color="var(--green)" />
        <div style={{
          background: '#F0FDF4', border: '2px solid #BBF7D0',
          borderRadius: 16, padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: 'var(--green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M5 9 L8 12 L13 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 11, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Giliran sekarang</p>
            <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--navy)' }}>{currentPitcher?.name ?? '...'}</p>
          </div>
        </div>
        <TurnQueue pitchOrder={pitchOrder} players={players} greenSubmissions={greenSubmissions} myPlayerId="" currentPitcherId={currentPitcherId} />
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}><LoadingDots /></div>
      </div>
    )
  }

  // My turn! — 2×2 grid of all green cards, red cards shown disabled
  const cardNr = sentCount + 1

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PhaseHeader
        phase={1}
        title={`Giliranmu — Green Flag ke-${cardNr}`}
        desc={sentCount === 0 ? 'Pilih green flag pertamamu untuk jomblo' : 'Satu lagi! Pilih green flag keduamu'}
        color="var(--green)"
      />

      {/* All green cards in 2×2 grid */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Green Flag
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 112px)', gap: 12, justifyContent: 'center' }}>
          {greenCards.map(card => {
            const isSubmitted = mySubmittedCardIds.includes(card.id)
            return (
              <PlayingCard
                key={card.id}
                card={card}
                size="md"
                locked={isSubmitted}
                selected={!isSubmitted && selected === card.id}
                onClick={!isSubmitted && canSendMore ? () => setSelected(selected === card.id ? null : card.id) : undefined}
              />
            )
          })}
        </div>
      </div>

      {/* Red cards disabled preview */}
      {redCards.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
              Red Flag — Fase Sabotase
            </p>
            <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {redCards.map(card => (
              <PlayingCard key={card.id} card={card} size="md" disabled />
            ))}
          </div>
        </div>
      )}

      <TurnQueue pitchOrder={pitchOrder} players={players} greenSubmissions={greenSubmissions} myPlayerId="" currentPitcherId={currentPitcherId} />

      <Button
        size="lg"
        onClick={() => { if (selected) { onSubmit(selected); setSelected(null) } }}
        disabled={!selected}
        loading={submitting}
        style={{ width: '100%' }}
      >
        {selected ? (sentCount === 0 ? 'Kirim Green Flag Pertama' : 'Kirim Green Flag Kedua') : 'Pilih green flag dulu'}
      </Button>
    </motion.div>
  )
}

// ── Sabotage phase — turn-based, shows target's green cards ──────────────────

interface SabotageProps {
  redCards: Card[]
  targetPlayer: Player | null
  targetGreenCards: Card[]              // target's submitted green cards
  onSubmit: (cardId: string) => void
  submitting: boolean
  submitted: boolean                    // I sent my red card
  isMyTurn: boolean                     // am I the current sabotager?
  currentSabotagerId: string | null
  currentSabotageTargetId: string | null
  players: Player[]
}

export function SabotagePhase({
  redCards, targetPlayer, targetGreenCards,
  onSubmit, submitting, submitted,
  isMyTurn, currentSabotagerId, currentSabotageTargetId, players,
}: SabotageProps) {
  const [selected, setSelected] = useState<string | null>(null)

  // Done — waiting for next player
  if (submitted) {
    const currentTarget = players.find(p => p.id === currentSabotageTargetId)
    const currentSabotager = players.find(p => p.id === currentSabotagerId)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <PhaseHeader phase={2} title="Sabotase Terkirim!" desc="Menunggu giliran berikutnya..." color="var(--red)" />
        {currentSabotageTargetId && currentSabotagerId && (
          <div style={{
            background: '#FFF1F2', border: '2px solid #FECDD3',
            borderRadius: 14, padding: '12px 16px',
          }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#9F1239' }}>
              {currentSabotager?.name} sedang menyabotase {currentTarget?.name}...
            </p>
          </div>
        )}
        <SubmittedWaiting label="Menunggu semua selesai" sublabel="Hakim akan memulai penilaian" />
      </div>
    )
  }

  // Not my turn — waiting
  if (!isMyTurn) {
    const currentTarget = players.find(p => p.id === currentSabotageTargetId)
    const currentSabotager = players.find(p => p.id === currentSabotagerId)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <PhaseHeader phase={2} title="Fase Sabotase" desc="Pemain mengirim red flag satu per satu" color="var(--red)" />
        {currentSabotager && currentTarget && (
          <div style={{
            background: '#FFF1F2', border: '2px solid #FECDD3',
            borderRadius: 14, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <BombIcon />
            <div>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#9F1239', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Sedang berlangsung
              </p>
              <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)' }}>
                {currentSabotager.name} → {currentTarget.name}
              </p>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}><LoadingDots /></div>
      </div>
    )
  }

  // My turn to sabotage — show target's green cards and my red cards
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PhaseHeader phase={2} title={`Sabotas ${targetPlayer?.name ?? ''}!`} desc="Pilih red flag terbaikmu untuk merusak pitch mereka" color="var(--red)" />

      {/* Target's green combo */}
      {targetGreenCards.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Pitch {targetPlayer?.name}:
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {targetGreenCards.map(card => (
              <PlayingCard key={card.id} card={card} size="md" disabled />
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: '#F3F4F6' }} />

      {/* My red cards to pick from */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9F1239', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Kartu merahmu:
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {redCards.map(card => (
            <PlayingCard
              key={card.id}
              card={card}
              selected={selected === card.id}
              onClick={() => setSelected(selected === card.id ? null : card.id)}
            />
          ))}
        </div>
      </div>

      <Button
        size="lg"
        onClick={() => selected && onSubmit(selected)}
        disabled={!selected}
        loading={submitting}
        style={{ width: '100%' }}
      >
        {selected ? `Sabotase ${targetPlayer?.name}!` : 'Pilih red flag dulu'}
      </Button>
    </motion.div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function PhaseHeader({ phase, title, desc, color }: { phase: number; title: string; desc: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 900, fontSize: 16, flexShrink: 0,
      }}>
        {phase}
      </div>
      <div>
        <h2 style={{ fontWeight: 900, fontSize: 20, color: 'var(--navy)', lineHeight: 1.1 }}>{title}</h2>
        <p style={{ color: '#6b7280', fontWeight: 600, fontSize: 13, marginTop: 3 }}>{desc}</p>
      </div>
    </div>
  )
}

export function SubmittedWaiting({ label, sublabel }: { label: string; sublabel: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '28px 0' }}
    >
      <CheckCircle />
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--navy)' }}>{label}</p>
        <p style={{ color: '#6b7280', fontWeight: 600, fontSize: 13, marginTop: 4 }}>{sublabel}</p>
      </div>
      <LoadingDots />
    </motion.div>
  )
}

function BombIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="16" r="10" fill="var(--red)" />
      <rect x="13" y="4" width="3" height="6" rx="1.5" fill="#9F1239" />
      <circle cx="18" cy="5" r="2.5" fill="var(--red)" opacity="0.5" />
      <circle cx="9" cy="13" r="2" fill="#fff" opacity="0.3" />
    </svg>
  )
}

function CheckCircle() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden>
      <circle cx="28" cy="28" r="24" fill="#F0FDF4" />
      <path d="M17 28 L24 35 L39 20" stroke="var(--green)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18, ease: 'easeInOut', type: 'tween' }}
          style={{ width: 7, height: 7, borderRadius: '50%', background: '#9ca3af' }}
        />
      ))}
    </div>
  )
}
