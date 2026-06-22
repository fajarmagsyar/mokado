import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { player_id, winner_player_id } = await request.json()

  if (!player_id || !winner_player_id) {
    return NextResponse.json({ error: 'player_id dan winner_player_id diperlukan' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: round } = await supabase
    .from('rounds')
    .select('*')
    .eq('id', id)
    .single()

  if (!round) {
    return NextResponse.json({ error: 'Round tidak ditemukan' }, { status: 404 })
  }

  if (round.judge_player_id !== player_id) {
    return NextResponse.json({ error: 'Hanya hakim yang bisa memilih pemenang' }, { status: 403 })
  }

  if (round.status !== 'judging') {
    return NextResponse.json({ error: 'Belum waktunya memilih pemenang' }, { status: 400 })
  }

  // Update round with winner
  await supabase
    .from('rounds')
    .update({ winner_player_id, status: 'finished' })
    .eq('id', id)

  // Increment winner score
  const { data: winner } = await supabase
    .from('players')
    .select('score')
    .eq('id', winner_player_id)
    .single()

  await supabase
    .from('players')
    .update({ score: (winner?.score ?? 0) + 1 })
    .eq('id', winner_player_id)

  return NextResponse.json({ success: true, winner_player_id })
}
