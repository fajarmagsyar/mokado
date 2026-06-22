import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createUniqueRoomCode } from '@/lib/game/logic'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Harus login untuk membuat room' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const maxPlayers = body.max_players ?? 8
  const roundsTotal = body.rounds_total ?? 5

  const code = await createUniqueRoomCode(supabase)

  const { data: room, error } = await supabase
    .from('rooms')
    .insert({
      code,
      host_id: user.id,
      max_players: maxPlayers,
      rounds_total: roundsTotal,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Add host as player, return player record for client
  const { data: hostPlayer } = await supabase
    .from('players')
    .insert({
      room_id: room.id,
      user_id: user.id,
      name: body.host_name ?? 'Host',
      is_host: true,
      is_ready: true,
    })
    .select()
    .single()

  return NextResponse.json({ room, player: hostPlayer }, { status: 201 })
}
