"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
import { formatPeso } from '@/lib/currency';
import { useCallback } from 'react';

type OrderItem = {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  menuItem: { name: string } | null;
};

type Order = {
  id: string;
  customerName: string;
  customerAddress: string;
  customerContact: string;
  totalAmount: number;
  status: string;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  rating: number | null;
  feedback: string | null;
  cancelReason: string | null;
  transactionType: string | null;
  createdAt: string;
  items: OrderItem[];
};

const STATUSES = ['PENDING', 'PREPARING', 'READY', 'COMPLETED'];

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showSales, setShowSales] = useState(false);
  const [salesRange, setSalesRange] = useState<'today' | 'week' | 'month'>('today');
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/orders');
    if (res.ok) {
      setOrders(await res.json());
      setLoading(false);
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    const load = async () => {
      await fetchOrders();
    };

    void load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const openCancelModal = (order: Order) => {
    setCancelTarget(order);
    setCancelReasonInput('');
  };

  const closeCancelModal = () => {
    setCancelTarget(null);
    setCancelReasonInput('');
    setCancellingOrder(false);
  };

  const handleCancelOrder = async () => {
    if (!cancelTarget || !cancelReasonInput.trim()) return;

    setCancellingOrder(true);
    const res = await fetch(`/api/orders/${cancelTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED', cancelReason: cancelReasonInput.trim() }),
    });

    if (res.ok) {
      setOrders(prev => prev.map(order => (
        order.id === cancelTarget.id
          ? { ...order, status: 'CANCELLED', cancelReason: cancelReasonInput.trim() }
          : order
      )));
      setShowCompleted(true);
      closeCancelModal();
    } else {
      alert('Unable to cancel this order.');
      setCancellingOrder(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading Dashboard...</div>;

  const pendingOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.status !== 'EXPIRED');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED' || o.status === 'EXPIRED');

  const rangeStart = (() => {
    const now = new Date();
    if (salesRange === 'today') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    if (salesRange === 'week') {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  })();

  const salesByProduct = completedOrders
    .filter(o => new Date(o.createdAt) >= rangeStart)
    .reduce<Record<string, { name: string; qty: number; revenue: number; lastSold: string }>>((acc, order) => {
      order.items.forEach(item => {
        const key = item.menuItem?.name || 'Deleted Item';
        const existing = acc[key] || { name: key, qty: 0, revenue: 0, lastSold: order.createdAt };
        const newQty = existing.qty + item.quantity;
        const newRevenue = existing.revenue + item.quantity * item.priceAtPurchase;
        const lastSold = new Date(order.createdAt) > new Date(existing.lastSold) ? order.createdAt : existing.lastSold;
        acc[key] = { name: key, qty: newQty, revenue: newRevenue, lastSold };
      });
      return acc;
    }, {});

  const salesRows = Object.values(salesByProduct).sort((a, b) => b.revenue - a.revenue);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <div className={styles.nav}>
          <Link href="/admin/menu" className={styles.navBtn}>Manage Menu</Link>
          <button className={styles.navBtnOutline} onClick={() => setShowSales(prev => !prev)}>
            {showSales ? 'Hide Sales' : 'Sales'}
          </button>
          <button onClick={() => { document.cookie = 'admin_auth=; Max-Age=0; path=/'; router.push('/admin/login'); }} className={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span>Active Orders</span>
          <strong>{pendingOrders.length}</strong>
        </div>
        <div className={styles.statCard}>
          <span>Ready</span>
          <strong>{orders.filter(o => o.status === 'READY').length}</strong>
        </div>
        <div className={styles.statCard}>
          <span>Completed</span>
          <strong>{completedOrders.length}</strong>
        </div>
      </div>

      {showSales && (
        <section className={styles.section}>
          <div className={styles.salesHeader}>
            <h2 className={styles.sectionTitle}>Sales</h2>
            <div className={styles.rangeChips}>
              {(['today', 'week', 'month'] as const).map(range => (
                <button
                  key={range}
                  className={`${styles.rangeChip} ${salesRange === range ? styles.rangeChipActive : ''}`}
                  onClick={() => setSalesRange(range)}
                >
                  {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.salesTable}>
            <div className={styles.salesHeaderRow}>
              <span>Product</span>
              <span>Sold</span>
              <span>Revenue</span>
              <span>Last Sold</span>
            </div>
            {salesRows.length === 0 && <p className={styles.empty}>No sales yet in this range.</p>}
            {salesRows.map(row => (
              <div key={row.name} className={styles.salesRow}>
                <span className={styles.salesName}>{row.name}</span>
                <span>{row.qty}</span>
                <span>{formatPeso(row.revenue)}</span>
                <span>{new Date(row.lastSold).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={`${styles.sectionTitle} ${styles.activeOrdersTitle}`}>
          Active Orders <span className={styles.sectionCount}>({pendingOrders.length})</span>
        </h2>
        <div className={styles.orderList}>
          {pendingOrders.map(order => (
            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} onCancel={openCancelModal} />
          ))}
          {pendingOrders.length === 0 && <p className={styles.empty}>No active orders.</p>}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.collapsibleHeader} onClick={() => setShowCompleted(!showCompleted)}>
          <h2 className={styles.sectionTitle}>
            Completed / Cancelled <span className={styles.sectionCount}>({completedOrders.length})</span>
          </h2>
          <span className={styles.toggleIcon}>{showCompleted ? '−' : '+'}</span>
        </div>

        {showCompleted && (
          <div className={styles.orderList}>
            {completedOrders.map(order => (
              <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} onCancel={openCancelModal} />
            ))}
            {completedOrders.length === 0 && <p className={styles.empty}>No completed orders yet.</p>}
          </div>
        )}
      </section>

      {cancelTarget && (
        <div className={styles.modalBackdrop} onClick={closeCancelModal}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Cancel Order #{cancelTarget.id.slice(-6)}</h3>
            <p className={styles.modalText}>Add a cancellation reason. This will be shown on the customer tracker.</p>
            <textarea
              className={styles.modalTextarea}
              rows={4}
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              placeholder="Reason for cancellation"
            />
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalSecondaryBtn} onClick={closeCancelModal}>
                Back
              </button>
              <button
                type="button"
                className={styles.modalDangerBtn}
                onClick={handleCancelOrder}
                disabled={!cancelReasonInput.trim() || cancellingOrder}
              >
                {cancellingOrder ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
             </div>
          </div>
        </div>
      )}
    </main>
  );
}

import StarRating from '@/components/StarRating';

function OrderCard({ order, onStatusChange, onCancel }: { order: Order, onStatusChange: (id: string, s: string) => void, onCancel: (order: Order) => void }) {
  const isCompleted = order.status === 'COMPLETED' || order.status === 'CANCELLED' || order.status === 'EXPIRED';
  const paymentMethod = order.paymentMethod
    ?? (order.status === 'COD'
      ? 'COD'
      : order.status === 'PAID' || order.status === 'COMPLETED'
        ? 'QRPH'
        : null);
  const paymentStatus = order.paymentStatus
    ?? (paymentMethod === 'QRPH'
      ? order.status === 'PENDING'
        ? 'UNPAID'
        : order.status === 'PAID' || order.status === 'COMPLETED'
          ? 'PAID'
          : null
      : null);
  const isPaymentLocked = paymentMethod === 'QRPH' && paymentStatus === 'UNPAID';
  const isPaidQr = paymentMethod === 'QRPH' && paymentStatus === 'PAID';
  const isUnpaidQr = paymentMethod === 'QRPH' && paymentStatus === 'UNPAID';
  const isCod = paymentMethod === 'COD';
  const statusLabel = isUnpaidQr
    ? 'UNPAID (QR)'
    : order.status === 'EXPIRED' && paymentMethod === 'QRPH'
      ? 'EXPIRED (QR)'
      : order.status;

  return (
    <div className={`${styles.orderCard} handcrafted-border`}>
      <div className={styles.orderHeader}>
        <div>
          <h3>Order #{order.id.slice(-6)}</h3>
          <p className={styles.date}>{new Date(order.createdAt).toLocaleString()}</p>
        </div>
          <div className={styles.statusControl}>
          <label>Status:</label>
          <div className={styles.statusRow}>
            {isPaidQr && <span className={styles.paymentBadge}>Paid (QR)</span>}
            {isCod && <span className={`${styles.paymentBadge} ${styles.codBadge}`}>COD</span>}
            {isUnpaidQr && <span className={`${styles.paymentBadge} ${styles.unpaidBadge}`}>Unpaid (QR)</span>}
            {isCompleted || isPaymentLocked ? (
              <span
                className={`${styles.statusPill} ${
                  order.status === 'EXPIRED' || order.status === 'CANCELLED'
                    ? styles.statusPillExpired
                    : order.status === 'COMPLETED'
                      ? styles.statusPillCompleted
                      : ''
                }`}
              >
                {statusLabel}
              </span>
            ) : (
              <select
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
                className={styles.statusSelect}
              >
                {STATUSES.filter(s => s !== 'COMPLETED').concat('COMPLETED').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className={styles.customerInfo}>
        <p><strong>Customer:</strong> {order.customerName}</p>
        <p><strong>Contact:</strong> {order.customerContact}</p>
        <p><strong>Address:</strong> {order.customerAddress}</p>
        {order.transactionType && (
          <p><strong>Mode:</strong> <span className={styles.transactionBadge}>{order.transactionType}</span></p>
        )}
      </div>

      <div className={styles.items}>
        {order.items.map(item => (
          <div key={item.id} className={styles.item}>
            <span>{item.quantity}x {item.menuItem?.name || 'Deleted Item'}</span>
            <span>{formatPeso(item.priceAtPurchase * item.quantity)}</span>
          </div>
        ))}
      </div>

      {order.rating && (
        <div className={styles.adminReview}>
          <div className={styles.adminRating}>
            <StarRating rating={order.rating} />
            <span className={styles.ratingValue}>{order.rating}/5</span>
          </div>
          {order.feedback && <p className={styles.adminFeedback}>&ldquo;{order.feedback}&rdquo;</p>}
        </div>
      )}

      {order.status === 'CANCELLED' && order.cancelReason && (
        <div className={styles.cancelReasonBox}>
          <strong>Cancellation Reason:</strong>
          <p>{order.cancelReason}</p>
        </div>
      )}

      <div className={styles.orderFooter}>
        <span className={styles.total}>Total: {formatPeso(order.totalAmount)}</span>
        <div className={styles.orderActions}>
          {!isCompleted && (
            <button type="button" className={styles.cancelOrderBtn} onClick={() => onCancel(order)}>
              Cancel Order
            </button>
          )}
          <Link href={`/order-tracker/${order.id}`} target="_blank" className={styles.trackLink}>View Tracker</Link>
        </div>
      </div>
    </div>
  );
}
