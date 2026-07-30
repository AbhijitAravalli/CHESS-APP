import { Chess } from 'chess.js'
import type { Move } from 'chess.js'
import type { Difficulty } from '../types'

/**
 * A small, dependency-free chess engine: negamax search with alpha-beta
 * pruning and a material + piece-square-table evaluation. Strong enough to
 * be a fun opponent for casual players, fast enough to run on the main
 * thread for the shallow depths we use (1–3 plies).
 */

const PIECE_VALUE: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0, // kings are never "captured"; king safety is left to the PST
}

// Piece-square tables, written from White's point of view with the first
// entry = a8 (top-left of the board as White sees it) and the last = h1.
// This matches the layout chess.js's board() returns (row 0 = rank 8).
// For Black we mirror vertically. Values from Michniewski's "Simplified
// Evaluation Function".
const PST: Record<string, number[]> = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    5, 10, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20, 0, 0, 0, 0, -20, -40,
    -30, 0, 10, 15, 15, 10, 0, -30,
    -30, 5, 15, 20, 20, 15, 5, -30,
    -30, 0, 15, 20, 20, 15, 0, -30,
    -30, 5, 10, 15, 15, 10, 5, -30,
    -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  r: [
    0, 0, 0, 0, 0, 0, 0, 0,
    5, 10, 10, 10, 10, 10, 10, 5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    0, 0, 0, 5, 5, 0, 0, 0,
  ],
  q: [
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5,
    0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20,
  ],
  k: [
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    20, 20, 0, 0, 0, 0, 20, 20,
    20, 30, 10, 0, 0, 10, 30, 20,
  ],
}

const MATE = 1_000_000

/** Static evaluation from White's perspective (positive favours White). */
function evaluate(chess: Chess): number {
  const board = chess.board()
  let score = 0
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f]
      if (!piece) continue
      const base = PIECE_VALUE[piece.type]
      // White reads the table directly; Black mirrors vertically.
      const idx = piece.color === 'w' ? r * 8 + f : (7 - r) * 8 + f
      const positional = PST[piece.type][idx]
      const value = base + positional
      score += piece.color === 'w' ? value : -value
    }
  }
  return score
}

/** Captures before quiet moves — cheap move ordering that sharpens pruning. */
function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    const av = a.captured ? PIECE_VALUE[a.captured] : 0
    const bv = b.captured ? PIECE_VALUE[b.captured] : 0
    return bv - av
  })
}

function negamax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  color: number,
  ply: number,
): number {
  if (chess.isCheckmate()) {
    // Side to move is mated. Prefer faster mates (larger when shallower).
    return -(MATE - ply)
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return 0
  }
  if (depth === 0) {
    return color * evaluate(chess)
  }

  let best = -Infinity
  for (const move of orderMoves(chess.moves({ verbose: true }))) {
    chess.move(move)
    const score = -negamax(chess, depth - 1, -beta, -alpha, -color, ply + 1)
    chess.undo()
    if (score > best) best = score
    if (best > alpha) alpha = best
    if (alpha >= beta) break // beta cut-off
  }
  return best
}

function depthFor(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 1
    case 'medium':
      return 2
    case 'hard':
      return 3
  }
}

/**
 * Choose a move for the side to move in the given position.
 * Returns null only if there are no legal moves (game already over).
 */
export function findBestMove(fen: string, difficulty: Difficulty): Move | null {
  const chess = new Chess(fen)
  const moves = chess.moves({ verbose: true })
  if (moves.length === 0) return null

  // Easy occasionally blunders on purpose so beginners have a chance.
  if (difficulty === 'easy' && Math.random() < 0.35) {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  const depth = depthFor(difficulty)
  const color = chess.turn() === 'w' ? 1 : -1

  let alpha = -Infinity
  const beta = Infinity
  // Collect all moves scoring within a small margin of the best, then pick
  // one at random so the engine doesn't play identically every game.
  const scored: { move: Move; score: number }[] = []
  for (const move of orderMoves(moves)) {
    chess.move(move)
    const score = -negamax(chess, depth - 1, -beta, -alpha, -color, 1)
    chess.undo()
    scored.push({ move, score })
    if (score > alpha) alpha = score
  }

  const bestScore = Math.max(...scored.map(s => s.score))
  const topMoves = scored.filter(s => s.score >= bestScore - 10).map(s => s.move)
  return topMoves[Math.floor(Math.random() * topMoves.length)]
}
