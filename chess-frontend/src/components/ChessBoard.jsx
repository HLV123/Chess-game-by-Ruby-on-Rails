import { createSignal, For, Show } from 'solid-js';
import { getPieceIcon } from '../utils/icons';
import { COLORS, getLegalMoves, COL_NAMES } from '../utils/chessEngine';

const BOARD_SIZE = 480;
const CELL = BOARD_SIZE / 8;

const css = `
.chess-board-wrapper{display:flex;flex-direction:column;align-items:center;gap:10px}
.board-container{
  border:4px solid var(--pixel-green);
  box-shadow:0 0 0 4px var(--bg-deep),0 0 20px rgba(57,255,20,0.15);
  background:var(--bg-deep);
  width:${BOARD_SIZE}px;height:${BOARD_SIZE}px;
}
.board-grid{
  display:grid;
  grid-template-columns:repeat(8,${CELL}px);
  grid-template-rows:repeat(8,${CELL}px);
  width:${BOARD_SIZE}px;height:${BOARD_SIZE}px;
}
.square{
  width:${CELL}px;height:${CELL}px;
  position:relative;display:flex;align-items:center;justify-content:center;
  cursor:pointer;user-select:none;
}
.square.light{background:var(--board-light)}
.square.dark{background:var(--board-dark)}
.square.selected{background:var(--board-highlight) !important}
.square.legal-target::after{
  content:'';position:absolute;width:14px;height:14px;
  background:var(--pixel-green);opacity:0.6;pointer-events:none;z-index:2;
}
.square.legal-capture::after{
  content:'';position:absolute;inset:3px;
  border:3px solid var(--pixel-red);pointer-events:none;z-index:2;
}
.square.last-move{background:var(--board-last-move) !important}
.square.in-check{background:var(--board-check) !important;animation:checkBlink 0.6s step-end infinite}
@keyframes checkBlink{0%,100%{opacity:1}50%{opacity:0.7}}
.piece{width:${CELL - 8}px;height:${CELL - 8}px;z-index:3;pointer-events:none;image-rendering:auto}
.coord-label{
  position:absolute;font-family:var(--font-pixel);font-size:0.35rem;
  pointer-events:none;z-index:4;opacity:0.5;
}
.coord-label.file{bottom:1px;right:3px}
.coord-label.rank{top:1px;left:3px}
.coord-label.on-light{color:var(--board-dark)}
.coord-label.on-dark{color:var(--board-light)}
.turn-indicator{
  display:flex;align-items:center;gap:8px;
  font-family:var(--font-pixel);font-size:0.55rem;color:var(--text-secondary);
}
.turn-dot{width:12px;height:12px;border:2px solid var(--pixel-green)}
.turn-dot.white{background:#e0d0b0}
.turn-dot.black{background:#1a1625}
.promo-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:1000;
  display:flex;align-items:center;justify-content:center;animation:fadeIn .2s;
}
.promo-modal{
  background:var(--bg-elevated);border:3px solid var(--pixel-cyan);
  padding:20px 24px;animation:scaleIn .2s;
}
.promo-title{font-family:var(--font-pixel);font-size:0.55rem;color:var(--pixel-cyan);text-align:center;margin-bottom:12px}
.promo-options{display:flex;gap:8px}
.promo-option{
  width:56px;height:56px;border:2px solid var(--border-subtle);
  background:var(--bg-tertiary);cursor:pointer;display:flex;
  align-items:center;justify-content:center;transition:all .1s;
}
.promo-option:hover{border-color:var(--pixel-green);background:var(--bg-elevated)}
@media(max-width:520px){
  .board-container,.board-grid{width:calc(100vw - 32px);height:calc(100vw - 32px)}
  .square{width:calc((100vw - 32px)/8);height:calc((100vw - 32px)/8)}
  .piece{width:calc((100vw - 32px)/8 - 6px);height:calc((100vw - 32px)/8 - 6px)}
}
`;

export default function ChessBoard(props) {
  const [selectedSquare, setSelectedSquare] = createSignal(null);
  const [legalMoves, setLegalMoves] = createSignal([]);
  const [promotionMove, setPromotionMove] = createSignal(null);

  function isLight(r, c) { return (r + c) % 2 === 0; }

  function handleClick(row, col) {
    const state = props.gameState();
    if (state.gameOver || props.disabled?.()) return;
    const selected = selectedSquare();
    const piece = state.board[row][col];

    if (selected) {
      const move = legalMoves().find(m => m.toRow === row && m.toCol === col);
      if (move) {
        if (move.special?.type === 'promotion') {
          setPromotionMove({ fromRow: selected.row, fromCol: selected.col, toRow: row, toCol: col });
          setSelectedSquare(null); setLegalMoves([]); return;
        }
        props.onMove?.(move);
        setSelectedSquare(null); setLegalMoves([]); return;
      }
    }
    if (piece && piece.color === state.turn) {
      setSelectedSquare({ row, col });
      setLegalMoves(getLegalMoves(state, row, col));
    } else {
      setSelectedSquare(null); setLegalMoves([]);
    }
  }

  function handlePromotion(type) {
    const pm = promotionMove();
    if (!pm) return;
    props.onMove?.({ fromRow:pm.fromRow, fromCol:pm.fromCol, toRow:pm.toRow, toCol:pm.toCol, special:{type:'promotion',piece:type} });
    setPromotionMove(null);
  }

  function classes(row, col) {
    const c = ['square', isLight(row,col)?'light':'dark'];
    const sel = selectedSquare();
    if (sel && sel.row===row && sel.col===col) c.push('selected');
    const st = props.gameState();
    const lm = st.lastMove;
    if (lm && ((lm.fromRow===row&&lm.fromCol===col)||(lm.toRow===row&&lm.toCol===col))) c.push('last-move');
    if (st.isCheck && st.board[row][col]?.type==='K' && st.board[row][col]?.color===st.turn) c.push('in-check');
    const target = legalMoves().find(m => m.toRow===row && m.toCol===col);
    if (target) c.push(st.board[row][col] ? 'legal-capture' : 'legal-target');
    return c.join(' ');
  }

  return (
    <>
      <style>{css}</style>
      <div class="chess-board-wrapper">
        <div class="turn-indicator">
          <div class={`turn-dot ${props.gameState().turn===COLORS.WHITE?'white':'black'}`} />
          <span>
            {props.gameState().gameOver
              ? (props.gameState().winner ? `${props.gameState().winner===COLORS.WHITE?'WHITE':'BLACK'} WINS!` : 'DRAW!')
              : `${props.gameState().turn===COLORS.WHITE?'WHITE':'BLACK'} TO MOVE`}
          </span>
        </div>
        <div class="board-container">
          <div class="board-grid">
            <For each={Array.from({length:64},(_,i)=>({row:Math.floor(i/8),col:i%8}))}>
              {(sq) => {
                const piece = () => props.gameState().board[sq.row][sq.col];
                return (
                  <div class={classes(sq.row,sq.col)} onClick={() => handleClick(sq.row,sq.col)}>
                    <Show when={sq.col===0}>
                      <span class={`coord-label rank ${isLight(sq.row,sq.col)?'on-light':'on-dark'}`}>{8-sq.row}</span>
                    </Show>
                    <Show when={sq.row===7}>
                      <span class={`coord-label file ${isLight(sq.row,sq.col)?'on-light':'on-dark'}`}>{COL_NAMES[sq.col]}</span>
                    </Show>
                    <Show when={piece()}>
                      <div class="piece" innerHTML={getPieceIcon(piece().type,piece().color)} />
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
        <Show when={promotionMove()}>
          <div class="promo-overlay" onClick={()=>setPromotionMove(null)}>
            <div class="promo-modal" onClick={e=>e.stopPropagation()}>
              <div class="promo-title">PROMOTE TO</div>
              <div class="promo-options">
                <For each={['Q','R','B','N']}>
                  {(t)=>(<div class="promo-option" onClick={()=>handlePromotion(t)} innerHTML={getPieceIcon(t,props.gameState().turn)} />)}
                </For>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </>
  );
}
