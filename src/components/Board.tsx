import { useMemo, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import type { Square } from 'chess.js'
import type { PieceSymbol } from '../types'
import type { UseChessGame } from '../hooks/useChessGame'

interface Props {
  game: UseChessGame
  orientation: 'white' | 'black'
}

export function Board({ game, orientation }: Props) {
  const [selected, setSelected] = useState<Square | null>(null)

  const legalDests = useMemo<Square[]>(
    () => (selected ? game.legalTargets(selected) : []),
    [selected, game],
  )

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {}
    if (game.lastMove) {
      styles[game.lastMove.from] = { background: 'var(--last-move)' }
      styles[game.lastMove.to] = { background: 'var(--last-move)' }
    }
    if (game.checkedKingSquare) {
      styles[game.checkedKingSquare] = {
        background: 'radial-gradient(circle, var(--check) 40%, transparent 70%)',
      }
    }
    if (selected) {
      styles[selected] = { ...(styles[selected] || {}), boxShadow: 'inset 0 0 0 3px var(--accent)' }
    }
    for (const sq of legalDests) {
      styles[sq] = {
        ...(styles[sq] || {}),
        background: 'radial-gradient(circle, var(--hint) 25%, transparent 27%)',
      }
    }
    return styles
  }, [game.lastMove, game.checkedKingSquare, selected, legalDests])

  const attemptMove = (from: Square, to: Square): boolean => {
    if (game.isPromotionMove(from, to)) {
      const choice = window.prompt('Promote to (q=Queen, r=Rook, b=Bishop, n=Knight):', 'q')
      const p = (choice ?? 'q').trim().toLowerCase() as PieceSymbol
      const valid: PieceSymbol[] = ['q', 'r', 'b', 'n']
      const promotion = valid.includes(p) ? p : 'q'
      const ok = game.tryMove(from, to, promotion)
      setSelected(null)
      return ok
    }
    const ok = game.tryMove(from, to)
    setSelected(null)
    return ok
  }

  const onSquareClick = (square: Square) => {
    if (game.isGameOver) return
    if (selected && selected !== square) {
      const moved = attemptMove(selected, square)
      if (moved) return
      // fall through: treat click as reselection
    }
    setSelected(square)
  }

  const onPieceDrop = (from: Square, to: Square): boolean => attemptMove(from, to)

  return (
    <Chessboard
      position={game.fen}
      boardOrientation={orientation}
      onSquareClick={onSquareClick}
      onPieceDrop={onPieceDrop}
      customSquareStyles={squareStyles}
      customDarkSquareStyle={{ backgroundColor: '#6b7d4a' }}
      customLightSquareStyle={{ backgroundColor: '#efe5c1' }}
      arePremovesAllowed={false}
      animationDuration={200}
    />
  )
}
