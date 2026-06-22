import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNonJudgePlayers } from '@/lib/game/logic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { player_id, card_id } = await request.json()

  if (!player_id || !card_id) {
    return NextResponse.json({ error: 'player_id dan card_id diperlukan' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: round } = await supabase
    .from('rounds')
    .select('status, judge_player_id, room_id')
    .eq('id', id)
    .single()

  if (!round) return NextResponse.json({ error: 'Round tidak ditemukan' }, { status: 404 })
  if (round.status !== 'sabotage') return NextResponse.json({ error: 'Bukan fase sabotase' }, { status: 400 })
  if (round.judge_player_id === player_id) return NextResponse.json({ error: 'Jomblo tidak bisa sabotase' }, { status: 400 })

  // Validate it's this player's turn — sequential: currentSabotagerId must match player_id
  const { data: players } = await supabase
    .from('players')
    .select('id, joined_at')
    .eq('room_id', round.room_id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nonJudgePlayers = getNonJudgePlayers((players ?? []) as any, round.judge_player_id)

  const { data: existingSabs } = await supabase
    .from('round_sabotage')
    .select('receiver_player_id')
    .eq('round_id', id)

  const receivedIds = (existingSabs ?? []).map(s => s.receiver_player_id)
  const currentTargetIdx = nonJudgePlayers.findIndex(p => !receivedIds.includes(p.id))

  if (currentTargetIdx === -1) {
    return NextResponse.json({ error: 'Sabotase sudah selesai' }, { status: 400 })
  }

  const currentTarget = nonJudgePlayers[currentTargetIdx]
  const currentSabotagerIdx = (currentTargetIdx - 1 + nonJudgePlayers.length) % nonJudgePlayers.length
  const currentSabotager = nonJudgePlayers[currentSabotagerIdx]

  if (currentSabotager.id !== player_id) {
    return NextResponse.json({ error: 'Bukan giliranmu untuk menyabotase' }, { status: 400 })
  }

  // Validate card is red and in player's hand
  const { data: hand } = await supabase
    .from('player_hands')
    .select('card_ids')
    .eq('round_id', id)
    .eq('player_id', player_id)
    .single()

  if (!hand || !hand.card_ids.includes(card_id)) {
    return NextResponse.json({ error: 'Kartu tidak ada di tangan' }, { status: 400 })
  }

  const { data: cardData } = await supabase.from('cards').select('type').eq('id', card_id).single()
  if (cardData?.type !== 'red') {
    return NextResponse.json({ error: 'Harus pilih kartu merah' }, { status: 400 })
  }

  const { data: sabotage, error } = await supabase
    .from('round_sabotage')
    .upsert(
      { round_id: id, giver_player_id: player_id, receiver_player_id: currentTarget.id, card_id },
      { onConflict: 'round_id,giver_player_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-advance to judging when all have sabotaged
  const { count } = await supabase
    .from('round_sabotage')
    .select('id', { count: 'exact', head: true })
    .eq('round_id', id)

  if ((count ?? 0) >= nonJudgePlayers.length) {
    await supabase.from('rounds').update({ status: 'judging' }).eq('id', id)
  }

  return NextResponse.json({ sabotage, target_player_id: currentTarget.id })
}

// GET: preview who this player will sabotage
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const playerId = searchParams.get('player_id')

  if (!playerId) return NextResponse.json({ error: 'player_id diperlukan' }, { status: 400 })

  const supabase = await createClient()

  const { data: round } = await supabase
    .from('rounds')
    .select('judge_player_id, room_id')
    .eq('id', id)
    .single()

  if (!round) return NextResponse.json({ error: 'Round tidak ditemukan' }, { status: 404 })

  const { data: players } = await supabase
    .from('players')
    .select('id, name, joined_at')
    .eq('room_id', round.room_id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nonJudgePlayers = getNonJudgePlayers((players ?? []) as any, round.judge_player_id)
  const giverIndex = nonJudgePlayers.findIndex(p => p.id === playerId)
  if (giverIndex === -1) return NextResponse.json({ target: null })

  const targetIndex = (giverIndex + 1) % nonJudgePlayers.length
  const targetPlayer = players?.find(p => p.id === nonJudgePlayers[targetIndex].id)

  return NextResponse.json({ target: targetPlayer ?? null })
}
