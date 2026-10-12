import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'bb_user';

// Bridges login/signup to the rest of the app until real Cognito sign-in is wired
// up (the backend doesn't verify token signatures yet - see backend/middleware/auth.js).
// AsyncStorage has no synchronous API, so unlike the web version every call here is async.
export async function getCurrentUser() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCurrentUser(user) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export async function clearCurrentUser() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
