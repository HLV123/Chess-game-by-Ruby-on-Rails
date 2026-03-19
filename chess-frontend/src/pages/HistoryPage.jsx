import { createSignal, onMount, For, Show } from 'solid-js';
import { apiRequest } from '../stores/authStore';
import { useNavigate } from '@solidjs/router';
import Icon from '../components/Icon';
import { IconArrowLeft } from '../utils/icons';

const css = `
.hist-page{padding:24px;max-width:800px;margin:0 auto}
.hist-header{display:flex;align-items:center;gap:10px;margin-bottom:24px}
.hist-title{font-family:var(--font-pixel);font-size:0.6rem;color:var(--pixel-cyan)}
.btn-back{width:36px;height:36px;background:var(--bg-secondary);border:2px solid var(--border-pixel);display:flex;align-items:center;justify-content:center;color:var(--text-secondary)}
.btn-back:hover{border-color:var(--pixel-green);color:var(--pixel-green)}
.hist-wrap{background:var(--bg-secondary);border:3px solid var(--border-pixel);overflow:hidden}
.hist-table{width:100%;border-collapse:collapse}
.hist-table th{padding:10px 12px;font-family:var(--font-pixel);font-size:0.35rem;color:var(--text-muted);text-transform:uppercase;text-align:left;background:var(--bg-tertiary);border-bottom:2px solid var(--border-pixel)}
.hist-table td{padding:10px 12px;font-family:var(--font-body);font-size:1.1rem;color:var(--text-secondary);border-bottom:1px solid var(--border-subtle)}
.hist-table tr:hover td{background:var(--bg-tertiary)}
.tag{display:inline-block;padding:2px 6px;font-family:var(--font-pixel);font-size:0.3rem;border:2px solid}
.tag.pvp{color:var(--pixel-cyan);border-color:var(--pixel-cyan)}.tag.ai{color:var(--pixel-purple);border-color:var(--pixel-purple)}
.tag.win{color:var(--pixel-green);border-color:var(--pixel-green)}.tag.loss{color:var(--pixel-red);border-color:var(--pixel-red)}.tag.draw{color:var(--pixel-yellow);border-color:var(--pixel-yellow)}
.empty{text-align:center;padding:40px;font-family:var(--font-body);font-size:1.2rem;color:var(--text-muted)}
`;

export default function HistoryPage(){
  const [games,setGames]=createSignal([]);const [loading,setLoading]=createSignal(true);const nav=useNavigate();
  onMount(async()=>{try{const d=await apiRequest('/games');setGames(d.games||[])}catch{}setLoading(false)});
  return(<><style>{css}</style><div class="hist-page">
    <div class="hist-header"><button class="btn-back" onClick={()=>nav('/')}><Icon svg={IconArrowLeft} size="16px"/></button><h2 class="hist-title">&gt; MY HISTORY_</h2></div>
    <Show when={!loading()} fallback={<p style={{color:'var(--text-muted)'}}>Loading...</p>}>
      <Show when={games().length>0} fallback={<div class="empty">No games yet. Go play!</div>}>
        <div class="hist-wrap"><table class="hist-table"><thead><tr><th>#</th><th>Mode</th><th>Result</th><th>Moves</th><th>Date</th></tr></thead><tbody>
          <For each={games()}>{(g,i)=>(<tr><td style={{color:'var(--text-muted)'}}>{i()+1}</td><td><span class={`tag ${g.mode}`}>{g.mode.toUpperCase()}</span></td><td><span class={`tag ${g.result}`}>{g.result.toUpperCase()}</span></td><td>{g.total_moves||'-'}</td><td>{g.created_at?new Date(g.created_at).toLocaleDateString():'-'}</td></tr>)}</For>
        </tbody></table></div>
      </Show>
    </Show>
  </div></>);
}
