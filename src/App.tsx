import { useState } from 'react'
import { useChessGame } from './hooks/useChessGame'
import { Board } from './components/Board'
import { StatusBanner } from './components/StatusBanner'
import { MoveHistory } from './components/MoveHistory'
import { CapturedRow } from './components/CapturedPieces'
import { GameControls } from './components/GameControls'
import { GameOverModal } from './components/GameOverModal'
import './App.css'

export default function App() {
  const game = useChessGame()
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')

  const topCapturer = orientation === 'white' ? 'b' : 'w'
  const bottomCapturer = orientation === 'white' ? 'w' : 'b'

  return (
    <div className="app">
      <h1>♞ Claude Chess — pass & play</h1>

      <div className="board-wrap">
        <CapturedRow
          capturer={topCapturer}
          captured={game.captured[topCapturer]}
          opposingCaptured={game.captured[bottomCapturer]}
        />
        <div style={{ width: '100%', maxWidth: 560 }}>
          <Board game={game} orientation={orientation} />
        </div>
        <CapturedRow
          capturer={bottomCapturer}
          captured={game.captured[bottomCapturer]}
          opposingCaptured={game.captured[topCapturer]}
        />
      </div>

      <aside className="sidebar">
        <StatusBanner game={game} />
        <GameControls
          game={game}
          onFlip={() => setOrientation(o => (o === 'white' ? 'black' : 'white'))}
        />
        <MoveHistory game={game} />
      </aside>

      <GameOverModal game={game} />
    </div>
  )
}
