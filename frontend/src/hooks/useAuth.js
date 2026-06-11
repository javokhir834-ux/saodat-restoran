import { useSyncExternalStore } from 'react';
import api from '../api/client';

// Singleton store — barcha komponentlar bir xil user holati ko'radi
let authState = (() => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    return user && token ? { user, token } : { user: null, token: null };
  } catch {
    return { user: null, token: null };
  }
})();

const listeners = new Set();
function notify() { listeners.forEach((fn) => fn()); }
function getSnapshot() { return authState; }
function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function useAuth() {
  const { user, token } = useSyncExternalStore(subscribe, getSnapshot);

  async function kirish(login, parol) {
    const { data } = await api.post('/auth/login', { login, parol });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    authState = { user: data.user, token: data.token };
    notify();
    return data.user;
  }

  function chiqish() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authState = { user: null, token: null };
    notify();
  }

  return { user, token, kirish, chiqish };
}
