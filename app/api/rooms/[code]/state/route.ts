import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  if (currentRound) {
    const [{ data: subs }, { data: sabs }] = await Promise.all([
      supabase
        .from('round_submissions')
        .select('id, round_id, player_id, submitted_at')  // no card_ids during pitching for privacy
        .eq('round_id', currentRound.id),
      supabase
        .from('round_sabotage')
        .select('id, round_id, giver_player_id, receiver_player_id')  // no card_id for privacy
        .eq('round_id', currentRound.id),
    ])
    greenSubmissions = subs ?? []
    sabotageSubmissions = sabs ?? []
  }

  return NextResponse.json({
    room,
    players: players ?? [],
    currentRound,
    rounds: rounds ?? [],
    greenSubmissions,
    sabotageSubmissions,
  })
}
