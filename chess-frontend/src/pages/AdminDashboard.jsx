import { createSignal, onMount, For, Show } from 'solid-js';
import { apiRequest } from '../stores/authStore';

const css = `
.ad{padding:32px;max-width:1280px;margin:0 auto;font-family:var(--font-admin);color:var(--admin-text)}
.ad h1{font-family:var(--font-admin-head);font-size:1.6rem;font-weight:700;color:var(--admin-text);margin-bottom:4px}
.ad-sub{font-size:0.9rem;color:var(--admin-muted);margin-bottom:28px}
.ad-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
.ad-sc{background:var(--admin-card);border:1px solid var(--admin-border);border-radius:12px;padding:20px;position:relative;overflow:hidden;transition:all .2s}
.ad-sc:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3)}
.ad-sc::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:12px 12px 0 0}
.ad-sc:nth-child(1)::after{background:linear-gradient(90deg,#6366f1,#8b5cf6)}
.ad-sc:nth-child(2)::after{background:linear-gradient(90deg,#22c55e,#16a34a)}
.ad-sc:nth-child(3)::after{background:linear-gradient(90deg,#06b6d4,#0891b2)}
.ad-sc:nth-child(4)::after{background:linear-gradient(90deg,#eab308,#ca8a04)}
.sc-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.sc-label{font-size:0.8rem;color:var(--admin-muted);font-weight:500}
.sc-badge{font-size:0.65rem;padding:2px 8px;border-radius:20px;font-weight:600}
.sc-badge.up{background:rgba(34,197,94,0.12);color:#22c55e}.sc-badge.down{background:rgba(239,68,68,0.12);color:#ef4444}.sc-badge.neutral{background:rgba(100,116,139,0.12);color:#94a3b8}
.sc-val{font-family:var(--font-admin-head);font-size:2rem;font-weight:800;line-height:1;margin-bottom:4px}
.sc-hint{font-size:0.75rem;color:var(--admin-muted)}
.ad-charts{display:grid;grid-template-columns:3fr 2fr;gap:16px;margin-bottom:20px}
.ad-card{background:var(--admin-card);border:1px solid var(--admin-border);border-radius:12px;padding:24px;overflow:hidden}
.ad-card-title{font-family:var(--font-admin-head);font-size:0.95rem;font-weight:700;color:var(--admin-text);margin-bottom:4px}
.ad-card-desc{font-size:0.78rem;color:var(--admin-muted);margin-bottom:20px;line-height:1.4}
.area-chart{position:relative;height:200px;border-bottom:1px solid rgba(99,115,255,0.1);display:flex;align-items:flex-end;gap:0}
.area-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;position:relative}
.area-bar{width:100%;border-radius:4px 4px 0 0;transition:height .6s cubic-bezier(.34,1.56,.64,1);position:relative}
.area-bar.primary{background:linear-gradient(to top,rgba(99,102,241,0.3),rgba(99,102,241,0.8))}
.area-bar.secondary{background:linear-gradient(to top,rgba(139,92,246,0.2),rgba(139,92,246,0.6))}
.area-bar:hover{filter:brightness(1.3)}
.area-bar:hover::after{content:attr(data-val);position:absolute;top:-22px;left:50%;transform:translateX(-50%);font-size:0.65rem;font-weight:600;color:var(--admin-text);background:var(--admin-surface);padding:2px 6px;border-radius:4px;white-space:nowrap}
.area-label{font-size:0.65rem;color:var(--admin-muted);margin-top:8px;font-weight:500}
.chart-legend{display:flex;gap:16px;margin-top:12px}
.legend-item{display:flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--admin-muted)}
.legend-dot{width:10px;height:10px;border-radius:3px}
.donut-wrap{display:flex;align-items:center;justify-content:center;gap:28px;min-height:220px}
.donut-svg{width:160px;height:160px;transform:rotate(-90deg)}
.donut-legend{display:flex;flex-direction:column;gap:10px}
.dl-item{display:flex;align-items:center;gap:8px}
.dl-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}
.dl-name{font-size:0.8rem;color:var(--admin-text);font-weight:500}
.dl-val{font-size:0.7rem;color:var(--admin-muted)}
.hbars{display:flex;flex-direction:column;gap:14px}
.hbar-row{display:flex;align-items:center;gap:12px}
.hbar-lbl{font-size:0.8rem;color:var(--admin-muted);width:80px;text-align:right;flex-shrink:0;font-weight:500}
.hbar-track{flex:1;height:28px;background:var(--admin-surface);border-radius:6px;overflow:hidden}
.hbar-fill{height:100%;border-radius:6px;display:flex;align-items:center;justify-content:flex-end;padding-right:10px;transition:width 1s cubic-bezier(.34,1.56,.64,1)}
.hbar-fill span{font-size:0.7rem;font-weight:600;color:#fff}
.heatmap{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:8px}
.hm-cell{aspect-ratio:1;border-radius:4px;transition:all .15s;cursor:pointer;position:relative}
.hm-cell:hover{transform:scale(1.2);z-index:2;box-shadow:0 0 8px rgba(99,102,241,0.3)}
.hm-cell:hover::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 4px);left:50%;transform:translateX(-50%);font-size:0.6rem;color:var(--admin-text);background:var(--admin-card);padding:2px 6px;border-radius:4px;white-space:nowrap;border:1px solid var(--admin-border)}
.hm-0{background:var(--admin-surface)}.hm-1{background:rgba(99,102,241,0.15)}.hm-2{background:rgba(99,102,241,0.3)}.hm-3{background:rgba(99,102,241,0.5)}.hm-4{background:rgba(99,102,241,0.75)}
.hm-scale{display:flex;gap:4px;align-items:center;margin-top:10px;justify-content:flex-end}
.hm-lbl{font-size:0.65rem;color:var(--admin-muted)}.hm-sq{width:12px;height:12px;border-radius:3px}
.ad-table{width:100%;border-collapse:collapse;margin-top:8px}
.ad-table th{padding:12px 14px;font-size:0.7rem;font-weight:600;color:var(--admin-muted);text-transform:uppercase;letter-spacing:0.05em;text-align:left;border-bottom:1px solid var(--admin-border)}
.ad-table td{padding:11px 14px;font-size:0.85rem;color:var(--admin-text);border-bottom:1px solid rgba(99,115,255,0.06)}
.ad-table tr:hover td{background:rgba(99,102,241,0.04)}
.pill{display:inline-block;padding:2px 10px;border-radius:20px;font-size:0.7rem;font-weight:600}
.pill.pvp{background:rgba(6,182,212,0.12);color:#06b6d4}.pill.ai{background:rgba(139,92,246,0.12);color:#8b5cf6}
.pill.win{background:rgba(34,197,94,0.12);color:#22c55e}.pill.loss{background:rgba(239,68,68,0.12);color:#ef4444}.pill.draw{background:rgba(234,179,8,0.12);color:#eab308}
.loading-msg{text-align:center;padding:40px;color:var(--admin-muted);font-size:0.9rem}
@media(max-width:1024px){.ad-stats{grid-template-columns:repeat(2,1fr)}.ad-charts{grid-template-columns:1fr}}
@media(max-width:640px){.ad-stats{grid-template-columns:1fr}}
`;

export default function AdminDashboard() {
  const [data, setData] = createSignal(null);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const d = await apiRequest('/admin/stats');
      setData(d);
    } catch (e) { console.error(e); }
    setLoading(false);
  });

  function badge(val) {
    if (val > 0) return { cls: 'up', text: `+${val}%` };
    if (val < 0) return { cls: 'down', text: `${val}%` };
    return { cls: 'neutral', text: '0%' };
  }

  function donutSegs(modes) {
    if (!modes || !modes.length) return [];
    const total = modes.reduce((s, m) => s + m.value, 0);
    if (total === 0) return [];
    const c = 2 * Math.PI * 60;
    let off = 0;
    return modes.map(m => {
      const p = m.value / total;
      const d = p * c;
      const seg = { ...m, da: `${d} ${c - d}`, off: -off, pct: Math.round(p * 100) };
      off += d;
      return seg;
    });
  }

  return (
    <><style>{css}</style><div class="ad">
      <h1>Dashboard Overview</h1>
      <p class="ad-sub">Monitor player activity, game statistics, and platform health — all data from your database.</p>

      <Show when={!loading()} fallback={<div class="loading-msg">Loading dashboard data...</div>}>
        <Show when={data()} fallback={<div class="loading-msg">Could not load data. Check backend connection.</div>}>
          {(() => {
            const d = data();
            const s = d.stats || {};
            const weekly = d.weekly_games || [];
            const modes = d.game_mode_distribution || [];
            const rDist = d.rating_distribution || [];
            const heatmap = d.activity_heatmap || [];
            const recent = d.recent_games || [];
            const maxG = Math.max(...weekly.map(x => x.total), 1);

            return <>
              {/* Stat Cards - all from DB */}
              <div class="ad-stats animate-fade-in">
                <div class="ad-sc">
                  <div class="sc-top"><span class="sc-label">Total Players</span><span class={`sc-badge ${badge(s.usersChange || 0).cls}`}>{badge(s.usersChange || 0).text}</span></div>
                  <div class="sc-val">{s.totalUsers || 0}</div><div class="sc-hint">Registered player accounts</div>
                </div>
                <div class="ad-sc">
                  <div class="sc-top"><span class="sc-label">Games Played</span><span class={`sc-badge ${badge(s.gamesChange || 0).cls}`}>{badge(s.gamesChange || 0).text}</span></div>
                  <div class="sc-val">{s.totalGames || 0}</div><div class="sc-hint">Total matches (PvP + AI)</div>
                </div>
                <div class="ad-sc">
                  <div class="sc-top"><span class="sc-label">Active Today</span><span class={`sc-badge ${badge(s.activeChange || 0).cls}`}>{badge(s.activeChange || 0).text}</span></div>
                  <div class="sc-val">{s.activeToday || 0}</div><div class="sc-hint">Players logged in today</div>
                </div>
                <div class="ad-sc">
                  <div class="sc-top"><span class="sc-label">Avg Rating</span></div>
                  <div class="sc-val">{s.avgRating || 1200}</div><div class="sc-hint">Average ELO across players</div>
                </div>
              </div>

              {/* Weekly + Donut */}
              <div class="ad-charts">
                <div class="ad-card animate-slide-up stagger-1">
                  <div class="ad-card-title">Weekly Game Activity</div>
                  <div class="ad-card-desc">Games played each day this week from database. Hover for counts.</div>
                  <Show when={weekly.length > 0} fallback={<div class="loading-msg">No weekly data yet.</div>}>
                    <div class="area-chart">
                      <For each={weekly}>{w => (
                        <div class="area-bar-wrap">
                          <div class="area-bar secondary" data-val={`AI: ${w.ai}`} style={{ height: `${(w.ai / maxG) * 170}px`, position: 'absolute', bottom: 0, width: '60%', left: '20%', opacity: 0.6 }} />
                          <div class="area-bar primary" data-val={`Total: ${w.total}`} style={{ height: `${(w.total / maxG) * 170}px` }} />
                          <div class="area-label">{w.day}</div>
                        </div>
                      )}</For>
                    </div>
                    <div class="chart-legend"><div class="legend-item"><div class="legend-dot" style={{ background: 'rgba(99,102,241,0.8)' }} />Total</div><div class="legend-item"><div class="legend-dot" style={{ background: 'rgba(139,92,246,0.5)' }} />AI</div></div>
                  </Show>
                </div>
                <div class="ad-card animate-slide-up stagger-2">
                  <div class="ad-card-title">Game Mode Distribution</div>
                  <div class="ad-card-desc">How players choose to play — from actual game records.</div>
                  <Show when={modes.length > 0 && modes.some(m => m.value > 0)} fallback={<div class="loading-msg">No games yet.</div>}>
                    <div class="donut-wrap">
                      <svg class="donut-svg" viewBox="0 0 140 140"><For each={donutSegs(modes)}>{s => (<circle cx="70" cy="70" r="60" fill="none" stroke={s.color} stroke-width="18" stroke-dasharray={s.da} stroke-dashoffset={s.off} />)}</For></svg>
                      <div class="donut-legend"><For each={donutSegs(modes)}>{s => (<div class="dl-item"><div class="dl-dot" style={{ background: s.color }} /><div><span class="dl-name">{s.label}</span><br /><span class="dl-val">{s.pct}% ({s.value})</span></div></div>)}</For></div>
                    </div>
                  </Show>
                </div>
              </div>

              {/* Rating + Heatmap */}
              <div class="ad-charts">
                <div class="ad-card animate-slide-up stagger-3">
                  <div class="ad-card-title">Player Rating Distribution</div>
                  <div class="ad-card-desc">Skill level spread across all players — queried from user ratings.</div>
                  <Show when={rDist.length > 0} fallback={<div class="loading-msg">No players yet.</div>}>
                    <div class="hbars"><For each={rDist}>{r => (
                      <div class="hbar-row"><span class="hbar-lbl">{r.range}</span><div class="hbar-track"><div class="hbar-fill" style={{ width: `${Math.max(r.pct * 2.5, 2)}%`, background: `linear-gradient(90deg,${r.color}cc,${r.color})` }}><span>{r.count} ({r.pct}%)</span></div></div></div>
                    )}</For></div>
                  </Show>
                </div>
                <div class="ad-card animate-slide-up stagger-4">
                  <div class="ad-card-title">Activity Heatmap (28 days)</div>
                  <div class="ad-card-desc">Games per day — darker = more activity. Data from game timestamps.</div>
                  <Show when={heatmap.length > 0}>
                    <div style={{ "display": "flex", "justify-content": "space-between", "font-size": "0.65rem", "color": "var(--admin-muted)", "margin-bottom": "4px" }}><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                    <div class="heatmap"><For each={heatmap}>{h => <div class={`hm-cell hm-${h.level}`} data-tip={`${h.date}: ${h.count} games`} />}</For></div>
                    <div class="hm-scale"><span class="hm-lbl">Less</span>{[0, 1, 2, 3, 4].map(l => <div class={`hm-sq hm-${l}`} />)}<span class="hm-lbl">More</span></div>
                  </Show>
                </div>
              </div>

              {/* Recent Games */}
              <div class="ad-card" style={{ "margin-top": "16px" }}>
                <div class="ad-card-title">Recent Games</div>
                <div class="ad-card-desc">Latest games from database — updated in real time.</div>
                <Show when={recent.length > 0} fallback={<div class="loading-msg">No games recorded yet.</div>}>
                  <table class="ad-table"><thead><tr><th>Player</th><th>Mode</th><th>Result</th><th>Moves</th><th>Date</th></tr></thead><tbody>
                    <For each={recent.slice(0, 10)}>{g => (<tr><td style={{ "font-weight": "500" }}>{g.username}</td><td><span class={`pill ${g.mode}`}>{g.mode}</span>{g.difficulty ? ` ${g.difficulty}` : ''}</td><td><span class={`pill ${g.result}`}>{g.result}</span></td><td>{g.total_moves}</td><td style={{ "font-size": "0.8rem", "color": "var(--admin-muted)" }}>{new Date(g.created_at).toLocaleDateString()}</td></tr>)}</For>
                  </tbody></table>
                </Show>
              </div>
            </>;
          })()}
        </Show>
      </Show>
    </div></>
  );
}
