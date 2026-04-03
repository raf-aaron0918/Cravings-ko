"use client";

export type RecentOrderEntry = {
  id: string;
  savedAt: string;
};

const STORAGE_KEY = 'recent_orders';
const MAX_RECENT_ORDERS = 5;
const EXPIRATION_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getRecentOrders(): RecentOrderEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentOrderEntry[];
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - (EXPIRATION_DAYS * MS_PER_DAY);
    const filtered = parsed.filter(entry => {
      const savedAt = Date.parse(entry.savedAt);
      return Number.isFinite(savedAt) && savedAt >= cutoff;
    });
    if (filtered.length !== parsed.length) {
      saveRecentOrders(filtered);
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveRecentOrders(entries: RecentOrderEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addRecentOrder(id: string) {
  const existing = getRecentOrders().filter(entry => entry.id !== id);
  const next = [{ id, savedAt: new Date().toISOString() }, ...existing].slice(0, MAX_RECENT_ORDERS);
  saveRecentOrders(next);
}

export function removeRecentOrder(id: string) {
  const next = getRecentOrders().filter(entry => entry.id !== id);
  saveRecentOrders(next);
}
