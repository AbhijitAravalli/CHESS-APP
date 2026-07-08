import type { UseChessGame } from '../hooks/useChessGame'

interface Props {
  game: UseChessGame
  onFlip: () => void
}

export function GameControls({ game, onFlip }: Props) {
  const { drawOffer, isGameOver, canClaimFiftyMove, canClaimThreefold, turn } = game
  const turnName = turn === 'w' ? 'White' : 'Black'

  return (
    <div className="card">
      <h3>Controls</h3>
      <div className="controls">
        {drawOffer && !isGameOver ? (
          <>
            <button className="primary" onClick={game.acceptDraw}>
              Accept draw
            </button>
            <button onClick={game.declineDraw}>Decline</button>
          </>
        ) : (
          <>
            <button
              disabled={isGameOver}
              onClick={() => game.offerDraw(turn)}
              title={`${turnName} offers a draw`}
            >
              Offer draw ({turnName})
            </button>
            <button
              disabled={isGameOver || (!canClaimFiftyMove && !canClaimThreefold)}
              onClick={game.claimDraw}
              title="50-move or threefold repetition"
            >
              Claim draw
            </button>
          </>
        )}

        <button
          className="danger"
          disabled={isGameOver}
          onClick={() => game.resign('w')}
        >
          White resigns
        </button>
        <button
          className="danger"
          disabled={isGameOver}
          onClick={() => game.resign('b')}
        >
          Black resigns
        </button>

        <button onClick={onFlip} className="full">
          Flip board
        </button>
        <button onClick={game.reset} className="full primary">
          New game
        </button>
      </div>
    </div>
  )
}
