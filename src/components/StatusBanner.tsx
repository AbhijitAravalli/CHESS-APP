import type { UseChessGame } from '../hooks/useChessGame'

const STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: '',
  CHECK: 'Check!',
  CHECKMATE: 'Checkmate',
  STALEMATE: 'Stalemate — draw',
  DRAW_FIFTY_MOVE: 'Draw — fifty-move rule',
  DRAW_THREEFOLD: 'Draw — threefold repetition',
  DRAW_INSUFFICIENT_MATERIAL: 'Draw — insufficient material',
  DRAW_AGREEMENT: 'Draw — by agreement',
  RESIGNED: 'Resigned',
}

export function StatusBanner({ game }: { game: UseChessGame }) {
  const turnName = game.turn === 'w' ? 'White' : 'Black'
  const vsComputer = game.computerColor !== null
  const turnLabel = vsComputer
    ? game.turn === game.computerColor
      ? 'Computer to move'
      : 'Your move'
    : `${turnName} to move`
  return (
    <div className="card status">
      {!game.isGameOver && (
        <>
          <div className="turn">{turnLabel}</div>
          {game.thinking && <div className="thinking">Computer is thinking…</div>}
          {game.status === 'CHECK' && <div className="check">Check!</div>}
        </>
      )}
      {game.isGameOver && (
        <div className="banner">
          {STATUS_LABEL[game.status]}
          {game.winner === 'w' && ' — White wins'}
          {game.winner === 'b' && ' — Black wins'}
        </div>
      )}
      {game.drawOffer && !game.isGameOver && (
        <div className="banner">
          {game.drawOffer.from === 'w' ? 'White' : 'Black'} offered a draw
        </div>
      )}
    </div>
  )
}
