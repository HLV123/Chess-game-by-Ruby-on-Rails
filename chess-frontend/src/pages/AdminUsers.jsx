import { createSignal, onMount, For, Show } from 'solid-js';
import { apiRequest } from '../stores/authStore';
import Icon from '../components/Icon';
import { IconX, IconCheck } from '../utils/icons';

const css = `
.au{padding:32px;max-width:1100px;margin:0 auto;font-family:var(--font-admin);color:var(--admin-text)}
.au h1{font-family:var(--font-admin-head);font-size:1.5rem;font-weight:700;margin-bottom:4px}
.au-sub{font-size:0.85rem;color:var(--admin-muted);margin-bottom:24px}
.au-card{background:var(--admin-card);border:1px solid var(--admin-border);border-radius:12px;overflow:hidden}
.au-bar{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--admin-border);flex-wrap:wrap;gap:10px}
.au-count{font-size:0.8rem;color:var(--admin-muted)}
.au-bar-right{display:flex;gap:8px;align-items:center}
.au-search{padding:8px 14px;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:8px;color:var(--admin-text);font-family:var(--font-admin);font-size:0.85rem;width:220px}
.au-search:focus{outline:none;border-color:var(--admin-accent)}
.au-search::placeholder{color:var(--admin-muted)}
.btn-add{padding:8px 16px;border-radius:8px;background:var(--admin-accent);color:#fff;font-family:var(--font-admin);font-size:0.8rem;font-weight:600;transition:all .15s;border:none}
.btn-add:hover{filter:brightness(1.15);box-shadow:0 4px 12px rgba(99,102,241,0.3)}
.au-table{width:100%;border-collapse:collapse}
.au-table th{padding:12px 16px;font-size:0.7rem;font-weight:600;color:var(--admin-muted);text-transform:uppercase;letter-spacing:0.05em;text-align:left;background:rgba(99,102,241,0.04)}
.au-table td{padding:11px 16px;font-size:0.85rem;color:var(--admin-text);border-bottom:1px solid rgba(99,115,255,0.06)}
.au-table tr:hover td{background:rgba(99,102,241,0.04)}
.u-cell{display:flex;align-items:center;gap:10px}
.u-av{width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,var(--admin-accent),var(--admin-accent2));display:flex;align-items:center;justify-content:center;font-family:var(--font-admin-head);font-weight:700;font-size:0.8rem;color:#fff;flex-shrink:0}
.u-name{font-weight:600}.u-email{font-size:0.75rem;color:var(--admin-muted)}
.role-pill{display:inline-block;padding:3px 10px;border-radius:20px;font-size:0.7rem;font-weight:600}
.role-pill.admin{background:rgba(239,68,68,0.1);color:#ef4444}.role-pill.player{background:rgba(34,197,94,0.1);color:#22c55e}
.rating-wrap{display:flex;align-items:center;gap:8px}
.rating-bar{width:50px;height:4px;background:var(--admin-surface);border-radius:2px;overflow:hidden}
.rating-fill{height:100%;border-radius:2px;background:var(--admin-accent)}
.wr{font-weight:600}.wr.good{color:#22c55e}.wr.mid{color:#eab308}.wr.low{color:#ef4444}
.empty{text-align:center;padding:40px;color:var(--admin-muted)}
/* Action buttons */
.act-btns{display:flex;gap:4px}
.btn-act{padding:5px 10px;border-radius:6px;font-size:0.7rem;font-weight:500;cursor:pointer;transition:all .15s;border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-muted);font-family:var(--font-admin)}
.btn-act:hover{color:var(--admin-text);border-color:rgba(99,102,241,0.3)}
.btn-act.edit:hover{color:var(--admin-accent);border-color:var(--admin-accent)}
.btn-act.del:hover{color:#ef4444;border-color:#ef4444;background:rgba(239,68,68,0.06)}
/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:600;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s}
.modal{background:var(--admin-card);border:1px solid var(--admin-border);border-radius:16px;padding:28px 32px;width:90%;max-width:440px;animation:scaleIn .2s;box-shadow:0 20px 60px rgba(0,0,0,0.4)}
.modal-title{font-family:var(--font-admin-head);font-size:1.1rem;font-weight:700;color:var(--admin-text);margin-bottom:4px}
.modal-desc{font-size:0.8rem;color:var(--admin-muted);margin-bottom:20px}
.modal-close{position:absolute;top:16px;right:16px;background:none;border:none;color:var(--admin-muted);cursor:pointer;padding:4px}
.modal-close:hover{color:var(--admin-text)}
.m-group{margin-bottom:14px}
.m-label{display:block;font-size:0.75rem;font-weight:600;color:var(--admin-muted);margin-bottom:6px}
.m-input{width:100%;padding:10px 14px;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:8px;color:var(--admin-text);font-family:var(--font-admin);font-size:0.9rem}
.m-input:focus{outline:none;border-color:var(--admin-accent);box-shadow:0 0 0 3px rgba(99,102,241,0.12)}
.m-input::placeholder{color:var(--admin-muted)}
.m-row{display:flex;gap:8px}
.m-row .m-group{flex:1}
.modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:20px}
.btn-modal{padding:9px 20px;border-radius:8px;font-family:var(--font-admin);font-size:0.8rem;font-weight:600;transition:all .15s;border:none;cursor:pointer}
.btn-modal.primary{background:var(--admin-accent);color:#fff}
.btn-modal.primary:hover{filter:brightness(1.15)}
.btn-modal.secondary{background:var(--admin-surface);border:1px solid var(--admin-border);color:var(--admin-muted)}
.btn-modal.secondary:hover{color:var(--admin-text);border-color:rgba(99,102,241,0.3)}
.btn-modal.danger{background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2)}
.btn-modal.danger:hover{background:rgba(239,68,68,0.2)}
.toast{position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:8px;font-family:var(--font-admin);font-size:0.8rem;font-weight:500;z-index:700;animation:slideUp .3s;box-shadow:0 8px 24px rgba(0,0,0,0.3)}
.toast.success{background:#22c55e;color:#fff}
.toast.error{background:#ef4444;color:#fff}
`;

export default function AdminUsers() {
  const [users, setUsers] = createSignal([]);
  const [search, setSearch] = createSignal('');
  const [loading, setLoading] = createSignal(true);
  const [editUser, setEditUser] = createSignal(null);
  const [deleteUser, setDeleteUser] = createSignal(null);
  const [showAdd, setShowAdd] = createSignal(false);
  const [toast, setToast] = createSignal(null);
  // Form state
  const [fName, setFName] = createSignal('');
  const [fEmail, setFEmail] = createSignal('');
  const [fPassword, setFPassword] = createSignal('');
  const [fRating, setFRating] = createSignal(1200);
  const [saving, setSaving] = createSignal(false);

  async function loadUsers() {
    try { const d = await apiRequest('/admin/users'); setUsers(d.users || []); } catch {}
    setLoading(false);
  }
  onMount(loadUsers);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = () => {
    const s = search().toLowerCase();
    return s ? users().filter(u => u.username.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)) : users();
  };

  function wrClass(wr) { return wr >= 55 ? 'good' : wr >= 40 ? 'mid' : 'low'; }

  function openEdit(u) {
    setFName(u.username); setFEmail(u.email); setFRating(u.rating || 1200); setFPassword('');
    setEditUser(u);
  }

  function openAdd() {
    setFName(''); setFEmail(''); setFRating(1200); setFPassword('');
    setShowAdd(true);
  }

  async function handleSaveEdit() {
    const u = editUser();
    if (!u) return;
    setSaving(true);
    try {
      const body = { user: { username: fName(), email: fEmail(), rating: parseInt(fRating()) } };
      if (fPassword().length > 0) body.user.password = fPassword();
      await apiRequest(`/admin/users/${u.id}`, { method: 'PUT', body: JSON.stringify(body) });
      showToast(`Updated ${fName()} successfully`);
      setEditUser(null);
      await loadUsers();
    } catch (e) { showToast(e.message || 'Update failed', 'error'); }
    setSaving(false);
  }

  async function handleAdd() {
    if (!fName() || !fEmail() || !fPassword()) return;
    setSaving(true);
    try {
      await apiRequest('/admin/users', { method: 'POST', body: JSON.stringify({ user: { username: fName(), email: fEmail(), password: fPassword(), rating: parseInt(fRating()) } }) });
      showToast(`Created ${fName()} successfully`);
      setShowAdd(false);
      await loadUsers();
    } catch (e) { showToast(e.message || 'Create failed', 'error'); }
    setSaving(false);
  }

  async function handleDelete() {
    const u = deleteUser();
    if (!u) return;
    setSaving(true);
    try {
      await apiRequest(`/admin/users/${u.id}`, { method: 'DELETE' });
      showToast(`Deleted ${u.username}`);
      setDeleteUser(null);
      await loadUsers();
    } catch (e) { showToast(e.message || 'Delete failed', 'error'); }
    setSaving(false);
  }

  return (
    <>
      <style>{css}</style>
      <div class="au">
        <h1>Manage Users</h1>
        <p class="au-sub">View, create, edit, and remove player accounts. Reset passwords and adjust ratings.</p>
        <div class="au-card">
          <div class="au-bar">
            <span class="au-count">{filtered().length} users</span>
            <div class="au-bar-right">
              <input class="au-search" placeholder="Search by name or email..." value={search()} onInput={e => setSearch(e.target.value)} />
              <button class="btn-add" onClick={openAdd}>+ Add User</button>
            </div>
          </div>
          <Show when={!loading()} fallback={<div class="empty">Loading...</div>}>
            <Show when={filtered().length > 0} fallback={<div class="empty">No users found.</div>}>
              <table class="au-table">
                <thead><tr><th>User</th><th>Role</th><th>Games</th><th>Win Rate</th><th>Rating</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  <For each={filtered()}>{u => (
                    <tr>
                      <td><div class="u-cell"><div class="u-av">{u.username?.charAt(0).toUpperCase()}</div><div><div class="u-name">{u.username}</div><div class="u-email">{u.email}</div></div></div></td>
                      <td><span class={`role-pill ${u.role}`}>{u.role}</span></td>
                      <td>{u.games_played || 0}</td>
                      <td><span class={`wr ${wrClass(u.win_rate || 0)}`}>{u.win_rate ? `${u.win_rate}%` : '-'}</span></td>
                      <td><div class="rating-wrap"><span>{u.rating || 1200}</span><div class="rating-bar"><div class="rating-fill" style={{ width: `${Math.min(((u.rating || 1200) / 2400) * 100, 100)}%` }} /></div></div></td>
                      <td style={{ "font-size": "0.8rem", "color": "var(--admin-muted)" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                      <td>
                        <Show when={u.role !== 'admin'}>
                          <div class="act-btns">
                            <button class="btn-act edit" onClick={() => openEdit(u)}>Edit</button>
                            <button class="btn-act del" onClick={() => setDeleteUser(u)}>Delete</button>
                          </div>
                        </Show>
                      </td>
                    </tr>
                  )}</For>
                </tbody>
              </table>
            </Show>
          </Show>
        </div>

        {/* Edit Modal */}
        <Show when={editUser()}>
          <div class="modal-overlay" onClick={() => setEditUser(null)}>
            <div class="modal" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
              <button class="modal-close" onClick={() => setEditUser(null)}><Icon svg={IconX} size="18px" /></button>
              <div class="modal-title">Edit Player</div>
              <div class="modal-desc">Update account details for {editUser()?.username}. Leave password blank to keep unchanged.</div>
              <div class="m-group"><label class="m-label">Username</label><input class="m-input" value={fName()} onInput={e => setFName(e.target.value)} /></div>
              <div class="m-group"><label class="m-label">Email</label><input class="m-input" type="email" value={fEmail()} onInput={e => setFEmail(e.target.value)} /></div>
              <div class="m-row">
                <div class="m-group"><label class="m-label">New Password (optional)</label><input class="m-input" type="password" placeholder="Leave blank to keep" value={fPassword()} onInput={e => setFPassword(e.target.value)} /></div>
                <div class="m-group"><label class="m-label">Rating</label><input class="m-input" type="number" value={fRating()} onInput={e => setFRating(e.target.value)} /></div>
              </div>
              <div class="modal-actions">
                <button class="btn-modal secondary" onClick={() => setEditUser(null)}>Cancel</button>
                <button class="btn-modal primary" onClick={handleSaveEdit} disabled={saving()}>{saving() ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </Show>

        {/* Add Modal */}
        <Show when={showAdd()}>
          <div class="modal-overlay" onClick={() => setShowAdd(false)}>
            <div class="modal" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
              <button class="modal-close" onClick={() => setShowAdd(false)}><Icon svg={IconX} size="18px" /></button>
              <div class="modal-title">Add New Player</div>
              <div class="modal-desc">Create a new player account. They can log in immediately with these credentials.</div>
              <div class="m-group"><label class="m-label">Username</label><input class="m-input" placeholder="e.g. chess_master" value={fName()} onInput={e => setFName(e.target.value)} /></div>
              <div class="m-group"><label class="m-label">Email</label><input class="m-input" type="email" placeholder="user@example.com" value={fEmail()} onInput={e => setFEmail(e.target.value)} /></div>
              <div class="m-row">
                <div class="m-group"><label class="m-label">Password</label><input class="m-input" type="password" placeholder="Min 6 characters" value={fPassword()} onInput={e => setFPassword(e.target.value)} /></div>
                <div class="m-group"><label class="m-label">Initial Rating</label><input class="m-input" type="number" value={fRating()} onInput={e => setFRating(e.target.value)} /></div>
              </div>
              <div class="modal-actions">
                <button class="btn-modal secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button class="btn-modal primary" onClick={handleAdd} disabled={saving()}>{saving() ? 'Creating...' : 'Create Player'}</button>
              </div>
            </div>
          </div>
        </Show>

        {/* Delete Confirm Modal */}
        <Show when={deleteUser()}>
          <div class="modal-overlay" onClick={() => setDeleteUser(null)}>
            <div class="modal" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
              <div class="modal-title">Delete Player</div>
              <div class="modal-desc">Are you sure you want to delete <strong>{deleteUser()?.username}</strong>? This will also remove all their game history. This action cannot be undone.</div>
              <div class="modal-actions">
                <button class="btn-modal secondary" onClick={() => setDeleteUser(null)}>Cancel</button>
                <button class="btn-modal danger" onClick={handleDelete} disabled={saving()}>{saving() ? 'Deleting...' : 'Delete Player'}</button>
              </div>
            </div>
          </div>
        </Show>

        {/* Toast */}
        <Show when={toast()}>
          <div class={`toast ${toast().type}`}>{toast().msg}</div>
        </Show>
      </div>
    </>
  );
}
