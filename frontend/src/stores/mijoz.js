import { useSyncExternalStore } from 'react';
import api from '../api/client';

// Mijoz hisobi — xodim (admin/kassir) tokenidan ALOHIDA saqlanadi
const TOKEN_KEY = 'mijoz_token';
const MIJOZ_KEY = 'mijoz';

let holat = (() => {
  try {
    const mijoz = JSON.parse(localStorage.getItem(MIJOZ_KEY));
    const token = localStorage.getItem(TOKEN_KEY);
    return mijoz && token ? { mijoz, token } : { mijoz: null, token: null };
  } catch {
    return { mijoz: null, token: null };
  }
})();

const listeners = new Set();
function notify() { listeners.forEach((fn) => fn()); }
function getSnapshot() { return holat; }
function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function saqla(token, mijoz) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(MIJOZ_KEY, JSON.stringify(mijoz));
  holat = { token, mijoz };
  notify();
}

export function useMijoz() {
  const { mijoz, token } = useSyncExternalStore(subscribe, getSnapshot);

  // 1-bosqich: ma'lumotlarni yuborib emailga kod oldiramiz
  async function kodYubor(forma) {
    const { data } = await api.post('/mijoz/kod-yubor', forma);
    return data; // { email, yuborildi, devKod? }
  }

  // Kodni qayta yuborish
  async function kodQayta(email) {
    const { data } = await api.post('/mijoz/kod-qayta', { email });
    return data;
  }

  // 2-bosqich: kodni tasdiqlab hisobni faollashtiramiz
  async function tasdiqla(email, kod) {
    const { data } = await api.post('/mijoz/tasdiqla', { email, kod });
    saqla(data.token, data.mijoz);
    return data.mijoz;
  }

  async function kirish(login, parol) {
    const { data } = await api.post('/mijoz/kirish', { login, parol });
    saqla(data.token, data.mijoz);
    return data.mijoz;
  }

  function chiqish() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MIJOZ_KEY);
    holat = { token: null, mijoz: null };
    notify();
  }

  // Server'dan eng so'nggi profil (ballar yangilangan bo'lishi mumkin)
  async function yangila() {
    if (!holat.token) return null;
    try {
      const { data } = await api.get('/mijoz/men');
      localStorage.setItem(MIJOZ_KEY, JSON.stringify(data));
      holat = { ...holat, mijoz: data };
      notify();
      return data;
    } catch {
      return null;
    }
  }

  return { mijoz, token, kodYubor, kodQayta, tasdiqla, kirish, chiqish, yangila };
}

// Token'ni store tashqarisidan olish — api client uchun
export function mijozTokenOl() {
  return localStorage.getItem(TOKEN_KEY);
}
