import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'saodat_savat';

let savatItems = (() => {
  try {
    const saqlangan = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saqlangan) ? saqlangan : [];
  } catch {
    return [];
  }
})();

const listeners = new Set();

// localStorage'ga faqat zaruriy maydonlarni saqlaymiz
const SAQLASH_MAYDONLARI = ['id', 'nom', 'narx', 'birlik', 'qadam', 'miqdori'];
function itemniSaqlash(item) {
  return Object.fromEntries(SAQLASH_MAYDONLARI.map((k) => [k, item[k]]));
}

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savatItems.map(itemniSaqlash)));
  } catch {
    // localStorage to'lgan yoki o'chirilgan — savat xotirada davom etadi
  }
  listeners.forEach((fn) => fn());
}

function getSnapshot() {
  return savatItems;
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot);

  function qosh(mahsulot, miqdor = 1) {
    const mavjud = savatItems.find((i) => i.id === mahsulot.id);
    if (mavjud) {
      savatItems = savatItems.map((i) =>
        i.id === mahsulot.id ? { ...i, miqdori: i.miqdori + miqdor } : i
      );
    } else {
      savatItems = [...savatItems, { ...mahsulot, miqdori: miqdor }];
    }
    notify();
  }

  function olChiqar(id) {
    savatItems = savatItems.filter((i) => i.id !== id);
    notify();
  }

  function miqdorOzgartir(id, miqdor) {
    if (miqdor <= 0) {
      savatItems = savatItems.filter((i) => i.id !== id);
    } else {
      savatItems = savatItems.map((i) => (i.id === id ? { ...i, miqdori: miqdor } : i));
    }
    notify();
  }

  function tozala() {
    savatItems = [];
    notify();
  }

  const jami = items.reduce((s, i) => s + i.narx * i.miqdori, 0);
  const soni = items.reduce((s, i) => s + i.miqdori, 0);

  return { items, qosh, olChiqar, miqdorOzgartir, tozala, jami, soni };
}
