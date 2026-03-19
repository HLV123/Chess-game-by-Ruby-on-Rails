import { createSignal } from 'solid-js';

const [currentUser, setCurrentUser] = createSignal(null);
const [authToken, setAuthToken] = createSignal(localStorage.getItem('chess_token') || null);
const [authLoading, setAuthLoading] = createSignal(false);
const [authError, setAuthError] = createSignal(null);

const API_BASE = '/api/v1';

async function apiRequest(path, options = {}) {
  const token = authToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
  } catch (err) {
    throw err;
  }
}

async function login(username, password) {
  setAuthLoading(true);
  setAuthError(null);
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setAuthToken(data.token);
    setCurrentUser(data.user);
    localStorage.setItem('chess_token', data.token);
    return data;
  } catch (err) {
    setAuthError(err.message);
    throw err;
  } finally {
    setAuthLoading(false);
  }
}

async function register(email, username, password) {
  setAuthLoading(true);
  setAuthError(null);
  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
    setAuthToken(data.token);
    setCurrentUser(data.user);
    localStorage.setItem('chess_token', data.token);
    return data;
  } catch (err) {
    setAuthError(err.message);
    throw err;
  } finally {
    setAuthLoading(false);
  }
}

async function fetchCurrentUser() {
  if (!authToken()) return null;
  try {
    const data = await apiRequest('/auth/me');
    setCurrentUser(data.user);
    return data.user;
  } catch {
    logout();
    return null;
  }
}

function logout() {
  setCurrentUser(null);
  setAuthToken(null);
  localStorage.removeItem('chess_token');
}

function isAdmin() {
  const user = currentUser();
  return user && user.role === 'admin';
}

export {
  currentUser, setCurrentUser,
  authToken, authLoading, authError,
  login, register, logout, fetchCurrentUser, isAdmin, apiRequest
};
