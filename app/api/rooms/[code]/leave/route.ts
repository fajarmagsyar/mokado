import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const { player_id } = await request.json()

  if (!player_id) {
    return NextResponse.json({ error: 'player_id diperlukan' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: room } = await supabase
    .from('rooms')
    .select('id')
    .eq('code', code.toUpperCase())
    .single()

  if (!room) {
    return NextResponse.json({ error: 'Room tidak ditemukan' }, { status: 404 })
  }

  await supabase
    .from('players')
    .delete()
    .eq('id', player_id)
    .eq('room_id', room.id)

  return NextResponse.json({ success: true })
}
