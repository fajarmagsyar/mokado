'use client'

import { use, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { Lobby } from '@/components/game/Lobby'
import { GameBoard } from '@/components/game/GameBoard'

interface Props {
  params: Promise<{ code: string }>
}

export default function RoomPage({ params }: Props) {
  const { code } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()

  const [myPlayerId, setMyPlayerId] = useState<string | null>(
    searchParams.get('player_id')
  )
  const [starting, setStarting] = useState(false)

  // Persist player_id in sessionStorage so page refresh doesn't lose it
  useEffect(() => {
    const key = `player_id_${code}`
    const stored = sessionStorage.getItem(key)
    const fromUrl = searchParams.get('player_id')
    if (fromUrl) {
      sessionStorage.setItem(key, fromUrl)
      setMyPlayerId(fromUrl)
    } else if (stored) {
      setMyPlayerId(stored)
    }
  }, [code, searchParams])

  const { state, loading, error, refetch } = useRoom({ code, myPlayerId })

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
      sessionStorage.removeItem(`player_id_${code}`)
    }
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Memuat room...</p>
      </div>
    )
  }

  if (error || !state) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-xl">{error ?? 'Room tidak ditemukan'}</p>
        <a href="/" className="text-gray-400 underline">Kembali</a>
      </div>
    )
  }

  if (!myPlayerId || !state.myPlayer) {
    // Player_id not set or not in this room — redirect to join
    router.replace(`/join`)
    return null
  }

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
