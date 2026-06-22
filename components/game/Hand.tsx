'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import type { Card } from '@/lib/game/types'

// ── Green pick phase: choose 2 green cards ──────────────────────────────────
interface GreenPickProps {
  greenCards: Card[]
  onSubmit: (cardIds: string[]) => void
  submitting: boolean
  submitted: boolean
}

export function GreenPickPhase({ greenCards, onSubmit, submitting, submitted }: GreenPickProps) {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 2 ? [...prev, id] : prev
    )
  }

  if (submitted) return <SubmittedWaiting label="Kartu hijau terkirim!" sublabel="Menunggu fase sabotase..." />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PhaseHeader
        phase={1}
        title="Pilih 2 Kartu Hijau"
        desc="Pilih kartu terbaikmu untuk dijual ke hakim"
        color="var(--green)"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {greenCards.map((card, i) => {
          const isSelected = selected.includes(card.id)
          const isDisabled = selected.length >= 2 && !isSelected
          return (
            <CardButton
              key={card.id}
              card={card}
              index={i}
              isSelected={isSelected}
              isDisabled={isDisabled}
              selIndex={selected.indexOf(card.id)}
              onClick={() => !isDisabled && toggle(card.id)}
              accentColor="var(--green)"
              bgColor="#F0FDF4"
              selectedBorder="#00875A"
            />
          )
        })}
      </div>

      <motion.div
        animate={selected.length === 2 ? { y: [0, -3, 0] } : {}}
        transition={{ repeat: Infinity, duration: 1.5, type: 'tween' }}
      >
        <Button
          size="lg"
          onClick={() => onSubmit(selected)}
          disabled={selected.length !== 2}
          loading={submitting}
          style={{ width: '100%' }}
        >
          Kirim {selected.length === 2 ? '2 Kartu Hijau' : `(${selected.length}/2)`}
        </Button>
      </motion.div>
    </motion.div>
  )
}

// ── Sabotage phase: choose 1 red card to give to next player ─────────────────
interface SabotageProps {
  redCards: Card[]
  targetPlayerName: string
  onSubmit: (cardId: string) => void
  submitting: boolean
  submitted: boolean
}

export function SabotagePhase({ redCards, targetPlayerName, onSubmit, submitting, submitted }: SabotageProps) {
  const [selected, setSelected] = useState<string | null>(null)

  if (submitted) return <SubmittedWaiting label="Sabotase terkirim!" sublabel="Menunggu pemain lain..." />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PhaseHeader
        phase={2}
        title="Fase Sabotase"
        desc={`Pilih 1 kartu merah untuk diberikan ke ${targetPlayerName}`}
        color="var(--red)"
      />

      {/* Target callout */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: '#FFF1F2',
          border: '2px solid #FECDD3',
          borderRadius: 14,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <BombIcon />
        <div>
          <p style={{ fontWeight: 800, fontSize: 13, color: '#9F1239' }}>Target Sabotasemu</p>
          <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--red)' }}>{targetPlayerName}</p>
        </div>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {redCards.map((card, i) => {
          const isSelected = selected === card.id
          return (
            <CardButton
              key={card.id}
              card={card}
              index={i}
              isSelected={isSelected}
              isDisabled={false}
              selIndex={isSelected ? 0 : -1}
              onClick={() => setSelected(isSelected ? null : card.id)}
              accentColor="var(--red)"
              bgColor="#FFF1F2"
              selectedBorder="var(--red)"
            />
          )
        })}
      </div>

      <Button
        size="lg"
        onClick={() => selected && onSubmit(selected)}
        disabled={!selected}
        loading={submitting}
        style={{ width: '100%', background: selected ? 'var(--red)' : undefined }}
      >
        {selected ? `Sabotase ${targetPlayerName}!` : 'Pilih kartu merah'}
      </Button>
    </motion.div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function PhaseHeader({ phase, title, desc, color }: { phase: number; title: string; desc: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 900,
        fontSize: 16,
        flexShrink: 0,
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

function CardButton({
  card, index, isSelected, isDisabled, selIndex, onClick, accentColor, bgColor, selectedBorder,
}: {
  card: Card
  index: number
  isSelected: boolean
  isDisabled: boolean
  selIndex: number
  onClick: () => void
  accentColor: string
  bgColor: string
  selectedBorder: string
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
      whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '14px 16px',
        border: `2.5px solid ${isSelected ? selectedBorder : '#E5E7EB'}`,
        boxShadow: isSelected ? `0 4px 16px ${accentColor}33` : '0 2px 8px rgba(0,0,0,0.05)',
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? 0.4 : 1,
        textAlign: 'left',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <FlagDot color={accentColor} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', lineHeight: 1.35 }}>{card.text}</p>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginTop: 2 }}>{card.category}</p>
      </div>
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: accentColor,
              color: '#fff',
              fontWeight: 900,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {selIndex >= 0 ? selIndex + 1 : '✓'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function SubmittedWaiting({ label, sublabel }: { label: string; sublabel: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '48px 0' }}
    >
      <CheckCircle />
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: 900, fontSize: 20, color: 'var(--navy)' }}>{label}</p>
        <p style={{ color: '#6b7280', fontWeight: 600, fontSize: 14, marginTop: 4 }}>{sublabel}</p>
      </div>
      <LoadingDots />
    </motion.div>
  )
}

function FlagDot({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="3" y="1.5" width="2" height="15" rx="1" fill={color} opacity="0.5" />
      <path d="M5 3 L15 6.5 L5 10 Z" fill={color} />
    </svg>
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
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="28" fill="#F0FDF4" />
      <circle cx="32" cy="32" r="20" fill="var(--green)" opacity="0.15" />
      <path d="M20 32 L28 40 L44 24" stroke="var(--green)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: 'easeInOut', type: 'tween' }}
          style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', opacity: 0.6 }}
        />
      ))}
    </div>
  )
}
