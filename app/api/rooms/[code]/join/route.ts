import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const { name } = await request.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nama diperlukan' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: room } = await supabase
    .from('rooms')
    .select('id, status, max_players')
    .eq('code', code.toUpperCase())
    .single()

  if (!room) {
    return NextResponse.json({ error: 'Room tidak ditemukan' }, { status: 404 })
  }

  if (room.status !== 'waiting') {
    return NextResponse.json({ error: 'Game sudah dimulai' }, { status: 400 })
  }

  const { count } = await supabase
    .from('players')
    .select('id', { count: 'exact', head: true })
    .eq('room_id', room.id)

  if ((count ?? 0) >= room.max_players) {
    return NextResponse.json({ error: 'Room sudah penuh' }, { status: 400 })
  }

  const { data: { user } } = await supabase.auth.getUser()

  const { data: player, error } = await supabase
    .from('players')
    .insert({
      room_id: room.id,
      user_id: user?.id ?? null,
      name: name.trim(),
      is_host: false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ player, room_id: room.id }, { status: 201 })
}
