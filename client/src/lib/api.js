/**
 * One API surface for the whole portal.
 *
 * When VITE_API_URL points at a running Express server the client talks HTTP.
 * Otherwise it falls back to Demo Mode, which answers the identical routes from
 * a dataset generated in the browser — so every page is written only once.
 */
const configured = (import.meta.env.VITE_API_URL || '').trim();

export const API_URL = configured;
export const isDemoMode = configured === '';

const TOKEN_KEY = 'ecampus.token';

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable (private window) — the session simply won't persist */
    }
  },
};

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let demoRequest;
async function loadDemo() {
  if (!demoRequest) ({ demoRequest } = await import('../data/demoRouter.js'));
  return demoRequest;
}

/** Demo Mode simulates a little latency so loading states are exercised. */
const settle = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export async function request(path, { method = 'GET', body, signal } = {}) {
  const token = tokenStore.get();

  if (isDemoMode) {
    const run = await loadDemo();
    await settle(method === 'GET' ? 180 : 420);
    try {
      return await run(path, { method, body, token });
    } catch (err) {
      throw new ApiError(err.status || 500, err.message);
    }
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the portal server. Check your connection and try again.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) tokenStore.set(null);
    throw new ApiError(response.status, payload.message || 'Request failed', payload.details);
  }
  return payload;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

/** Demo credentials surfaced on the login screen. */
export const DEMO_ACCOUNTS = [
  { role: 'student', label: 'Student', name: 'Aarav Pradhan', detail: 'B.Tech CSE · Semester 5', email: 'aarav.pradhan2023@smit.smu.edu.in' },
  { role: 'faculty', label: 'Faculty', name: 'Dr. Prasanta Rai', detail: 'Associate Professor · CSE', email: 'prasanta.rai@smit.smu.edu.in' },
  { role: 'admin', label: 'Administrator', name: 'Dr. Rajesh Kumar Verma', detail: 'Registrar · Administration', email: 'registrar@smit.smu.edu.in' },
];

export const DEMO_PASSWORD = 'Portal@123';
