import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = await createClient()

  const { data: room, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (error || !room) {
    return NextResponse.json({ error: 'Room tidak ditemukan' }, { status: 404 })
  }

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', room.id)
    .order('joined_at')

  return NextResponse.json({ room, players: players ?? [] })
}

export async function DELETE(
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
    .select('id, host_id')
    .eq('code', code.toUpperCase())
    .single()

  if (!room) {
    return NextResponse.json({ error: 'Room tidak ditemukan' }, { status: 404 })
  }

  if (room.host_id !== user.id) {
    return NextResponse.json({ error: 'Hanya host yang bisa menghapus room' }, { status: 403 })
  }

  await supabase.from('rooms').delete().eq('id', room.id)
  return NextResponse.json({ success: true })
}
