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
  green_cards: Card[]  // 4 green cards
  red_cards: Card[]    // 3 red cards
}

export interface RoundSubmission {
  id: string
  round_id: string
  player_id: string
  card_ids: string[]   // 2 chosen green cards
  submitted_at: string
}

export interface RoundSabotage {
  id: string
  round_id: string
  giver_player_id: string
  receiver_player_id: string
  card_id: string
  created_at: string
}

// What the judge sees for each player
export interface FinalPitch {
  player_id: string
  green_cards: Card[]  // 2 green chosen by player
  red_card: Card       // 1 red received from previous player
}

export interface GameState {
  room: Room
  players: Player[]
  currentRound: Round | null
  myPlayer: Player | null
  myGreenCards: Card[]
  myRedCards: Card[]
  greenSubmissions: RoundSubmission[]     // green picks submitted so far
  sabotageSubmissions: RoundSabotage[]    // sabotage picks submitted so far
  greenSubmittedPlayerIds: string[]
  sabotageSubmittedPlayerIds: string[]
  isJudge: boolean
}
