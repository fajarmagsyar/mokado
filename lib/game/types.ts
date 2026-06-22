export type RoomStatus = 'waiting' | 'playing' | 'finished'
export type RoundStatus = 'pitching_green' | 'sabotage' | 'judging' | 'finished'
export type CardType = 'red' | 'green'
export type CardCategory = 'kebiasaan' | 'kepribadian' | 'gaya_hidup'

export interface Profile {
  id: string
  username: string
  created_at: string
}

export interface Room {
  id: string
  code: string
  host_id: string
  status: RoomStatus
  max_players: number
  rounds_total: number
  current_round: number
  created_at: string
}

export interface Player {
  id: string
  room_id: string
  user_id: string | null
  name: string
  score: number
  is_host: boolean
  is_ready: boolean
  joined_at: string
}

export interface Card {
  id: string
  text: string
  type: CardType
  category: CardCategory
}

export interface Round {
  id: string
  room_id: string
  round_number: number
  judge_player_id: string
  status: RoundStatus
  winner_player_id: string | null
  created_at: string
}

export interface PlayerHand {
  id: string
  round_id: string
  player_id: string
  card_ids: string[]
  green_cards: Card[]
  red_cards: Card[]
}

export interface RoundSubmission {
  id: string
  round_id: string
  player_id: string
  card_ids: string[]     // up to 2 green cards submitted one at a time
  cards?: Card[]         // card objects for judge live view
  submitted_at: string
}

export interface RoundSabotage {
  id: string
  round_id: string
  giver_player_id: string
  receiver_player_id: string
  card_id: string
  card?: Card            // populated for live judge view
  created_at: string
}

export interface FinalPitch {
  player_id: string
  green_cards: Card[]   // 1-2 green cards chosen by player
  red_card: Card | null // 1 red card received via sabotage
}

export interface GameState {
  room: Room
  players: Player[]
  currentRound: Round | null
  myPlayer: Player | null
  myGreenCards: Card[]
  myRedCards: Card[]
  greenSubmissions: RoundSubmission[]    // includes cards[] during pitching_green and sabotage
  sabotageSubmissions: RoundSabotage[]   // includes card{} during sabotage
  greenSubmittedPlayerIds: string[]      // players who completed green turn (2 cards)
  sabotageSubmittedPlayerIds: string[]
  isJudge: boolean
  pitchOrder: string[]                   // non-judge player IDs in joined_at order
  currentPitcherId: string | null        // whose green turn it is (has < 2 cards)
  allGreenDone: boolean                  // all players sent 2 green cards → judge can advance
  currentSabotageTargetId: string | null // whose green combo is in spotlight during sabotage
  currentSabotagerId: string | null      // who is sending the red card now
}
