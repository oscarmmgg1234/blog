// src/auth/adminAuth.js
let _token = null;
let _expiresAt = 0;

const STORAGE_KEY = "adminAuth"; // sessionStorage only

export function setAdminAuth({ token, expiresAt }) {
  _token = token;
  _expiresAt = Number(expiresAt) || 0;

  // Persist only for this browser session (tab/session), not long-term
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ token: _token, expiresAt: _expiresAt })
  );
}

export function loadAdminAuth() {
  if (_token && Date.now() < _expiresAt) return { token: _token, expiresAt: _expiresAt };

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    _token = parsed.token;
    _expiresAt = Number(parsed.expiresAt) || 0;

    if (!_token || Date.now() >= _expiresAt) {
      clearAdminAuth();
      return null;
    }

    return { token: _token, expiresAt: _expiresAt };
  } catch {
    clearAdminAuth();
    return null;
  }
}

export function getAdminToken() {
  const auth = loadAdminAuth();
  return auth?.token || null;
}

export function isAdminAuthed() {
  const auth = loadAdminAuth();
  return !!auth && Date.now() < auth.expiresAt;
}

export function clearAdminAuth() {
  _token = null;
  _expiresAt = 0;
  sessionStorage.removeItem(STORAGE_KEY);
}
