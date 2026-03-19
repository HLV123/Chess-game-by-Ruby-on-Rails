import { Router, Route, useNavigate } from '@solidjs/router';
import { Show, onMount, createSignal, createEffect } from 'solid-js';
import { fetchCurrentUser, currentUser, authToken, isAdmin } from './stores/authStore';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import PvPPage from './pages/PvPPage';
import AIPage from './pages/AIPage';
import HistoryPage from './pages/HistoryPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminGames from './pages/AdminGames';

const css = `
.app-layout{display:flex;min-height:100vh}
.main-content{flex:1;margin-left:240px;min-height:100vh}
.admin-layout .main-content{margin-left:260px}
@media(max-width:900px){.main-content{margin-left:0;padding-top:56px}}
.page-loader{position:fixed;inset:0;background:var(--bg-deep);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:16px}
.loader-text{font-family:var(--font-pixel);font-size:0.7rem;color:var(--pixel-green);animation:blink 1s step-end infinite}
.loader-bar{width:160px;height:8px;background:var(--bg-tertiary);border:2px solid var(--pixel-green)}
.loader-fill{height:100%;background:var(--pixel-green);animation:loadFill 1.2s linear forwards}
@keyframes loadFill{from{width:0}to{width:100%}}
`;

function UserLayout(props) {
  return <div class="app-layout"><Sidebar /><main class="main-content">{props.children}</main></div>;
}
function AdminLayout(props) {
  return <div class="app-layout admin-layout"><AdminSidebar /><main class="main-content">{props.children}</main></div>;
}

// Guard components — useNavigate inside real component body, redirect via createEffect
function UserGuard(props) {
  const navigate = useNavigate();
  createEffect(() => {
    if (!authToken() || !currentUser()) navigate('/login', { replace: true });
    else if (isAdmin()) navigate('/admin', { replace: true });
  });
  return (
    <Show when={authToken() && currentUser() && !isAdmin()}>
      <UserLayout>{props.children}</UserLayout>
    </Show>
  );
}

function AdminGuard(props) {
  const navigate = useNavigate();
  createEffect(() => {
    if (!authToken() || !currentUser()) navigate('/login', { replace: true });
    else if (!isAdmin()) navigate('/', { replace: true });
  });
  return (
    <Show when={authToken() && currentUser() && isAdmin()}>
      <AdminLayout>{props.children}</AdminLayout>
    </Show>
  );
}

function WithUserGuard(Comp) {
  return (props) => <UserGuard><Comp {...props} /></UserGuard>;
}
function WithAdminGuard(Comp) {
  return (props) => <AdminGuard><Comp {...props} /></AdminGuard>;
}

export default function App() {
  const [loaded, setLoaded] = createSignal(false);

  onMount(async () => {
    if (authToken()) await fetchCurrentUser();
    setTimeout(() => setLoaded(true), 800);
  });

  createEffect(() => {
    if (isAdmin()) document.body.classList.add('admin-theme');
    else document.body.classList.remove('admin-theme');
  });

  return (
    <>
      <style>{css}</style>
      <Show when={!loaded()}>
        <div class="page-loader"><div class="loader-text">LOADING...</div><div class="loader-bar"><div class="loader-fill"/></div></div>
      </Show>
      <Router>
        <Route path="/login" component={AuthPage} />
        <Route path="/" component={WithUserGuard(HomePage)} />
        <Route path="/play/pvp" component={WithUserGuard(PvPPage)} />
        <Route path="/play/ai" component={WithUserGuard(AIPage)} />
        <Route path="/history" component={WithUserGuard(HistoryPage)} />
        <Route path="/admin" component={WithAdminGuard(AdminDashboard)} />
        <Route path="/admin/users" component={WithAdminGuard(AdminUsers)} />
        <Route path="/admin/games" component={WithAdminGuard(AdminGames)} />
        <Route path="*" component={AuthPage} />
      </Router>
    </>
  );
}
