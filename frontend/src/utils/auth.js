const STORAGE_KEY = 'bb_user';

// Bridges login/signup to the rest of the app until real Cognito sign-in is wired
// up (the backend doesn't verify token signatures yet - see backend/middleware/auth.js).
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEY);
}
