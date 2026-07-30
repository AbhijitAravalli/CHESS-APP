import { useState } from 'react'
import { useChessGame } from './hooks/useChessGame'
import { Board } from './components/Board'
import { StatusBanner } from './components/StatusBanner'
import { MoveHistory } from './components/MoveHistory'
import { CapturedRow } from './components/CapturedPieces'
import { GameControls } from './components/GameControls'
import { GameSetup } from './components/GameSetup'
import { GameOverModal } from './components/GameOverModal'
import type { GameConfig } from './types'
import './App.css'

const INITIAL_CONFIG: GameConfig = { mode: 'pvp', humanColor: 'w', difficulty: 'medium' }

export default function App() {
  const [config, setConfig] = useState<GameConfig>(INITIAL_CONFIG)
  const game = useChessGame(config)
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')

  const applyConfig = (next: GameConfig) => {
    setConfig(next)
    // Orient the board so the human's pieces sit at the bottom.
    if (next.mode === 'pvc') setOrientation(next.humanColor === 'w' ? 'white' : 'black')
    game.reset()
  }

  const topCapturer = orientation === 'white' ? 'b' : 'w'
  const bottomCapturer = orientation === 'white' ? 'w' : 'b'

  return (
    <div className="app">
      <h1>♞ Claude Chess</h1>

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
        <GameSetup config={config} onChange={applyConfig} />
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
