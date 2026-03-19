import { createSignal, onMount } from 'solid-js';
import ChessBoard from '../components/ChessBoard';
import MoveHistory from '../components/MoveHistory';
import Icon from '../components/Icon';
import { IconRefresh, IconFlag, IconArrowLeft } from '../utils/icons';
import { createGameState, cloneState, applyMove, COLORS } from '../utils/chessEngine';
import { useNavigate } from '@solidjs/router';
import { currentUser, apiRequest } from '../stores/authStore';
import { pvpGameState, setPvpGameState } from '../stores/gameStore';

const css = `
.game-page{padding:20px 24px;max-width:1100px;margin:0 auto}
.game-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px}
.game-title-area{display:flex;align-items:center;gap:10px}
.btn-back{width:36px;height:36px;background:var(--bg-secondary);border:2px solid var(--border-pixel);display:flex;align-items:center;justify-content:center;color:var(--text-secondary)}
.btn-back:hover{border-color:var(--pixel-green);color:var(--pixel-green)}
.game-title{font-family:var(--font-pixel);font-size:0.6rem;color:var(--pixel-cyan)}
.game-badge{padding:3px 8px;font-family:var(--font-pixel);font-size:0.35rem;border:2px solid var(--pixel-cyan);color:var(--pixel-cyan)}
.game-controls{display:flex;gap:6px}
.btn-ctrl{display:flex;align-items:center;gap:5px;padding:7px 12px;background:var(--bg-secondary);border:2px solid var(--border-pixel);color:var(--text-secondary);font-family:var(--font-body);font-size:1.05rem}
.btn-ctrl:hover{border-color:var(--pixel-green);color:var(--pixel-green)}
.btn-ctrl.danger:hover{border-color:var(--pixel-red);color:var(--pixel-red)}
.game-layout{display:flex;gap:16px;justify-content:center;align-items:flex-start}
.result-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:500;display:flex;align-items:center;justify-content:center;animation:fadeIn .3s}
.result-card{background:var(--bg-elevated);border:3px solid var(--pixel-green);padding:36px 44px;text-align:center;animation:scaleIn .3s}
.result-title{font-family:var(--font-pixel);font-size:0.8rem;color:var(--pixel-green);margin-bottom:8px}
.result-sub{font-family:var(--font-body);font-size:1.3rem;color:var(--text-secondary);margin-bottom:24px}
.result-actions{display:flex;gap:10px;justify-content:center}
.btn-res{padding:10px 20px;font-family:var(--font-pixel);font-size:0.45rem}
.btn-res.primary{background:var(--pixel-green);color:var(--bg-deep);border:2px solid #1a5e08}
.btn-res.secondary{background:var(--bg-tertiary);border:2px solid var(--border-pixel);color:var(--text-secondary)}
@media(max-width:900px){.game-layout{flex-direction:column;align-items:center}}
`;

export default function PvPPage() {
  // Restore or create new game
  const [gs, setGs] = createSignal(pvpGameState() || createGameState());
  const [sr, setSr] = createSignal(false);
  const nav = useNavigate();

  // Persist state on every change
  function updateGs(newState) {
    setGs(newState);
    setPvpGameState(newState);
  }

  function onMove(m) {
    const s = cloneState(gs()); applyMove(s, m); updateGs(s);
    if (s.gameOver) { setTimeout(() => setSr(true), 500); save(s); }
  }
  function reset() { const s = createGameState(); updateGs(s); setSr(false); }
  function resign() {
    const s = cloneState(gs()); s.gameOver = true;
    s.winner = s.turn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    updateGs(s); setTimeout(() => setSr(true), 200); save(s);
  }
  async function save(s) {
    if (!currentUser()) return;
    try { await apiRequest('/games', { method: 'POST', body: JSON.stringify({ game: { mode: 'pvp', winner: s.winner, result: s.winner ? 'win' : 'draw', moves: s.moveHistory.map(m => m.notation).join(' '), total_moves: s.moveHistory.length } }) }); } catch {}
  }

  return (
    <><style>{css}</style><div class="game-page">
      <div class="game-top">
        <div class="game-title-area"><button class="btn-back" onClick={() => nav('/')}><Icon svg={IconArrowLeft} size="16px" /></button><h2 class="game-title">PVP BATTLE</h2><span class="game-badge">LOCAL</span></div>
        <div class="game-controls"><button class="btn-ctrl" onClick={reset}><Icon svg={IconRefresh} size="12px" />New</button><button class="btn-ctrl danger" onClick={resign} disabled={gs().gameOver}><Icon svg={IconFlag} size="12px" />Resign</button></div>
      </div>
      <div class="game-layout"><ChessBoard gameState={gs} onMove={onMove} /><MoveHistory gameState={gs} /></div>
      {sr() && (<div class="result-overlay" onClick={() => setSr(false)}><div class="result-card" onClick={e => e.stopPropagation()}>
        <div class="result-title">{gs().isDraw ? 'DRAW' : gs().winner === COLORS.WHITE ? 'WHITE WINS!' : 'BLACK WINS!'}</div>
        <div class="result-sub">{gs().isCheckmate ? 'Checkmate!' : gs().isStalemate ? 'Stalemate' : 'Resigned'}</div>
        <div class="result-actions"><button class="btn-res primary" onClick={reset}>PLAY AGAIN</button><button class="btn-res secondary" onClick={() => nav('/')}>HOME</button></div>
      </div></div>)}
    </div></>
  );
}
