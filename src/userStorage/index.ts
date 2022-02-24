import {UserSession} from 'models/session';

const USER_LOCALSTORAGE_KEY = 'mainteny_sm_user';

// helper to get user from localstorage
export function getStoredUser(): UserSession | null {
  const storedUser = localStorage.getItem(USER_LOCALSTORAGE_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
}

export function setStoredUser(user: UserSession): void {
  localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_LOCALSTORAGE_KEY);
}
