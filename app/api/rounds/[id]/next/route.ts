import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { advanceToNextRound } from '@/lib/game/logic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { player_id } = await request.json()

  if (!player_id) {
    return NextResponse.json({ error: 'player_id diperlukan' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: round } = await supabase
    .from('rounds')
    .select('*, rooms(*)')
    .eq('id', id)
    .single()

  if (!round) {
    return NextResponse.json({ error: 'Round tidak ditemukan' }, { status: 404 })
  }

  if (round.status !== 'finished') {
    return NextResponse.json({ error: 'Round belum selesai' }, { status: 400 })
  }

  // Verify player is host
  const { data: hostPlayer } = await supabase
    .from('players')
    .select('is_host')
    .eq('id', player_id)
    .eq('room_id', round.room_id)
    .single()

  if (!hostPlayer?.is_host) {
    return NextResponse.json({ error: 'Hanya host yang bisa lanjut ke round berikutnya' }, { status: 403 })
  }

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', round.room_id)
    .order('joined_at')

  const nextRound = await advanceToNextRound(
    supabase,
    round.room_id,
    round.round_number,
    round.rooms.rounds_total,
    players ?? []
  )

  return NextResponse.json({ round: nextRound, finished: nextRound === null })
}
