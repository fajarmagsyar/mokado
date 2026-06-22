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
  if (round.status !== 'pitching_green') return NextResponse.json({ error: 'Bukan fase pilih kartu hijau' }, { status: 400 })
  if (round.judge_player_id === player_id) return NextResponse.json({ error: 'Jomblo tidak bisa submit' }, { status: 400 })

  // Validate it's this player's turn (first in joined_at order with < 2 cards submitted)
  const { data: players } = await supabase
    .from('players')
    .select('id, joined_at')
    .eq('room_id', round.room_id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nonJudgePlayers = getNonJudgePlayers((players ?? []) as any, round.judge_player_id)

  const { data: existingSubs } = await supabase
    .from('round_submissions')
    .select('player_id, card_ids')
    .eq('round_id', id)

  const subMap = new Map((existingSubs ?? []).map(s => [s.player_id, s.card_ids as string[]]))
  const currentPitcher = nonJudgePlayers.find(p => (subMap.get(p.id)?.length ?? 0) < 2)

  if (!currentPitcher || currentPitcher.id !== player_id) {
    return NextResponse.json({ error: 'Bukan giliranmu' }, { status: 400 })
  }

  // Validate card is in player's hand and is green
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
  if (cardData?.type !== 'green') {
    return NextResponse.json({ error: 'Harus pilih kartu hijau' }, { status: 400 })
  }

  const currentCardIds = subMap.get(player_id) ?? []
  if (currentCardIds.includes(card_id)) {
    return NextResponse.json({ error: 'Kartu sudah dikirim' }, { status: 400 })
  }

  const newCardIds = [...currentCardIds, card_id]

  const { data: submission, error } = await supabase
    .from('round_submissions')
    .upsert({ round_id: id, player_id, card_ids: newCardIds }, { onConflict: 'round_id,player_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Phase advance is now manual — judge clicks "Continue to Sabotage"
  return NextResponse.json({ submission })
}
