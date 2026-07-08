import { useCallback, useMemo, useState } from 'react'
import { Chess, Square } from 'chess.js'
import type { GameStatus, HistoryMove, Winner, Color, PieceSymbol } from '../types'

export interface DrawOffer { from: Color }

export interface UseChessGame {
  fen: string
  turn: Color
  history: HistoryMove[]
  legalTargets: (square: Square) => Square[]
  tryMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean
  isPromotionMove: (from: Square, to: Square) => boolean
  status: GameStatus
  winner: Winner
  isGameOver: boolean
  inCheck: boolean
  checkedKingSquare: Square | null
  lastMove: { from: Square; to: Square } | null
  captured: { w: PieceSymbol[]; b: PieceSymbol[] }
  canClaimFiftyMove: boolean
  canClaimThreefold: boolean
  drawOffer: DrawOffer | null
  offerDraw: (from: Color) => void
  acceptDraw: () => void
  declineDraw: () => void
  claimDraw: () => void
  resign: (color: Color) => void
  reset: () => void
  pgn: string
}

function findKingSquare(chess: Chess, color: Color): Square | null {
  const board = chess.board()
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f]
      if (sq && sq.type === 'k' && sq.color === color) return sq.square as Square
    }
  }
  return null
}

export function useChessGame(): UseChessGame {
  const [chess] = useState(() => new Chess())
  const [fen, setFen] = useState(chess.fen())
  const [drawOffer, setDrawOffer] = useState<DrawOffer | null>(null)
  const [manualEnd, setManualEnd] = useState<{ status: GameStatus; winner: Winner } | null>(null)
  const [, forceTick] = useState(0)

  const sync = useCallback(() => {
    setFen(chess.fen())
    forceTick(t => t + 1)
  }, [chess])

  const turn: Color = chess.turn()

  const history: HistoryMove[] = useMemo(() => {
    return chess.history({ verbose: true }).map(m => ({
      san: m.san,
      from: m.from as Square,
      to: m.to as Square,
      color: m.color as Color,
      piece: m.piece as PieceSymbol,
      captured: m.captured as PieceSymbol | undefined,
      promotion: m.promotion as PieceSymbol | undefined,
    }))
    // fen changes each move -> recompute
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen])

  const captured = useMemo(() => {
    const acc: { w: PieceSymbol[]; b: PieceSymbol[] } = { w: [], b: [] }
    for (const m of history) {
      if (m.captured) {
        // capturing color m.color takes a piece of the opposite color -> stash under capturer
        acc[m.color].push(m.captured)
      }
    }
    return acc
  }, [history])

  const lastMove = useMemo(() => {
    if (history.length === 0) return null
    const m = history[history.length - 1]
    return { from: m.from, to: m.to }
  }, [history])

  const inCheck = chess.isCheck()
  const checkedKingSquare = inCheck ? findKingSquare(chess, turn) : null

  const status: GameStatus = useMemo(() => {
    if (manualEnd) return manualEnd.status
    if (chess.isCheckmate()) return 'CHECKMATE'
    if (chess.isStalemate()) return 'STALEMATE'
    if (chess.isInsufficientMaterial()) return 'DRAW_INSUFFICIENT_MATERIAL'
    if (chess.isThreefoldRepetition()) return 'DRAW_THREEFOLD'
    // fifty-move auto-draw once 75 full moves elapsed; before that it's *claimable*
    const halfmove = parseInt(chess.fen().split(' ')[4] ?? '0', 10)
    if (halfmove >= 150) return 'DRAW_FIFTY_MOVE'
    if (chess.isCheck()) return 'CHECK'
    return 'IN_PROGRESS'
  }, [chess, fen, manualEnd])

  const winner: Winner = useMemo(() => {
    if (manualEnd) return manualEnd.winner
    if (status === 'CHECKMATE') {
      // side to move is checkmated -> opponent wins
      return turn === 'w' ? 'b' : 'w'
    }
    if (
      status === 'STALEMATE' ||
      status === 'DRAW_INSUFFICIENT_MATERIAL' ||
      status === 'DRAW_THREEFOLD' ||
      status === 'DRAW_FIFTY_MOVE'
    ) {
      return 'draw'
    }
    return null
  }, [status, turn, manualEnd])

  const isGameOver =
    status === 'CHECKMATE' ||
    status === 'STALEMATE' ||
    status === 'DRAW_INSUFFICIENT_MATERIAL' ||
    status === 'DRAW_THREEFOLD' ||
    status === 'DRAW_FIFTY_MOVE' ||
    status === 'DRAW_AGREEMENT' ||
    status === 'RESIGNED'

  const halfmove = parseInt(fen.split(' ')[4] ?? '0', 10)
  const canClaimFiftyMove = halfmove >= 100 && !isGameOver
  const canClaimThreefold = chess.isThreefoldRepetition() && !isGameOver

  const legalTargets = useCallback(
    (square: Square): Square[] => {
      if (isGameOver) return []
      const moves = chess.moves({ square, verbose: true })
      return moves.map(m => m.to as Square)
    },
    [chess, isGameOver, fen],
  )

  const isPromotionMove = useCallback(
    (from: Square, to: Square): boolean => {
      if (isGameOver) return false
      const moves = chess.moves({ square: from, verbose: true })
      return moves.some(m => m.to === to && m.promotion)
    },
    [chess, isGameOver, fen],
  )

  const tryMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
      if (isGameOver) return false
      try {
        const result = chess.move({ from, to, promotion })
        if (!result) return false
      } catch {
        return false
      }
      setDrawOffer(null) // any move rescinds an outstanding offer
      sync()
      return true
    },
    [chess, isGameOver, sync],
  )

  const offerDraw = useCallback(
    (from: Color) => {
      if (isGameOver) return
      setDrawOffer({ from })
    },
    [isGameOver],
  )

  const acceptDraw = useCallback(() => {
    if (!drawOffer || isGameOver) return
    setManualEnd({ status: 'DRAW_AGREEMENT', winner: 'draw' })
    setDrawOffer(null)
  }, [drawOffer, isGameOver])

  const declineDraw = useCallback(() => setDrawOffer(null), [])

  const claimDraw = useCallback(() => {
    if (isGameOver) return
    if (canClaimThreefold) setManualEnd({ status: 'DRAW_THREEFOLD', winner: 'draw' })
    else if (canClaimFiftyMove) setManualEnd({ status: 'DRAW_FIFTY_MOVE', winner: 'draw' })
  }, [canClaimThreefold, canClaimFiftyMove, isGameOver])

  const resign = useCallback(
    (color: Color) => {
      if (isGameOver) return
      setManualEnd({ status: 'RESIGNED', winner: color === 'w' ? 'b' : 'w' })
      setDrawOffer(null)
    },
    [isGameOver],
  )

  const reset = useCallback(() => {
    chess.reset()
    setDrawOffer(null)
    setManualEnd(null)
    sync()
  }, [chess, sync])

  return {
    fen,
    turn,
    history,
    legalTargets,
    tryMove,
    isPromotionMove,
    status,
    winner,
    isGameOver,
    inCheck,
    checkedKingSquare,
    lastMove,
    captured,
    canClaimFiftyMove,
    canClaimThreefold,
    drawOffer,
    offerDraw,
    acceptDraw,
    declineDraw,
    claimDraw,
    resign,
    reset,
    pgn: chess.pgn(),
  }
}
