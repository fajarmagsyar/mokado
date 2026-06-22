'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Card, GameState, Player, Room, Round, RoundSabotage, RoundSubmission } from '@/lib/game/types'

interface UseRoomOptions {
  code: string
  myPlayerId: string | null
}

export function useRoom({ code, myPlayerId }: UseRoomOptions) {
  const [state, setState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchState = useCallback(async () => {
    const res = await fetch(`/api/rooms/${code}/state`)
    if (!res.ok) { setError('Gagal memuat state game'); return }
    const data = await res.json()

    const currentRound: Round | null = data.currentRound
    const players: Player[] = data.players ?? []
    const myPlayer = myPlayerId ? players.find(p => p.id === myPlayerId) ?? null : null

    let myGreenCards: Card[] = []
    let myRedCards: Card[] = []

    if (currentRound && myPlayerId && myPlayer && currentRound.judge_player_id !== myPlayerId) {
      const handRes = await fetch(`/api/rounds/${currentRound.id}/hand?player_id=${myPlayerId}`)
      if (handRes.ok) {
        const handData = await handRes.json()
        myGreenCards = handData.green_cards ?? []
        myRedCards = handData.red_cards ?? []
      }
    }

    const greenSubmissions: RoundSubmission[] = data.greenSubmissions ?? []
    const sabotageSubmissions: RoundSabotage[] = data.sabotageSubmissions ?? []

    setState({
      room: data.room as Room,
      players,
      currentRound,
      myPlayer,
      myGreenCards,
      myRedCards,
      greenSubmissions,
      sabotageSubmissions,
      greenSubmittedPlayerIds: greenSubmissions.map((s: RoundSubmission) => s.player_id),
      sabotageSubmittedPlayerIds: sabotageSubmissions.map((s: RoundSabotage) => s.giver_player_id),
      isJudge: !!(currentRound && myPlayerId && currentRound.judge_player_id === myPlayerId),
    })
    setLoading(false)
  }, [code, myPlayerId])

  useEffect(() => { fetchState() }, [fetchState])

  useEffect(() => {
    if (!code) return
    const channel = supabase
      .channel(`room:${code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${code}` }, () => fetchState())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => fetchState())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rounds' }, () => fetchState())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'round_submissions' }, () => fetchState())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'round_sabotage' }, () => fetchState())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [code, fetchState, supabase])

  return { state, loading, error, refetch: fetchState }
}
