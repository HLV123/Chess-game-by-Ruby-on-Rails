import { createSignal, Show } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { currentUser, logout } from '../stores/authStore';
import Icon from './Icon';
import { IconHome, IconCrown, IconLogOut, IconSword, IconHistory } from '../utils/icons';

const css = `
.sidebar{position:fixed;left:0;top:0;bottom:0;width:240px;background:var(--bg-primary);border-right:3px solid var(--pixel-green);display:flex;flex-direction:column;z-index:100}
.sb-header{padding:20px 16px 16px;border-bottom:2px solid var(--border-pixel)}
.sb-brand{display:flex;align-items:center;gap:10px}
.sb-icon{width:36px;height:36px;background:var(--pixel-green);display:flex;align-items:center;justify-content:center}
.sb-text h1{font-family:var(--font-pixel);font-size:0.5rem;color:var(--pixel-green);line-height:1.4}
.sb-text span{font-family:var(--font-body);font-size:0.9rem;color:var(--text-muted)}
.sb-nav{flex:1;padding:12px 8px;overflow-y:auto}
.sb-sec{font-family:var(--font-pixel);font-size:0.4rem;color:var(--text-muted);text-transform:uppercase;padding:10px 10px 6px}
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;color:var(--text-secondary);font-family:var(--font-body);font-size:1.1rem;cursor:pointer;background:transparent;width:100%;text-align:left;border:2px solid transparent;margin-bottom:2px}
.nav-item:hover{background:var(--bg-tertiary);color:var(--pixel-green);border-color:var(--border-subtle)}
.nav-item.active{background:rgba(57,255,20,0.06);border:2px solid var(--pixel-green);color:var(--pixel-green)}
.nav-icon{width:16px;height:16px;opacity:0.7}.nav-item:hover .nav-icon,.nav-item.active .nav-icon{opacity:1}
.sb-footer{padding:12px;border-top:2px solid var(--border-pixel)}
.user-card{display:flex;align-items:center;gap:10px;padding:8px;background:var(--bg-tertiary);border:2px solid var(--border-subtle)}
.user-av{width:32px;height:32px;background:var(--pixel-purple);display:flex;align-items:center;justify-content:center;font-family:var(--font-pixel);font-size:0.45rem;color:#fff;flex-shrink:0}
.user-info{flex:1;min-width:0}
.user-name{font-family:var(--font-body);font-size:1.1rem;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.user-role{font-family:var(--font-pixel);font-size:0.35rem;color:var(--pixel-yellow)}
.btn-lo{background:transparent;padding:4px;cursor:pointer;color:var(--text-muted);display:flex;align-items:center;border:none}
.btn-lo:hover{color:var(--pixel-red)}
`;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const items = [
    {label:'HOME',path:'/',icon:IconHome},
    {label:'PVP BATTLE',path:'/play/pvp',icon:IconSword},
    {label:'VS COMPUTER',path:'/play/ai',icon:CpuSvg},
    {label:'MY HISTORY',path:'/history',icon:IconHistory},
  ];
  return (
    <>
      <style>{css}</style>
      <nav class="sidebar">
        <div class="sb-header"><div class="sb-brand">
          <div class="sb-icon"><Icon svg={IconCrown} size="18px" style={{color:'#0d0d1a'}}/></div>
          <div class="sb-text"><h1>ROYAL CHESS</h1><span>Player Mode</span></div>
        </div></div>
        <div class="sb-nav">
          <div class="sb-sec">PLAY</div>
          {items.map(i=>(
            <button class={`nav-item ${location.pathname===i.path?'active':''}`} onClick={()=>navigate(i.path)}>
              <Icon svg={i.icon} size="16px" class="nav-icon"/>{i.label}
            </button>
          ))}
        </div>
        <div class="sb-footer">
          <Show when={currentUser()}>
            <div class="user-card">
              <div class="user-av">{currentUser()?.username?.charAt(0).toUpperCase()}</div>
              <div class="user-info"><div class="user-name">{currentUser()?.username}</div><div class="user-role">PLAYER</div></div>
              <button class="btn-lo" onClick={()=>{logout();navigate('/login')}}><Icon svg={IconLogOut} size="14px"/></button>
            </div>
          </Show>
        </div>
      </nav>
    </>
  );
}
function CpuSvg(){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`}
