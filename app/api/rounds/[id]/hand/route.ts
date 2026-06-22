import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const playerId = searchParams.get('player_id')

  if (!playerId) {
    return NextResponse.json({ error: 'player_id diperlukan' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: hand } = await supabase
    .from('player_hands')
    .select('card_ids')
    .eq('round_id', id)
    .eq('player_id', playerId)
    .single()

  if (!hand || hand.card_ids.length === 0) {
    return NextResponse.json({ green_cards: [], red_cards: [], all_cards: [] })
  }

  // Fetch all card details
  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .in('id', hand.card_ids)

  if (!cards) return NextResponse.json({ green_cards: [], red_cards: [], all_cards: [] })

  // Preserve order: first 4 are green, last 3 are red (as dealt)
  const orderedCards = hand.card_ids.map((cid: string) => cards.find(c => c.id === cid)).filter(Boolean)
  const green_cards = orderedCards.filter((c: { type: string }) => c.type === 'green')
  const red_cards = orderedCards.filter((c: { type: string }) => c.type === 'red')

  return NextResponse.json({ green_cards, red_cards, all_cards: orderedCards })
}
