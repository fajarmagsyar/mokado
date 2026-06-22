import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNonJudgePlayers } from '@/lib/game/logic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { player_id, card_ids } = await request.json()

  if (!player_id || !Array.isArray(card_ids) || card_ids.length !== 2) {
    return NextResponse.json({ error: 'player_id dan tepat 2 card_ids diperlukan' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: round } = await supabase
    .from('rounds')
    .select('status, judge_player_id, room_id')
    .eq('id', id)
    .single()

  if (!round) return NextResponse.json({ error: 'Round tidak ditemukan' }, { status: 404 })
  if (round.status !== 'pitching_green') return NextResponse.json({ error: 'Bukan fase pilih kartu hijau' }, { status: 400 })
  if (round.judge_player_id === player_id) return NextResponse.json({ error: 'Hakim tidak bisa submit' }, { status: 400 })

  // Validate: both cards must be green and in player's hand
  const { data: hand } = await supabase
    .from('player_hands')
    .select('card_ids')
    .eq('round_id', id)
    .eq('player_id', player_id)
    .single()

  if (!hand) return NextResponse.json({ error: 'Kartu tidak ditemukan' }, { status: 400 })

  const inHand = card_ids.every((cid: string) => hand.card_ids.includes(cid))
  if (!inHand) return NextResponse.json({ error: 'Kartu tidak ada di tangan' }, { status: 400 })

  // Validate all chosen cards are green
  const { data: chosenCards } = await supabase.from('cards').select('type').in('id', card_ids)
  const allGreen = chosenCards?.every(c => c.type === 'green')
  if (!allGreen) return NextResponse.json({ error: 'Harus pilih kartu hijau' }, { status: 400 })

  const { data: submission, error } = await supabase
    .from('round_submissions')
    .upsert({ round_id: id, player_id, card_ids }, { onConflict: 'round_id,player_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Check if all non-judge players have submitted green picks
  const { data: players } = await supabase
    .from('players')
    .select('id, joined_at')
    .eq('room_id', round.room_id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nonJudgePlayers = getNonJudgePlayers((players ?? []) as any, round.judge_player_id)
  const { count } = await supabase
    .from('round_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('round_id', id)

  if ((count ?? 0) >= nonJudgePlayers.length) {
    // All green picks in → advance to sabotage phase
    await supabase.from('rounds').update({ status: 'sabotage' }).eq('id', id)
  }

  return NextResponse.json({ submission })
}
