'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { Lobby } from '@/components/game/Lobby'
import { GameBoard } from '@/components/game/GameBoard'
import { MokadoLoader } from '@/components/ui/MokadoLoader'

interface Props {
  params: Promise<{ code: string }>
}

export default function RoomPage({ params }: Props) {
  const { code } = use(params)
  const router = useRouter()

  const [myPlayerId, setMyPlayerId] = useState<string | null>(null)
  const [idReady, setIdReady] = useState(false)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(`player_id_${code}`)
    if (stored) setMyPlayerId(stored)
    setIdReady(true)
  }, [code])

  const { state, loading, error, refetch } = useRoom({ code, myPlayerId })

  useEffect(() => {
    if (idReady && !loading && state && (!myPlayerId || !state.myPlayer)) {
      router.replace('/join')
    }
  }, [idReady, loading, state, myPlayerId, router])

  const handleStart = async () => {
    setStarting(true)
    await fetch(`/api/rooms/${code}/start`, { method: 'POST' })
    setStarting(false)
    refetch()
  }

  const handleLeave = async () => {
    if (myPlayerId) {
      await fetch(`/api/rooms/${code}/leave`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: myPlayerId }),
      })
      localStorage.removeItem(`player_id_${code}`)
    }
    router.push('/')
  }

  if (loading) {
    return <MokadoLoader label="Memuat room" />
  }

  if (error || !state) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-xl">{error ?? 'Room tidak ditemukan'}</p>
        <a href="/" className="text-gray-400 underline">Kembali</a>
      </div>
    )
  }

  if (!myPlayerId || !state.myPlayer) return null

  if (state.room.status === 'waiting') {
    return (
      <Lobby
        state={state}
        onStart={handleStart}
        onLeave={handleLeave}
        starting={starting}
      />
    )
  }

  return <GameBoard state={state} roomCode={code} onStateChange={refetch} />
}
