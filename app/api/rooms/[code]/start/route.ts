import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startGame } from '@/lib/game/logic'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (!room) {
    return NextResponse.json({ error: 'Room tidak ditemukan' }, { status: 404 })
  }

  if (room.host_id !== user.id) {
    return NextResponse.json({ error: 'Hanya host yang bisa memulai game' }, { status: 403 })
  }

  if (room.status !== 'waiting') {
    return NextResponse.json({ error: 'Game sudah dimulai' }, { status: 400 })
  }

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', room.id)

  if (!players || players.length < 3) {
    return NextResponse.json({ error: 'Minimal 3 pemain untuk memulai' }, { status: 400 })
  }

  const round = await startGame(supabase, room.id, players)

  return NextResponse.json({ round })
}
