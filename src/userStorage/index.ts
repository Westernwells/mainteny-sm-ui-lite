import {UserSession} from 'models/session';
import {UserView} from 'models/user';

export const USER_LOCALSTORAGE_KEY = 'mainteny_sm_user';
export const USER_ACCOUNT_LOCALSTORAGE_KEY = 'mainteny_sm_user_account';
const ADMIN_LOCALSTORAGE_KEY = 'mainteny_sm_admin';

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

export function getStoredUserAccount(): UserView | null {
  const storedUser = localStorage.getItem(USER_ACCOUNT_LOCALSTORAGE_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
}

export function setStoredUserAccount(user: UserView): void {
  localStorage.setItem(USER_ACCOUNT_LOCALSTORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUserAccount(): void {
  localStorage.removeItem(USER_ACCOUNT_LOCALSTORAGE_KEY);
}

export function setStoredAdmin(user: UserSession): void {
  localStorage.setItem(ADMIN_LOCALSTORAGE_KEY, JSON.stringify(user));
}

export function getStoredAdmin(): UserSession | null {
  const storedAdmin = localStorage.getItem(ADMIN_LOCALSTORAGE_KEY);
  return storedAdmin ? JSON.parse(storedAdmin) : null;
}

export function clearStoredAdmin(): void {
  localStorage.removeItem(ADMIN_LOCALSTORAGE_KEY);
}
