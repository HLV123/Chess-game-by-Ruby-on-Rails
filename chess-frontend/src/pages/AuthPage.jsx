import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { login, register, authLoading, authError, currentUser, isAdmin } from '../stores/authStore';
import Icon from '../components/Icon';
import { IconCrown } from '../utils/icons';

const css = `
.auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.auth-page::before{content:'';position:fixed;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(57,255,20,0.02) 3px,rgba(57,255,20,0.02) 6px)}
.auth-card{position:relative;width:100%;max-width:380px;background:var(--bg-secondary);border:3px solid var(--pixel-green);padding:32px 28px;box-shadow:0 0 30px rgba(57,255,20,0.1);animation:scaleIn .3s}
.auth-header{text-align:center;margin-bottom:28px}
.auth-logo{width:48px;height:48px;margin:0 auto 14px;background:var(--pixel-green);display:flex;align-items:center;justify-content:center}
.auth-title{font-family:var(--font-pixel);font-size:0.7rem;color:var(--pixel-green)}
.auth-sub{font-family:var(--font-body);font-size:1.2rem;color:var(--text-muted);margin-top:6px}
.tab-switch{display:flex;background:var(--bg-tertiary);margin-bottom:24px;border:2px solid var(--border-pixel)}
.tab-btn{flex:1;padding:8px;font-family:var(--font-pixel);font-size:0.45rem;color:var(--text-secondary);background:transparent;transition:all .1s}
.tab-btn.active{background:var(--pixel-green);color:var(--bg-deep)}
.form-group{margin-bottom:14px}
.form-label{display:block;font-family:var(--font-pixel);font-size:0.38rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px}
.form-input{width:100%;padding:10px 12px;background:var(--bg-tertiary);border:2px solid var(--border-pixel);color:var(--text-primary);font-size:1.2rem}
.form-input:focus{outline:none;border-color:var(--pixel-green);box-shadow:0 0 8px rgba(57,255,20,0.2)}
.form-input::placeholder{color:var(--text-muted)}
.btn-submit{width:100%;padding:12px;background:var(--pixel-green);color:var(--bg-deep);font-family:var(--font-pixel);font-size:0.5rem;margin-top:8px;border:2px solid #1a5e08}
.btn-submit:hover:not(:disabled){filter:brightness(1.2)}
.btn-submit:disabled{opacity:0.5;cursor:not-allowed}
.auth-error{background:rgba(255,23,68,0.1);border:2px solid var(--pixel-red);padding:8px 10px;margin-bottom:12px;font-family:var(--font-body);font-size:1rem;color:var(--pixel-red)}
.blink-cursor::after{content:'_';animation:blink 1s step-end infinite}
`;

export default function AuthPage() {
  const [mode, setMode] = createSignal('login');
  const [email, setEmail] = createSignal('');
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (mode()==='login') await login(username(), password());
      else await register(email(), username(), password());
      // Redirect based on role
      if (isAdmin()) navigate('/admin');
      else navigate('/');
    } catch {}
  }

  return (
    <>
      <style>{css}</style>
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo"><Icon svg={IconCrown} size="24px" style={{color:'#0d0d1a'}}/></div>
            <h2 class="auth-title">ROYAL CHESS</h2>
            <p class="auth-sub blink-cursor">{mode()==='login'?'ENTER CREDENTIALS':'CREATE ACCOUNT'}</p>
          </div>
          <div class="tab-switch">
            <button class={`tab-btn ${mode()==='login'?'active':''}`} onClick={()=>setMode('login')}>LOGIN</button>
            <button class={`tab-btn ${mode()==='register'?'active':''}`} onClick={()=>setMode('register')}>REGISTER</button>
          </div>
          <Show when={authError()}><div class="auth-error">{authError()}</div></Show>
          <form onSubmit={handleSubmit}>
            <Show when={mode()==='register'}>
              <div class="form-group"><label class="form-label">EMAIL</label><input type="email" class="form-input" placeholder="your@email.com" value={email()} onInput={e=>setEmail(e.target.value)} required/></div>
            </Show>
            <div class="form-group"><label class="form-label">USERNAME</label><input type="text" class="form-input" placeholder="Enter username" value={username()} onInput={e=>setUsername(e.target.value)} required/></div>
            <div class="form-group"><label class="form-label">PASSWORD</label><input type="password" class="form-input" placeholder="Enter password" value={password()} onInput={e=>setPassword(e.target.value)} required/></div>
            <button type="submit" class="btn-submit" disabled={authLoading()}>{authLoading()?'LOADING...':(mode()==='login'?'> LOGIN':'> CREATE')}</button>
          </form>
        </div>
      </div>
    </>
  );
}
