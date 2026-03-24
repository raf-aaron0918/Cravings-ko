"use client";

export type RecentOrderEntry = {
  id: string;
  savedAt: string;
};

const STORAGE_KEY = 'recent_orders';
const MAX_RECENT_ORDERS = 5;

export function getRecentOrders(): RecentOrderEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentOrderEntry[];
    return Array.isArray(parsed) ? parsed : [];
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
