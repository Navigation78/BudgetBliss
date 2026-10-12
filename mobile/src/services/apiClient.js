import { getCurrentUser } from './auth';

// This environment hook will move to the bare Android config during migration.
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/dev').replace(/\/$/, '');

// The backend doesn't verify Cognito token signatures yet, so a real Amplify
// session token wouldn't gain us anything today. Instead we ride the
// DEV_AUTH_BYPASS path middleware/auth.js already supports (`Bearer dev:<userId>`).
// Swap this for a real Cognito ID token once the backend verifies signatures.
async function authHeader() {
  const user = await getCurrentUser();
  return user?.userId ? { Authorization: `Bearer dev:${user.userId}` } : {};
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(await authHeader()),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    // backend/middleware/errorHandler.js returns { error: { name, message, ... } };
    // some handlers (e.g. Forbidden checks) return a flat { error: 'string' } instead.
    const message =
      (typeof data?.error === 'string' ? data.error : data?.error?.message) ||
      data?.message ||
      res.statusText ||
      'Request failed';
    throw new Error(message);
  }

  return data;
}

export const apiGet = (path) => request(path);
export const apiPost = (path, body) => request(path, { method: 'POST', body });
export const apiPut = (path, body) => request(path, { method: 'PUT', body });
export const apiDelete = (path) => request(path, { method: 'DELETE' });

export { API_BASE_URL };
