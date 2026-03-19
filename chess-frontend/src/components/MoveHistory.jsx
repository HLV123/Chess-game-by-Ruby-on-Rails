import { For, Show, createEffect } from 'solid-js';
import { getPieceIcon } from '../utils/icons';

const css = `
.move-panel{
  background:var(--bg-secondary);border:3px solid var(--border-pixel);
  display:flex;flex-direction:column;width:260px;max-height:520px;
}
.move-panel-header{
  padding:12px 14px;border-bottom:2px solid var(--border-pixel);
  font-family:var(--font-pixel);font-size:0.5rem;color:var(--pixel-green);
}
.move-list{flex:1;overflow-y:auto;padding:6px}
.move-row{display:grid;grid-template-columns:28px 1fr 1fr;gap:3px;padding:1px 0;align-items:center}
.move-num{font-family:var(--font-pixel);font-size:0.4rem;color:var(--text-muted);text-align:right;padding-right:4px}
.move-cell{
  font-family:var(--font-body);font-size:1.05rem;color:var(--text-secondary);
  padding:3px 6px;display:flex;align-items:center;gap:3px;
}
.move-cell:hover{background:var(--bg-tertiary)}
.move-cell.latest{color:var(--pixel-green);background:rgba(57,255,20,0.06)}
.move-piece-icon{width:12px;height:12px;display:inline-flex}
.captured-section{padding:10px 12px;border-top:2px solid var(--border-pixel)}
.captured-label{font-family:var(--font-pixel);font-size:0.35rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px}
.captured-pieces{display:flex;flex-wrap:wrap;gap:2px}
.captured-piece{width:18px;height:18px;opacity:0.5}
.empty-moves{padding:24px 14px;text-align:center;font-family:var(--font-body);font-size:1.1rem;color:var(--text-muted)}
@media(max-width:900px){.move-panel{width:100%;max-height:180px}}
`;

export default function MoveHistory(props) {
  let listRef;
  createEffect(() => {
    if (props.gameState().moveHistory.length && listRef) listRef.scrollTop = listRef.scrollHeight;
  });

  function pairs() {
    const m = props.gameState().moveHistory;
    const p = [];
    for (let i = 0; i < m.length; i += 2) p.push({ num: Math.floor(i/2)+1, white: m[i], black: m[i+1]||null });
    return p;
  }

  const cap = () => props.gameState().capturedPieces;

  return (
    <>
      <style>{css}</style>
      <div class="move-panel">
        <div class="move-panel-header">&gt; MOVES_</div>
        <div class="move-list" ref={listRef}>
          <Show when={props.gameState().moveHistory.length > 0} fallback={<div class="empty-moves">Waiting for first move...</div>}>
            <For each={pairs()}>{(p, idx) => (
              <div class="move-row">
                <span class="move-num">{p.num}.</span>
                <span class={`move-cell ${!p.black && idx()===pairs().length-1?'latest':''}`}>
                  <span class="move-piece-icon" innerHTML={getPieceIcon(p.white.piece,'w')} />{p.white.notation}
                </span>
                <Show when={p.black}>
                  <span class={`move-cell ${idx()===pairs().length-1?'latest':''}`}>
                    <span class="move-piece-icon" innerHTML={getPieceIcon(p.black.piece,'b')} />{p.black.notation}
                  </span>
                </Show>
              </div>
            )}</For>
          </Show>
        </div>
        <Show when={cap().w.length>0 || cap().b.length>0}>
          <div class="captured-section">
            <Show when={cap().b.length>0}>
              <div class="captured-label">CAPTURED BY WHITE</div>
              <div class="captured-pieces"><For each={cap().b}>{p=><span class="captured-piece" innerHTML={getPieceIcon(p,'b')} />}</For></div>
            </Show>
            <Show when={cap().w.length>0}>
              <div class="captured-label" style={{"margin-top":"6px"}}>CAPTURED BY BLACK</div>
              <div class="captured-pieces"><For each={cap().w}>{p=><span class="captured-piece" innerHTML={getPieceIcon(p,'w')} />}</For></div>
            </Show>
          </div>
        </Show>
      </div>
    </>
  );
}
