import { createSignal, Show } from 'solid-js';
import ChessBoard from '../components/ChessBoard';
import MoveHistory from '../components/MoveHistory';
import Icon from '../components/Icon';
import { IconRefresh, IconFlag, IconArrowLeft } from '../utils/icons';
import { createGameState, cloneState, applyMove, getAIMove, COLORS } from '../utils/chessEngine';
import { useNavigate } from '@solidjs/router';
import { currentUser, apiRequest } from '../stores/authStore';
import { aiGameState, setAiGameState, aiSettings, setAiSettings } from '../stores/gameStore';

const css = `
.diff-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:500;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s}
.diff-card{background:var(--bg-elevated);border:3px solid var(--pixel-purple);padding:28px 32px;text-align:center;animation:scaleIn .3s;max-width:420px;width:90%}
.diff-title{font-family:var(--font-pixel);font-size:0.6rem;color:var(--pixel-purple);margin-bottom:6px}
.diff-sub{font-family:var(--font-body);font-size:1.2rem;color:var(--text-secondary);margin-bottom:16px}
.color-sel{display:flex;gap:8px;justify-content:center;margin-bottom:16px}
.color-btn{width:48px;height:48px;border:2px solid var(--border-pixel);cursor:pointer;font-family:var(--font-pixel);font-size:0.35rem;display:flex;align-items:center;justify-content:center}
.color-btn.w{background:#e0d0b0;color:#1a1625}.color-btn.b{background:#1a1625;color:#e0d0b0}
.color-btn.sel{border-color:var(--pixel-green);box-shadow:0 0 10px rgba(57,255,20,0.3)}
.diff-opts{display:flex;flex-direction:column;gap:8px}
.diff-btn{display:flex;align-items:center;gap:12px;padding:12px 14px;border:2px solid var(--border-subtle);background:var(--bg-tertiary);cursor:pointer;width:100%;text-align:left}
.diff-btn:hover{border-color:var(--pixel-green);background:var(--bg-elevated)}
.diff-star{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:2px solid;font-family:var(--font-pixel);font-size:0.45rem}
.diff-btn.easy .diff-star{border-color:var(--pixel-green);color:var(--pixel-green)}.diff-btn.medium .diff-star{border-color:var(--pixel-yellow);color:var(--pixel-yellow)}.diff-btn.hard .diff-star{border-color:var(--pixel-red);color:var(--pixel-red)}
.diff-label{font-family:var(--font-pixel);font-size:0.45rem;color:var(--text-primary)}.diff-desc{font-family:var(--font-body);font-size:1rem;color:var(--text-muted)}
.ai-thinking{display:flex;align-items:center;gap:8px;padding:6px 12px;margin-top:12px;background:rgba(179,136,255,0.08);border:2px solid rgba(179,136,255,0.2);font-family:var(--font-pixel);font-size:0.4rem;color:var(--pixel-purple);justify-content:center;max-width:480px}
.ai-dots{display:flex;gap:3px}.ai-dot{width:4px;height:4px;background:var(--pixel-purple);animation:blink 1s step-end infinite}.ai-dot:nth-child(2){animation-delay:.3s}.ai-dot:nth-child(3){animation-delay:.6s}
.game-page{padding:20px 24px;max-width:1100px;margin:0 auto}
.game-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px}
.game-title-area{display:flex;align-items:center;gap:10px}
.btn-back{width:36px;height:36px;background:var(--bg-secondary);border:2px solid var(--border-pixel);display:flex;align-items:center;justify-content:center;color:var(--text-secondary)}
.btn-back:hover{border-color:var(--pixel-green);color:var(--pixel-green)}
.game-title{font-family:var(--font-pixel);font-size:0.6rem;color:var(--pixel-purple)}
.game-badge{padding:3px 8px;font-family:var(--font-pixel);font-size:0.35rem;border:2px solid var(--pixel-purple);color:var(--pixel-purple)}
.game-controls{display:flex;gap:6px}
.btn-ctrl{display:flex;align-items:center;gap:5px;padding:7px 12px;background:var(--bg-secondary);border:2px solid var(--border-pixel);color:var(--text-secondary);font-family:var(--font-body);font-size:1.05rem}
.btn-ctrl:hover{border-color:var(--pixel-green);color:var(--pixel-green)}.btn-ctrl.danger:hover{border-color:var(--pixel-red);color:var(--pixel-red)}
.game-layout{display:flex;gap:16px;justify-content:center;align-items:flex-start}
.result-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:500;display:flex;align-items:center;justify-content:center;animation:fadeIn .3s}
.result-card{background:var(--bg-elevated);border:3px solid var(--pixel-green);padding:36px 44px;text-align:center;animation:scaleIn .3s}
.result-title{font-family:var(--font-pixel);font-size:0.8rem;color:var(--pixel-green);margin-bottom:8px}
.result-sub{font-family:var(--font-body);font-size:1.3rem;color:var(--text-secondary);margin-bottom:24px}
.result-actions{display:flex;gap:10px;justify-content:center}
.btn-res{padding:10px 20px;font-family:var(--font-pixel);font-size:0.45rem}.btn-res.primary{background:var(--pixel-green);color:var(--bg-deep);border:2px solid #1a5e08}.btn-res.secondary{background:var(--bg-tertiary);border:2px solid var(--border-pixel);color:var(--text-secondary)}
@media(max-width:900px){.game-layout{flex-direction:column;align-items:center}}
`;

export default function AIPage() {
  const saved = aiGameState();
  const settings = aiSettings();
  const [gs, setGs] = createSignal(saved || createGameState());
  const [diff, setDiff] = createSignal(settings.difficulty);
  const [pc, setPc] = createSignal(settings.playerColor || COLORS.WHITE);
  const [think, setThink] = createSignal(false);
  const [sr, setSr] = createSignal(false);
  const [setup, setSetup] = createSignal(!saved || !settings.difficulty);
  const nav = useNavigate();

  function updateGs(s) { setGs(s); setAiGameState(s); }

  function start(d) {
    setDiff(d); setSetup(false);
    setAiSettings({ difficulty: d, playerColor: pc() });
    const s = createGameState(); updateGs(s);
    if (pc() === COLORS.BLACK) aiMove(s);
  }
  function aiMove(s) {
    setThink(true);
    setTimeout(() => {
      const m = getAIMove(s, diff());
      if (m) { const ns = cloneState(s); applyMove(ns, m); updateGs(ns); if (ns.gameOver) { setTimeout(() => setSr(true), 500); save(ns); } }
      setThink(false);
    }, 300 + Math.random() * 400);
  }
  function onMove(m) {
    const ns = cloneState(gs()); applyMove(ns, m); updateGs(ns);
    if (ns.gameOver) { setTimeout(() => setSr(true), 500); save(ns); return; }
    aiMove(ns);
  }
  function reset() {
    setSetup(true); setSr(false);
    const s = createGameState(); updateGs(s);
    setDiff(null); setAiSettings({ difficulty: null, playerColor: COLORS.WHITE });
  }
  function resign() {
    const s = cloneState(gs()); s.gameOver = true;
    s.winner = pc() === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    updateGs(s); setTimeout(() => setSr(true), 200); save(s);
  }
  async function save(s) {
    if (!currentUser()) return;
    try { await apiRequest('/games', { method: 'POST', body: JSON.stringify({ game: { mode: 'ai', difficulty: diff(), player_color: pc(), winner: s.winner, result: s.winner === pc() ? 'win' : s.winner ? 'loss' : 'draw', moves: s.moveHistory.map(m => m.notation).join(' '), total_moves: s.moveHistory.length } }) }); } catch {}
  }

  return (
    <><style>{css}</style>
      <Show when={setup()}><div class="diff-overlay"><div class="diff-card">
        <div class="diff-title">VS COMPUTER</div><div class="diff-sub">Select color & difficulty</div>
        <div class="color-sel"><button class={`color-btn w ${pc() === COLORS.WHITE ? 'sel' : ''}`} onClick={() => setPc(COLORS.WHITE)}>W</button><button class={`color-btn b ${pc() === COLORS.BLACK ? 'sel' : ''}`} onClick={() => setPc(COLORS.BLACK)}>B</button></div>
        <div class="diff-opts">
          <button class="diff-btn easy" onClick={() => start('easy')}><div class="diff-star">E</div><div><div class="diff-label">EASY</div><div class="diff-desc">For beginners</div></div></button>
          <button class="diff-btn medium" onClick={() => start('medium')}><div class="diff-star">M</div><div><div class="diff-label">MEDIUM</div><div class="diff-desc">Balanced</div></div></button>
          <button class="diff-btn hard" onClick={() => start('hard')}><div class="diff-star">H</div><div><div class="diff-label">HARD</div><div class="diff-desc">Deep analysis</div></div></button>
        </div>
      </div></div></Show>
      <div class="game-page">
        <div class="game-top"><div class="game-title-area"><button class="btn-back" onClick={() => nav('/')}><Icon svg={IconArrowLeft} size="16px" /></button><h2 class="game-title">VS COMPUTER</h2><Show when={diff()}><span class="game-badge">{diff().toUpperCase()}</span></Show></div>
        <div class="game-controls"><button class="btn-ctrl" onClick={reset}><Icon svg={IconRefresh} size="12px" />New</button><button class="btn-ctrl danger" onClick={resign} disabled={gs().gameOver || think()}><Icon svg={IconFlag} size="12px" />Resign</button></div></div>
        <div class="game-layout">
          <div style={{"display":"flex","flex-direction":"column","align-items":"center"}}>
            <ChessBoard gameState={gs} onMove={onMove} disabled={() => gs().turn !== pc() || think()} />
            <Show when={think()}><div class="ai-thinking"><div class="ai-dots"><div class="ai-dot" /><div class="ai-dot" /><div class="ai-dot" /></div>THINKING...</div></Show>
          </div>
          <MoveHistory gameState={gs} />
        </div>
        {sr() && (<div class="result-overlay" onClick={() => setSr(false)}><div class="result-card" onClick={e => e.stopPropagation()}>
          <div class="result-title">{gs().isDraw ? 'DRAW' : gs().winner === pc() ? 'YOU WIN!' : 'AI WINS!'}</div>
          <div class="result-sub">{gs().isCheckmate ? 'Checkmate!' : gs().isStalemate ? 'Stalemate' : 'Resigned'}</div>
          <div class="result-actions"><button class="btn-res primary" onClick={reset}>PLAY AGAIN</button><button class="btn-res secondary" onClick={() => nav('/')}>HOME</button></div>
        </div></div>)}
      </div>
    </>
  );
}
