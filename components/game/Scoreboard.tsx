'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import { PlayerAvatar } from './PlayerAvatar'
import type { GameState } from '@/lib/game/types'

interface ScoreboardProps {
  state: GameState
  isFinished: boolean
  onNext?: () => void
  onNextLoading?: boolean
}

export function Scoreboard({ state, isFinished, onNext, onNextLoading }: ScoreboardProps) {
  const { players, currentRound, myPlayer } = state
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const winnerId = currentRound?.winner_player_id
  const winnerName = players.find(p => p.id === winnerId)?.name

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* Round winner banner */}
      <AnimatePresence>
        {!isFinished && winnerId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            style={{
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              border: '2.5px solid #F59E0B',
              borderRadius: 20,
              padding: '20px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 0 #D97706',
            }}
          >
            <TrophyIcon />
            <p style={{ color: '#92400E', fontSize: 12, fontWeight: 700, marginTop: 10 }}>
              Pemenang Ronde Ini
            </p>
            <motion.p
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', type: 'tween' }}
              style={{ color: '#78350F', fontWeight: 900, fontSize: 24, marginTop: 4 }}
            >
              {winnerName}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final winner */}
      {isFinished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{
            background: 'linear-gradient(135deg, var(--red) 0%, #FF6B6B 100%)',
            borderRadius: 20,
            padding: '28px 24px',
            textAlign: 'center',
            boxShadow: '0 6px 0 var(--red-dark)',
          }}
        >
          <ConfettiRain />
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Game Selesai!
          </p>
          <p style={{ color: '#fff', fontWeight: 900, fontSize: 28, marginTop: 6 }}>
            {sorted[0]?.name}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700, fontSize: 14, marginTop: 4 }}>
            menang dengan {sorted[0]?.score} poin
          </p>
        </motion.div>
      )}

      {/* Leaderboard */}
      <div>
        <p style={{ fontWeight: 800, fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
          Skor
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map((player, idx) => {
            const isWinner = player.id === winnerId
            const isMe = player.id === myPlayer?.id
            const medalColors = ['#F59E0B', '#9CA3AF', '#B45309']
            const medalColor = idx < 3 ? medalColors[idx] : 'transparent'

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06, type: 'spring', stiffness: 280, damping: 24 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: isWinner ? '#FFFBEB' : isMe ? '#FFF1F2' : '#fff',
                  borderRadius: 14,
                  padding: '12px 14px',
                  border: `2px solid ${isWinner ? '#FDE68A' : isMe ? '#FECDD3' : 'transparent'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: idx < 3 ? medalColor : '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 900,
                    color: idx < 3 ? '#fff' : '#9ca3af',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <PlayerAvatar name={player.name} index={players.indexOf(player)} size={32} />
                <p style={{ flex: 1, fontWeight: 800, fontSize: 14, color: 'var(--navy)' }}>
                  {player.name}
                  {isMe && <span style={{ color: '#9ca3af', fontWeight: 600, fontSize: 12 }}> (kamu)</span>}
                </p>
                <motion.div
                  animate={isWinner ? { scale: [1, 1.35, 1] } : {}}
                  transition={{ type: 'tween', duration: 0.4, ease: 'easeInOut' }}
                  style={{
                    fontWeight: 900,
                    fontSize: 22,
                    color: isWinner ? '#D97706' : 'var(--navy)',
                  }}
                >
                  {player.score}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {!isFinished && myPlayer?.is_host && onNext && (
        <Button size="lg" onClick={onNext} loading={onNextLoading} style={{ width: '100%' }}>
          Ronde Berikutnya
        </Button>
      )}
      {!isFinished && !myPlayer?.is_host && (
        <motion.div
          animate={{ opacity: [1, 0.55, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, type: 'tween' }}
          style={{
            background: '#F9FAFB',
            border: '2px solid #F3F4F6',
            borderRadius: 12,
            padding: 14,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#6b7280',
          }}
        >
          Menunggu host melanjutkan...
        </motion.div>
      )}
      {isFinished && (
        <Button variant="secondary" size="lg" onClick={() => { window.location.href = '/' }} style={{ width: '100%' }}>
          Kembali ke Beranda
        </Button>
      )}
    </motion.div>
  )
}

function TrophyIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden style={{ margin: '0 auto' }}>
      <path d="M14 6 H30 V22 C30 30 22 34 22 34 C22 34 14 30 14 22 Z" fill="#F59E0B" />
      <path d="M7 8 H14 C14 8 12 18 7 20 Z" fill="#FBBF24" opacity="0.7" />
      <path d="M37 8 H30 C30 8 32 18 37 20 Z" fill="#FBBF24" opacity="0.7" />
      <rect x="18" y="34" width="8" height="4" rx="1" fill="#D97706" />
      <rect x="14" y="38" width="16" height="3" rx="1.5" fill="#B45309" opacity="0.6" />
      <path d="M19 16 L22 14 L25 16 L24 20 L20 20 Z" fill="#fff" opacity="0.6" />
    </svg>
  )
}

function ConfettiRain() {
  const pieces = [
    { x: 15, color: '#FDE68A', size: 8, delay: 0 },
    { x: 40, color: '#fff', size: 6, delay: 0.2 },
    { x: 65, color: '#FECDD3', size: 7, delay: 0.1 },
    { x: 30, color: '#BBF7D0', size: 5, delay: 0.3 },
    { x: 75, color: '#FDE68A', size: 6, delay: 0.15 },
    { x: 85, color: '#fff', size: 5, delay: 0.25 },
  ]
  return (
    <div style={{ position: 'relative', height: 36, marginBottom: 10, overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, 50], opacity: [1, 0], rotate: [0, 180] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: p.delay, ease: 'easeIn', type: 'tween' }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  )
}
