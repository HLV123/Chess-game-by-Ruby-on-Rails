import { createSignal, onMount, For, Show } from 'solid-js';
import { apiRequest } from '../stores/authStore';

const css = `
.ag{padding:32px;max-width:1100px;margin:0 auto;font-family:var(--font-admin);color:var(--admin-text)}
.ag h1{font-family:var(--font-admin-head);font-size:1.5rem;font-weight:700;margin-bottom:4px}
.ag-sub{font-size:0.85rem;color:var(--admin-muted);margin-bottom:24px}
.ag-card{background:var(--admin-card);border:1px solid var(--admin-border);border-radius:12px;overflow:hidden}
.ag-bar{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--admin-border);flex-wrap:wrap;gap:10px}
.ag-count{font-size:0.8rem;color:var(--admin-muted)}
.ag-filters{display:flex;gap:6px}
.f-btn{padding:6px 14px;border-radius:20px;font-size:0.75rem;font-weight:500;background:var(--admin-surface);border:1px solid var(--admin-border);color:var(--admin-muted);cursor:pointer;font-family:var(--font-admin);transition:all .15s}
.f-btn:hover,.f-btn.active{background:rgba(99,102,241,0.12);color:var(--admin-accent);border-color:var(--admin-accent)}
.ag-table{width:100%;border-collapse:collapse}
.ag-table th{padding:12px 16px;font-size:0.7rem;font-weight:600;color:var(--admin-muted);text-transform:uppercase;letter-spacing:0.05em;text-align:left;background:rgba(99,102,241,0.04)}
.ag-table td{padding:11px 16px;font-size:0.85rem;color:var(--admin-text);border-bottom:1px solid rgba(99,115,255,0.06)}
.ag-table tr:hover td{background:rgba(99,102,241,0.04)}
.pill{display:inline-block;padding:2px 10px;border-radius:20px;font-size:0.7rem;font-weight:600}
.pill.pvp{background:rgba(6,182,212,0.12);color:#06b6d4}.pill.ai{background:rgba(139,92,246,0.12);color:#8b5cf6}
.pill.win{background:rgba(34,197,94,0.12);color:#22c55e}.pill.loss{background:rgba(239,68,68,0.12);color:#ef4444}.pill.draw{background:rgba(234,179,8,0.12);color:#eab308}
.diff-tag{font-size:0.7rem;color:var(--admin-muted);margin-left:4px}
.empty{text-align:center;padding:40px;color:var(--admin-muted)}
`;

export default function AdminGames(){
  const [games,setGames]=createSignal([]);const [filter,setFilter]=createSignal('all');const [loading,setLoading]=createSignal(true);
  onMount(async()=>{try{const d=await apiRequest('/admin/games');setGames(d.games||[])}catch{}setLoading(false)});
  const filtered=()=>{const f=filter();return f==='all'?games():games().filter(g=>g.mode===f)};
  return(<><style>{css}</style><div class="ag">
    <h1>All Games</h1>
    <p class="ag-sub">Complete history of every game played on the platform. Filter by game mode.</p>
    <div class="ag-card">
      <div class="ag-bar">
        <span class="ag-count">{filtered().length} games</span>
        <div class="ag-filters">
          {['all','pvp','ai'].map(f=>(<button class={`f-btn ${filter()===f?'active':''}`} onClick={()=>setFilter(f)}>{f==='all'?'All':f.toUpperCase()}</button>))}
        </div>
      </div>
      <Show when={!loading()} fallback={<div class="empty">Loading...</div>}>
        <Show when={filtered().length>0} fallback={<div class="empty">No games found.</div>}>
          <table class="ag-table"><thead><tr><th>Player</th><th>Mode</th><th>Result</th><th>Moves</th><th>Date</th></tr></thead><tbody>
            <For each={filtered()}>{g=>(<tr>
              <td style={{"font-weight":"500"}}>{g.username||'Unknown'}</td>
              <td><span class={`pill ${g.mode}`}>{g.mode}</span>{g.difficulty?<span class="diff-tag">{g.difficulty}</span>:null}</td>
              <td><span class={`pill ${g.result}`}>{g.result}</span></td>
              <td>{g.total_moves||'-'}</td>
              <td style={{"font-size":"0.8rem","color":"var(--admin-muted)"}}>{g.created_at?new Date(g.created_at).toLocaleDateString():'-'}</td>
            </tr>)}</For>
          </tbody></table>
        </Show>
      </Show>
    </div>
  </div></>);
}
