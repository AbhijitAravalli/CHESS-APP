import type { PieceSymbol, Color } from '../types'

const GLYPH: Record<Color, Record<PieceSymbol, string>> = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
}
const VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
const ORDER: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p']

interface Props {
  capturer: Color
  captured: PieceSymbol[]
  opposingCaptured: PieceSymbol[]
}

export function CapturedRow({ capturer, captured, opposingCaptured }: Props) {
  const takenColor: Color = capturer === 'w' ? 'b' : 'w'
  const sorted = [...captured].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))
  const myPts = captured.reduce((s, p) => s + VALUE[p], 0)
  const oppPts = opposingCaptured.reduce((s, p) => s + VALUE[p], 0)
  const diff = myPts - oppPts
  return (
    <div className="captured-row">
      {sorted.map((p, i) => (
        <span key={i}>{GLYPH[takenColor][p]}</span>
      ))}
      {diff > 0 && <span className="material">+{diff}</span>}
    </div>
  )
}
