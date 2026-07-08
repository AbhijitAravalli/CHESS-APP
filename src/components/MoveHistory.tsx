import { useEffect, useRef } from 'react'
import type { UseChessGame } from '../hooks/useChessGame'

export function MoveHistory({ game }: { game: UseChessGame }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [game.history.length])

  const rows: { num: number; white: string; black: string }[] = []
  for (let i = 0; i < game.history.length; i += 2) {
    rows.push({
      num: i / 2 + 1,
      white: game.history[i].san,
      black: game.history[i + 1]?.san ?? '',
    })
  }

  return (
    <div className="card">
      <h3>Move history</h3>
      <div className="moves" ref={scrollRef}>
        {rows.length === 0 && <div style={{ color: 'var(--text-dim)' }}>No moves yet.</div>}
        {rows.map(r => (
          <div key={r.num} className="row">
            <span className="num">{r.num}.</span>
            <span>{r.white}</span>
            <span>{r.black}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
