import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNonJudgePlayers } from '@/lib/game/logic'

// Judge manually advances the phase once all players have finished
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { player_id } = await request.json()

  if (!player_id) return NextResponse.json({ error: 'player_id diperlukan' }, { status: 400 })

  const supabase = await createClient()

  const { data: round } = await supabase
    .from('rounds')
    .select('status, judge_player_id, room_id')
    .eq('id', id)
    .single()

  if (!round) return NextResponse.json({ error: 'Round tidak ditemukan' }, { status: 404 })
  if (round.judge_player_id !== player_id) return NextResponse.json({ error: 'Hanya jomblo yang bisa melanjutkan' }, { status: 403 })

  if (round.status === 'pitching_green') {
    const { data: players } = await supabase
      .from('players')
      .select('id, joined_at')
      .eq('room_id', round.room_id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nonJudgePlayers = getNonJudgePlayers((players ?? []) as any, round.judge_player_id)

    const { data: subs } = await supabase
      .from('round_submissions')
      .select('player_id, card_ids')
      .eq('round_id', id)

    const subMap = new Map((subs ?? []).map(s => [s.player_id, s.card_ids as string[]]))
    const allDone = nonJudgePlayers.every(p => (subMap.get(p.id)?.length ?? 0) >= 2)

    if (!allDone) {
      return NextResponse.json({ error: 'Belum semua pemain mengirim 2 kartu' }, { status: 400 })
    }

    await supabase.from('rounds').update({ status: 'sabotage' }).eq('id', id)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Tidak bisa melanjutkan dari fase ini' }, { status: 400 })
}
