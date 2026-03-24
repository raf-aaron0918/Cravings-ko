"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
import { getRecentOrders, removeRecentOrder } from '@/lib/recentOrders';

type RecentTrackedOrder = {
  id: string;
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    menuItem: {
      name: string;
    };
  }>;
};

export default function OrderSearchPage() {
  const [orderId, setOrderId] = useState('');
  const [recentOrders, setRecentOrders] = useState<RecentTrackedOrder[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const router = useRouter();

  const isToday = (value: string) => {
    const date = new Date(value);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  useEffect(() => {
    let active = true;

    const loadRecentOrders = async () => {
      const saved = getRecentOrders();
      if (saved.length === 0) {
        if (active) setLoadingRecent(false);
        return;
      }

      const results = await Promise.all(
        saved.map(async entry => {
          const res = await fetch(`/api/orders/${entry.id}`);
          if (!res.ok) {
            if (res.status === 404) removeRecentOrder(entry.id);
            return null;
          }

          const order = await res.json();
          return {
            id: order.id as string,
            status: order.status as string,
            createdAt: order.createdAt as string,
            items: order.items as RecentTrackedOrder['items'],
          };
        })
      );

      if (!active) return;
      setRecentOrders(results.filter((order): order is RecentTrackedOrder => order !== null));
      setLoadingRecent(false);
    };

    void loadRecentOrders();

    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      router.push(`/order-tracker/${orderId.trim()}`);
    }
  };

  const todayOrders = recentOrders.filter(order => isToday(order.createdAt));
  const recentOnlyOrders = recentOrders.filter(order => !isToday(order.createdAt));

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.card}>
          <h1 className={styles.title}>Track Your Order</h1>
          <p className={styles.subtitle}>Enter your Order ID to see its current progress.</p>
          
          <form onSubmit={handleSearch} className={styles.form}>
            <input 
              type="text" 
              placeholder="e.g. cmmvx..." 
              value={orderId} 
              onChange={(e) => setOrderId(e.target.value)}
              required
              className={styles.input}
            />
            <button type="submit" className={styles.searchBtn}>Track Progress</button>
          </form>

          <p className={styles.hint}>You can find the ID in your order confirmation screen.</p>

          {!loadingRecent && recentOrders.length > 0 && (
            <div className={styles.recentSection}>
              <h2 className={styles.recentTitle}>Recent Orders on This Device</h2>
              {todayOrders.length > 0 && (
                <div className={styles.recentGroup}>
                  <h3 className={styles.groupTitle}>Today</h3>
                  <div className={styles.recentList}>
                    {todayOrders.map(order => (
                      <button
                        key={order.id}
                        type="button"
                        className={styles.recentCard}
                        onClick={() => router.push(`/order-tracker/${order.id}`)}
                      >
                        <span className={styles.recentId}>#{order.id.slice(-6)}</span>
                        <span className={styles.recentMeta}>{order.status}</span>
                        <span className={styles.recentItems}>
                          <strong>Items:</strong>{' '}
                          {order.items && order.items.length > 0
                            ? order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join(', ')
                            : 'No items found'}
                        </span>
                        <span className={styles.recentMeta}>
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {recentOnlyOrders.length > 0 && (
                <div className={styles.recentGroup}>
                  <h3 className={styles.groupTitle}>Recently</h3>
                  <div className={styles.recentList}>
                    {recentOnlyOrders.map(order => (
                      <button
                        key={order.id}
                        type="button"
                        className={styles.recentCard}
                        onClick={() => router.push(`/order-tracker/${order.id}`)}
                      >
                        <span className={styles.recentId}>#{order.id.slice(-6)}</span>
                        <span className={styles.recentMeta}>{order.status}</span>
                        <span className={styles.recentItems}>
                          <strong>Items:</strong>{' '}
                          {order.items && order.items.length > 0
                            ? order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join(', ')
                            : 'No items found'}
                        </span>
                        <span className={styles.recentMeta}>
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className={styles.links}>
            <Link href="/" className={styles.backBtn}>Back to Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
