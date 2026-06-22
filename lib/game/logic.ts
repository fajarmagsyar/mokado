import type { SupabaseClient } from '@supabase/supabase-js'
import type { Card, Player, Round } from './types'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export async function createUniqueRoomCode(supabase: SupabaseClient): Promise<string> {
  let code = generateRoomCode()
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase.from('rooms').select('id').eq('code', code).single()
    if (!data) break
    code = generateRoomCode()
  }
  return code
}

export async function dealCards(
  supabase: SupabaseClient,
  roundId: string,
  players: Player[],
  judgePlayerId: string
): Promise<void> {
  const { data: allCards } = await supabase.from('cards').select('id, type')
  if (!allCards) return

  const greenIds = allCards.filter((c: { id: string; type: string }) => c.type === 'green').map((c: { id: string }) => c.id)
  const redIds = allCards.filter((c: { id: string; type: string }) => c.type === 'red').map((c: { id: string }) => c.id)

  const nonJudgePlayers = players.filter(p => p.id !== judgePlayerId)

  const hands = nonJudgePlayers.map(player => {
    const shuffledGreen = [...greenIds].sort(() => Math.random() - 0.5).slice(0, 4)
    const shuffledRed = [...redIds].sort(() => Math.random() - 0.5).slice(0, 3)
    return {
      round_id: roundId,
      player_id: player.id,
      // Store green first (indices 0-3), then red (indices 4-6)
      card_ids: [...shuffledGreen, ...shuffledRed],
    }
  })

  await supabase.from('player_hands').insert(hands)
}

export async function startGame(
  supabase: SupabaseClient,
  roomId: string,
  players: Player[]
): Promise<Round | null> {
  const shuffled = [...players].sort(() => Math.random() - 0.5)
  const judgePlayer = shuffled[0]

  await supabase
    .from('rooms')
    .update({ status: 'playing', current_round: 1 })
    .eq('id', roomId)

  const { data: round } = await supabase
    .from('rounds')
    .insert({
      room_id: roomId,
      round_number: 1,
      judge_player_id: judgePlayer.id,
      status: 'pitching_green',
    })
    .select()
    .single()

  if (!round) return null

  await dealCards(supabase, round.id, players, judgePlayer.id)
  return round
}

// Returns players in a stable order (by joined_at), excluding judge
export function getNonJudgePlayers(players: Player[], judgePlayerId: string): Player[] {
  return players
    .filter(p => p.id !== judgePlayerId)
    .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime())
}

// Given player index i among non-judge players, returns the player who receives their red card
// Player i gives their red card to player (i+1) % n
export function getSabotageTarget(nonJudgePlayers: Player[], giverIndex: number): Player {
  return nonJudgePlayers[(giverIndex + 1) % nonJudgePlayers.length]
}

export async function advanceToNextRound(
  supabase: SupabaseClient,
  roomId: string,
  currentRoundNumber: number,
  roundsTotal: number,
  players: Player[]
): Promise<Round | null> {
  const nextRoundNumber = currentRoundNumber + 1

  if (nextRoundNumber > roundsTotal) {
    await supabase.from('rooms').update({ status: 'finished' }).eq('id', roomId)
    return null
  }

  const judgeIndex = (nextRoundNumber - 1) % players.length
  const judgePlayer = players.sort((a, b) =>
    new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
  )[judgeIndex]

  await supabase
    .from('rooms')
    .update({ current_round: nextRoundNumber })
    .eq('id', roomId)

  const { data: round } = await supabase
    .from('rounds')
    .insert({
      room_id: roomId,
      round_number: nextRoundNumber,
      judge_player_id: judgePlayer.id,
      status: 'pitching_green',
    })
    .select()
    .single()

  if (!round) return null

  await dealCards(supabase, round.id, players, judgePlayer.id)
  return round
}

export async function getCardsForIds(
  supabase: SupabaseClient,
  cardIds: string[]
): Promise<Card[]> {
  if (cardIds.length === 0) return []
  const { data } = await supabase.from('cards').select('*').in('id', cardIds)
  return data ?? []
}
