import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNonJudgePlayers } from '@/lib/game/logic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = await createClient()

  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (!room) return NextResponse.json({ error: 'Room tidak ditemukan' }, { status: 404 })

  const [{ data: players }, { data: rounds }] = await Promise.all([
    supabase.from('players').select('*').eq('room_id', room.id).order('joined_at'),
    supabase.from('rounds').select('*').eq('room_id', room.id).order('round_number'),
  ])

  const currentRound = rounds?.find(r => r.round_number === room.current_round) ?? null

  let greenSubmissions: unknown[] = []
  let sabotageSubmissions: unknown[] = []
  let pitchOrder: string[] = []
  let currentPitcherId: string | null = null
  let allGreenDone = false
  let currentSabotageTargetId: string | null = null
  let currentSabotagerId: string | null = null

  if (currentRound) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nonJudgePlayers = getNonJudgePlayers((players ?? []) as any, currentRound.judge_player_id)
    pitchOrder = nonJudgePlayers.map(p => p.id)

    if (currentRound.status === 'pitching_green') {
      const { data: subs } = await supabase
        .from('round_submissions')
        .select('id, player_id, card_ids, submitted_at')
        .eq('round_id', currentRound.id)
        .order('submitted_at')

      // Fetch card details for all submitted green cards
      const allCardIds = [...new Set((subs ?? []).flatMap(s => s.card_ids ?? []).filter(Boolean))] as string[]
      let cardMap: Record<string, unknown> = {}
      if (allCardIds.length > 0) {
        const { data: cards } = await supabase.from('cards').select('*').in('id', allCardIds)
        cardMap = Object.fromEntries((cards ?? []).map(c => [c.id, c]))
      }

      greenSubmissions = (subs ?? []).map(sub => ({
        ...sub,
        cards: (sub.card_ids ?? []).map((cid: string) => cardMap[cid]).filter(Boolean),
      }))

      // currentPitcherId = first player with < 2 cards submitted
      const subMap = new Map((subs ?? []).map(s => [s.player_id, (s.card_ids as string[])?.length ?? 0]))
      const currentPitcher = nonJudgePlayers.find(p => (subMap.get(p.id) ?? 0) < 2)
      currentPitcherId = currentPitcher?.id ?? null
      allGreenDone = !currentPitcher

    } else if (currentRound.status === 'sabotage') {
      // Fetch ALL green submissions with card details (judge + sabotager both need to see combos)
      const { data: subs } = await supabase
        .from('round_submissions')
        .select('id, player_id, card_ids, submitted_at')
        .eq('round_id', currentRound.id)

      const allGreenIds = [...new Set((subs ?? []).flatMap(s => s.card_ids ?? []).filter(Boolean))] as string[]
      let greenCardMap: Record<string, unknown> = {}
      if (allGreenIds.length > 0) {
        const { data: cards } = await supabase.from('cards').select('*').in('id', allGreenIds)
        greenCardMap = Object.fromEntries((cards ?? []).map(c => [c.id, c]))
      }

      greenSubmissions = (subs ?? []).map(sub => ({
        ...sub,
        cards: (sub.card_ids ?? []).map((cid: string) => greenCardMap[cid]).filter(Boolean),
      }))

      // Fetch sabotage submissions with red card details
      const { data: sabs } = await supabase
        .from('round_sabotage')
        .select('id, round_id, giver_player_id, receiver_player_id, card_id, created_at')
        .eq('round_id', currentRound.id)

      const redCardIds = (sabs ?? []).map(s => s.card_id).filter(Boolean) as string[]
      let redCardMap: Record<string, unknown> = {}
      if (redCardIds.length > 0) {
        const { data: cards } = await supabase.from('cards').select('*').in('id', redCardIds)
        redCardMap = Object.fromEntries((cards ?? []).map(c => [c.id, c]))
      }

      sabotageSubmissions = (sabs ?? []).map(sab => ({
        ...sab,
        card: sab.card_id ? (redCardMap[sab.card_id] ?? null) : null,
      }))

      // Compute current sabotage turn
      const receivedIds = (sabs ?? []).map(s => s.receiver_player_id)
      const currentTargetIdx = nonJudgePlayers.findIndex(p => !receivedIds.includes(p.id))
      if (currentTargetIdx >= 0) {
        currentSabotageTargetId = nonJudgePlayers[currentTargetIdx].id
        const sabotagerIdx = (currentTargetIdx - 1 + nonJudgePlayers.length) % nonJudgePlayers.length
        currentSabotagerId = nonJudgePlayers[sabotagerIdx].id
      }

    } else {
      // judging / finished: just need submission presence (no card data — JudgeView fetches separately)
      const [{ data: subs }, { data: sabs }] = await Promise.all([
        supabase.from('round_submissions').select('id, player_id, submitted_at').eq('round_id', currentRound.id),
        supabase.from('round_sabotage').select('id, giver_player_id, receiver_player_id').eq('round_id', currentRound.id),
      ])
      greenSubmissions = subs ?? []
      sabotageSubmissions = sabs ?? []
    }
  }

  return NextResponse.json({
    room,
    players: players ?? [],
    currentRound,
    rounds: rounds ?? [],
    greenSubmissions,
    sabotageSubmissions,
    pitchOrder,
    currentPitcherId,
    allGreenDone,
    currentSabotageTargetId,
    currentSabotagerId,
  })
}
