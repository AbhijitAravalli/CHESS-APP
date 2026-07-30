import type { UseChessGame } from '../hooks/useChessGame'

const REASON: Record<string, string> = {
  CHECKMATE: 'Checkmate',
  STALEMATE: 'Stalemate',
  DRAW_FIFTY_MOVE: 'Fifty-move rule',
  DRAW_THREEFOLD: 'Threefold repetition',
  DRAW_INSUFFICIENT_MATERIAL: 'Insufficient material',
  DRAW_AGREEMENT: 'Agreed draw',
  RESIGNED: 'Resignation',
}

export function GameOverModal({ game }: { game: UseChessGame }) {
  if (!game.isGameOver) return null
  const vsComputer = game.computerColor !== null
  let headline: string
  if (game.winner === 'draw') {
    headline = 'Draw'
  } else if (vsComputer) {
    headline = game.winner === game.computerColor ? 'Computer wins' : 'You win! 🎉'
  } else {
    headline = game.winner === 'w' ? 'White wins' : 'Black wins'
  }
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>{headline}</h2>
        <p>By {REASON[game.status]}</p>
        <div className="actions">
          <button className="primary" onClick={game.reset}>
            New game
          </button>
        </div>
      </div>
    </div>
  )
}
