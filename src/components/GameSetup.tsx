import type { GameConfig, GameMode, Color, Difficulty } from '../types'

interface Props {
  config: GameConfig
  /** Apply a new configuration and start a fresh game. */
  onChange: (config: GameConfig) => void
}

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export function GameSetup({ config, onChange }: Props) {
  const setMode = (mode: GameMode) => onChange({ ...config, mode })
  const setColor = (humanColor: Color) => onChange({ ...config, humanColor })
  const setDifficulty = (difficulty: Difficulty) => onChange({ ...config, difficulty })

  return (
    <div className="card setup">
      <h3>Mode</h3>

      <div className="segmented">
        <button
          className={config.mode === 'pvp' ? 'active' : ''}
          onClick={() => setMode('pvp')}
        >
          Pass &amp; Play
        </button>
        <button
          className={config.mode === 'pvc' ? 'active' : ''}
          onClick={() => setMode('pvc')}
        >
          vs Computer
        </button>
      </div>

      {config.mode === 'pvc' && (
        <>
          <div className="setup-label">Play as</div>
          <div className="segmented">
            <button
              className={config.humanColor === 'w' ? 'active' : ''}
              onClick={() => setColor('w')}
            >
              ♔ White
            </button>
            <button
              className={config.humanColor === 'b' ? 'active' : ''}
              onClick={() => setColor('b')}
            >
              ♚ Black
            </button>
          </div>

          <div className="setup-label">Difficulty</div>
          <div className="segmented">
            {DIFFICULTIES.map(d => (
              <button
                key={d.value}
                className={config.difficulty === d.value ? 'active' : ''}
                onClick={() => setDifficulty(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </>
      )}

      <p className="setup-hint">Changing any option starts a new game.</p>
    </div>
  )
}
