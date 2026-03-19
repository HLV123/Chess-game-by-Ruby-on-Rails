import { Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { currentUser } from '../stores/authStore';
import Icon from '../components/Icon';
import { IconSword, IconCrown, IconPlay } from '../utils/icons';

const css = `
.home-page{padding:32px 24px;max-width:900px;margin:0 auto}
.hero{text-align:center;padding:32px 0 48px}
.hero-icon{width:56px;height:56px;margin:0 auto 16px;background:var(--pixel-green);display:flex;align-items:center;justify-content:center}
.hero-title{font-family:var(--font-pixel);font-size:1rem;color:var(--pixel-green);margin-bottom:10px;text-shadow:0 0 20px rgba(57,255,20,0.3)}
.hero-sub{font-family:var(--font-body);font-size:1.3rem;color:var(--text-secondary);max-width:440px;margin:0 auto}
.modes{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:16px}
.mode-card{background:var(--bg-secondary);border:3px solid var(--border-subtle);padding:24px 20px;cursor:pointer;transition:all .15s;text-align:left}
.mode-card:hover{border-color:var(--card-c);box-shadow:0 0 20px var(--card-g);transform:translateY(-3px)}
.mode-card.pvp{--card-c:var(--pixel-cyan);--card-g:rgba(0,229,255,0.15)}.mode-card.ai{--card-c:var(--pixel-purple);--card-g:rgba(179,136,255,0.15)}
.mode-icon{width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;border:2px solid var(--card-c);color:var(--card-c)}
.mode-title{font-family:var(--font-pixel);font-size:0.55rem;color:var(--text-primary);margin-bottom:6px}
.mode-desc{font-family:var(--font-body);font-size:1.15rem;color:var(--text-secondary);margin-bottom:18px}
.mode-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;font-family:var(--font-pixel);font-size:0.4rem;border:2px solid var(--card-c);color:var(--card-c);background:transparent}
.mode-btn:hover{background:var(--card-c);color:var(--bg-deep)}
.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:32px}
.stat-box{background:var(--bg-secondary);border:2px solid var(--border-subtle);padding:16px;text-align:center}
.stat-val{font-family:var(--font-pixel);font-size:0.8rem;color:var(--pixel-yellow);margin-bottom:4px}
.stat-lbl{font-family:var(--font-pixel);font-size:0.3rem;color:var(--text-muted);text-transform:uppercase}
@media(max-width:600px){.modes{grid-template-columns:1fr}.stats-row{grid-template-columns:1fr}}
`;

export default function HomePage(){
  const navigate=useNavigate();
  return(<><style>{css}</style><div class="home-page">
    <section class="hero animate-fade-in">
      <div class="hero-icon"><Icon svg={IconCrown} size="28px" style={{color:'#0d0d1a'}}/></div>
      <h1 class="hero-title">ROYAL CHESS</h1>
      <p class="hero-sub">Challenge your mind. Play against a friend or the computer.</p>
    </section>
    <div class="modes">
      <div class="mode-card pvp animate-slide-up stagger-1" onClick={()=>navigate('/play/pvp')}>
        <div class="mode-icon"><Icon svg={IconSword} size="22px"/></div>
        <h3 class="mode-title">PVP BATTLE</h3><p class="mode-desc">Two players, one device.</p>
        <span class="mode-btn"><Icon svg={IconPlay} size="10px"/>START</span>
      </div>
      <div class="mode-card ai animate-slide-up stagger-2" onClick={()=>navigate('/play/ai')}>
        <div class="mode-icon"><span innerHTML={CpuSvg()} style={{width:'22px',height:'22px',display:'flex'}}/></div>
        <h3 class="mode-title">VS COMPUTER</h3><p class="mode-desc">Easy, Medium, or Hard AI.</p>
        <span class="mode-btn"><Icon svg={IconPlay} size="10px"/>CHALLENGE</span>
      </div>
    </div>
    <Show when={currentUser()}>
      <div class="stats-row animate-slide-up stagger-3">
        <div class="stat-box"><div class="stat-val">{currentUser()?.games_played||0}</div><div class="stat-lbl">GAMES</div></div>
        <div class="stat-box"><div class="stat-val">{currentUser()?.wins||0}</div><div class="stat-lbl">WINS</div></div>
        <div class="stat-box"><div class="stat-val">{currentUser()?.rating||1200}</div><div class="stat-lbl">RATING</div></div>
      </div>
    </Show>
  </div></>);
}
function CpuSvg(){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`}
