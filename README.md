# Claude Chess — Pass & Play

Two-player, same-device chess. Implements **Variant A** of the chess-app
coding prompt: no backend, no networking, both players share one screen.

Built with:

- **React 18 + Vite + TypeScript**
- **[chess.js](https://github.com/jhlywa/chess.js)** — rules, FEN, SAN,
  legal-move generation, all game-end detection (checkmate, stalemate,
  threefold repetition, insufficient material, fifty-move rule).
- **[react-chessboard](https://github.com/Clariity/react-chessboard)** —
  board rendering, drag-and-drop, square styling.

Correctness comes from `chess.js`. This project supplies the UI, turn
display, captured-piece trays, move history in SAN, promotion picker,
draw/resign flows, and a game-over modal.

---

## Run it

```powershell
cd "C:\Users\307765\OneDrive - Cognizant\Desktop\Bluebolt\chess-app\Claude-Chess-App"
npm install
npm run dev
```

Dev server opens on **http://localhost:5174** (Vite auto-launches the
browser). No backend needed.

---

## Feature checklist (against the prompt)

- [x] Piece movement — all pieces, all patterns (chess.js).
- [x] Castling — both sides, all five legality checks (chess.js).
- [x] En passant — including single-ply target expiry (chess.js).
- [x] **Promotion with underpromotion** — a browser prompt asks the mover
      to pick Q / R / B / N; defaults to Queen on Enter.
- [x] Absolute pins / double check / discovered check — chess.js legal-move
      set already excludes moves that leave the mover's king in check.
- [x] Checkmate → winner declared.
- [x] Stalemate → draw (distinct from checkmate).
- [x] Fifty-move rule — auto-draw at 75 full moves (150 plies); *claimable*
      by either side once 50 full moves (100 plies) have passed with no
      capture or pawn move. Button lights up when eligible.
- [x] Threefold repetition — same-position detection via chess.js; *claimable*
      via the same button.
- [x] Insufficient material — auto-draw (K vs K, K+B vs K, K+N vs K,
      K+B vs K+B same colour).
- [x] Resign — one button per side.
- [x] Offer draw / accept / decline — buttons swap in when an offer is
      outstanding; any move implicitly rescinds an offer.
- [x] Move history in SAN.
- [x] Captured-pieces tray per side with material-advantage indicator.
- [x] Whose-turn indicator + check banner.
- [x] Game-over modal with the reason.
- [x] Flip board for pass-and-play convenience.
- [x] Board state derived entirely from a single `chess.js` instance
      (source of truth) — no independent client mirroring.

Not part of Variant A and therefore intentionally out of scope: Spring
Boot backend, WebSocket / STOMP, game session lobby, share links, server
authoritative validation, perft test suite, PGN import/export UI.

---

## File map

```
src/
├── main.tsx                       Vite entry
├── App.tsx                        composition root
├── App.css                        layout
├── index.css                      theme tokens + resets
├── types.ts                       shared TS types
├── hooks/
│   └── useChessGame.ts            chess.js wrapper: state + actions
└── components/
    ├── Board.tsx                  react-chessboard + click-select flow
    ├── StatusBanner.tsx           turn / check / draw-offer / result
    ├── MoveHistory.tsx            SAN table
    ├── CapturedPieces.tsx         glyph row + material diff
    ├── GameControls.tsx           resign / draw / claim / flip / new
    └── GameOverModal.tsx          end-of-game overlay
```

---

## Architecture note (per prompt §3)

**Library route.** Move generation, position validity, and every draw
condition are delegated to `chess.js`. The `useChessGame` hook holds a
single `Chess` instance and exposes derived state + typed actions. The
UI only *displays* what the engine says — it never independently mutates
board state.

For a Variant B (networked) build, this same hook could be replaced by
one that subscribes to STOMP `/topic/games/{id}` and calls
`chess.load(fen)` on every server update, keeping the component tree
unchanged.
