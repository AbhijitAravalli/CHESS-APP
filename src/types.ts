import type { Square } from 'chess.js'

export type Color = 'w' | 'b'
export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'

export type GameStatus =
  | 'IN_PROGRESS'
  | 'CHECK'
  | 'CHECKMATE'
  | 'STALEMATE'
  | 'DRAW_FIFTY_MOVE'
  | 'DRAW_THREEFOLD'
  | 'DRAW_INSUFFICIENT_MATERIAL'
  | 'DRAW_AGREEMENT'
  | 'RESIGNED'

export type Winner = Color | 'draw' | null

export type GameMode = 'pvp' | 'pvc'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface GameConfig {
  mode: GameMode
  /** In 'pvc' mode, the color the human plays. Ignored in 'pvp'. */
  humanColor: Color
  difficulty: Difficulty
}

export interface HistoryMove {
  san: string
  from: Square
  to: Square
  color: Color
  piece: PieceSymbol
  captured?: PieceSymbol
  promotion?: PieceSymbol
}
