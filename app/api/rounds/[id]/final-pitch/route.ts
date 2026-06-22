import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { FinalPitch } from '@/lib/game/types'

// Returns each non-judge player's final pitch: 2 green (chosen) + 1 red (received via sabotage)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: round } = await supabase
    .from('rounds')
    .select('judge_player_id')
    .eq('id', id)
    .single()

  if (!round) return NextResponse.json({ error: 'Round tidak ditemukan' }, { status: 404 })

  // Get all green picks
  const { data: submissions } = await supabase
    .from('round_submissions')
    .select('player_id, card_ids')
    .eq('round_id', id)

  // Get all sabotage picks
  const { data: sabotages } = await supabase
    .from('round_sabotage')
    .select('receiver_player_id, card_id')
    .eq('round_id', id)

  if (!submissions || !sabotages) {
    return NextResponse.json({ pitches: [] })
  }

  // Collect all card IDs to fetch
  const allCardIds = [
    ...submissions.flatMap(s => s.card_ids),
    ...sabotages.map(s => s.card_id),
  ]
  const uniqueCardIds = [...new Set(allCardIds)]

  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .in('id', uniqueCardIds)

  const cardMap = new Map(cards?.map(c => [c.id, c]) ?? [])

  // Build final pitches
  const pitches: FinalPitch[] = submissions.map(sub => {
    const sabotagedBy = sabotages.find(s => s.receiver_player_id === sub.player_id)
    return {
      player_id: sub.player_id,
      green_cards: sub.card_ids.map((cid: string) => cardMap.get(cid)).filter(Boolean),
      red_card: sabotagedBy ? cardMap.get(sabotagedBy.card_id) ?? null : null,
    }
  })

  // Shuffle so judge can't guess by submission order
  pitches.sort(() => Math.random() - 0.5)

  return NextResponse.json({ pitches })
}
