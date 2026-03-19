import { Show } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { currentUser, logout } from '../stores/authStore';
import Icon from './Icon';
import { IconChart, IconUsers, IconHistory, IconLogOut, IconShield } from '../utils/icons';

const css = `
.admin-sb{position:fixed;left:0;top:0;bottom:0;width:260px;background:var(--admin-surface);border-right:1px solid var(--admin-border);display:flex;flex-direction:column;z-index:100;font-family:var(--font-admin)}
.asb-header{padding:24px 20px 20px;border-bottom:1px solid var(--admin-border)}
.asb-brand{display:flex;align-items:center;gap:12px}
.asb-logo{width:40px;height:40px;background:linear-gradient(135deg,var(--admin-accent),var(--admin-accent2));border-radius:10px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(99,102,241,0.3)}
.asb-info h1{font-family:var(--font-admin-head);font-size:1rem;font-weight:700;color:var(--admin-text);letter-spacing:-0.01em}
.asb-info span{font-family:var(--font-admin);font-size:0.7rem;color:var(--admin-muted);font-weight:400}
.asb-nav{flex:1;padding:16px 12px;overflow-y:auto}
.asb-sec{font-family:var(--font-admin);font-size:0.65rem;font-weight:600;color:var(--admin-muted);text-transform:uppercase;letter-spacing:0.08em;padding:12px 12px 6px}
.a-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;color:var(--admin-muted);font-family:var(--font-admin);font-size:0.85rem;font-weight:500;cursor:pointer;transition:all .15s;background:transparent;width:100%;text-align:left;border:none;margin-bottom:2px}
.a-item:hover{background:rgba(99,102,241,0.08);color:var(--admin-text)}
.a-item.active{background:rgba(99,102,241,0.12);color:var(--admin-accent);font-weight:600}
.a-icon{width:18px;height:18px;opacity:0.6}.a-item:hover .a-icon,.a-item.active .a-icon{opacity:1}
.asb-footer{padding:16px;border-top:1px solid var(--admin-border)}
.a-user{display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;background:rgba(99,102,241,0.06)}
.a-avatar{width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,var(--admin-accent),var(--admin-accent2));display:flex;align-items:center;justify-content:center;font-family:var(--font-admin-head);font-weight:700;font-size:0.8rem;color:#fff;flex-shrink:0}
.a-uinfo{flex:1;min-width:0}
.a-uname{font-family:var(--font-admin);font-size:0.8rem;font-weight:600;color:var(--admin-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.a-urole{font-family:var(--font-admin);font-size:0.65rem;color:var(--admin-accent);font-weight:500}
.a-logout{background:transparent;padding:6px;cursor:pointer;color:var(--admin-muted);display:flex;align-items:center;border:none;border-radius:6px;transition:all .15s}
.a-logout:hover{color:var(--admin-red);background:rgba(239,68,68,0.08)}
`;

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const items = [
    {label:'Dashboard',path:'/admin',icon:IconChart},
    {label:'Manage Users',path:'/admin/users',icon:IconUsers},
    {label:'All Games',path:'/admin/games',icon:IconHistory},
  ];
  return (
    <>
      <style>{css}</style>
      <nav class="admin-sb">
        <div class="asb-header"><div class="asb-brand">
          <div class="asb-logo"><Icon svg={IconShield} size="20px" style={{color:'#fff'}}/></div>
          <div class="asb-info"><h1>Royal Chess</h1><span>Admin Panel</span></div>
        </div></div>
        <div class="asb-nav">
          <div class="asb-sec">Management</div>
          {items.map(i=>(
            <button class={`a-item ${location.pathname===i.path?'active':''}`} onClick={()=>navigate(i.path)}>
              <Icon svg={i.icon} size="18px" class="a-icon"/>{i.label}
            </button>
          ))}
        </div>
        <div class="asb-footer">
          <Show when={currentUser()}>
            <div class="a-user">
              <div class="a-avatar">{currentUser()?.username?.charAt(0).toUpperCase()}</div>
              <div class="a-uinfo"><div class="a-uname">{currentUser()?.username}</div><div class="a-urole">Administrator</div></div>
              <button class="a-logout" onClick={()=>{logout();navigate('/login')}}><Icon svg={IconLogOut} size="16px"/></button>
            </div>
          </Show>
        </div>
      </nav>
    </>
  );
}
