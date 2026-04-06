"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
import OrderReviewForm from '@/components/OrderReviewForm';
import StarRating from '@/components/StarRating';
import { formatPeso } from '@/lib/currency';
import { addRecentOrder, removeRecentOrder } from '@/lib/recentOrders';

type OrderItem = {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  menuItem: { name: string };
};

type OrderWithItems = {
  id: string;
  customerName: string;
  customerAddress: string;
  customerContact: string;
  totalAmount: number;
  status: string;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  paymentReference?: string | null;
  rating: number | null;
  feedback: string | null;
  cancelReason: string | null;
  transactionType: string | null;
  createdAt: string;
  completedAt: string | null;
  items: OrderItem[];
};

const STATUSES = ['PENDING', 'PREPARING', 'READY', 'COMPLETED'];

export default function OrderTrackerPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${id}`);
    if (res.ok) {
      const data = await res.json();
      setOrder(data);
      addRecentOrder(data.id);
    } else if (res.status === 404) {
      setOrder(null);
      removeRecentOrder(String(id));
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) return <div className={styles.loading}>Tracking your order...</div>;
  if (!order) return <div className={styles.error}>Order not found.</div>;

  const statusForSteps = (order.status === 'COD' || order.status === 'PAID') ? 'PENDING' : order.status;
  const currentIndex = STATUSES.indexOf(statusForSteps);
  const isCompleted = order.status === 'COMPLETED';
  const isCancelled = order.status === 'CANCELLED' || order.status === 'EXPIRED';
  const canCancel = order.status === 'PENDING' && order.paymentStatus !== 'PAID';

  const paymentMethodLabel = (() => {
    if (order.paymentMethod === 'COD') return 'COD';
    if (order.paymentMethod === 'QRPH') return 'QRPH';
    return 'Unknown';
  })();

  const handleCancelOrder = async () => {
    const confirmed = window.confirm('Cancel this order? This cannot be undone.');
    if (!confirmed) return;

    setCancelling(true);
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });

    if (res.ok) {
      await fetchOrder();
    } else {
      alert('This order can no longer be cancelled.');
    }

    setCancelling(false);
  };

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.card}>
          <h1 className={styles.title}>Order Tracker</h1>
          <p className={styles.orderId}>Order ID: <span>{order.id}</span></p>

          {!isCancelled && (
            <div className={styles.tracker}>
              {STATUSES.map((status, index) => (
                <div key={status} className={`${styles.step} ${index <= currentIndex ? styles.active : ''}`}>
                  <div className={styles.circle}>{index + 1}</div>
                  <span className={styles.statusLabel}>{status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}

          {isCancelled ? (
            <div className={styles.cancelledBox}>
              <h3>{order.status === 'EXPIRED' ? 'Payment Expired' : 'Order Cancelled'}</h3>
              <p>
                {order.status === 'EXPIRED'
                  ? 'This order expired because the payment was not completed within 30 minutes.'
                  : 'This order has been cancelled and will no longer be prepared.'}
              </p>
              {order.cancelReason && (
                <div className={styles.cancelReason}>
                  <strong>Reason:</strong>
                  <p>{order.cancelReason}</p>
                </div>
              )}
            </div>
          ) : !isCompleted ? (
            <div className={styles.statusMsg}>
              <p className={styles.tip}>We&apos;ll keep you updated as we cook!</p>
              <p className={styles.adminNote}>Our admin will contact you to confirm your delivery/pickup/meetup details.</p>
              {canCancel && (
                <button type="button" className={styles.cancelBtn} onClick={handleCancelOrder} disabled={cancelling}>
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          ) : order.rating ? (
            <div className={styles.thankYou}>
              <h3>Review Submitted!</h3>
              <p>Thank you for your {order.rating}-star review. We hope to serve you again soon!</p>
              <div className={styles.savedRating}>
                <StarRating rating={order.rating} />
              </div>
              {order.feedback && (
                <div className={styles.savedFeedback}>
                  <p>&ldquo;{order.feedback}&rdquo;</p>
                </div>
              )}
            </div>
          ) : (
            <OrderReviewForm orderId={order.id} onComplete={fetchOrder} />
          )}

          <div className={styles.details}>
            <h2>Order Details</h2>
            <div className={styles.items}>
              {order.items.map(item => (
                <div key={item.id} className={styles.item}>
                  <span>{item.quantity}x {item.menuItem.name}</span>
                  <span className={styles.money}>{formatPeso(item.priceAtPurchase * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className={styles.total}>
              <span>Total Amount :</span>
              <span className={styles.money}>{formatPeso(order.totalAmount)}</span>
            </div>
            <div className={styles.total}>
              <span>Payment Method :</span>
              <span>{paymentMethodLabel}</span>
            </div>
            {order.transactionType && (
              <div className={styles.total}>
                <span>Transaction Mode :</span>
                <span>{order.transactionType}</span>
              </div>
            )}
            {order.paymentStatus === 'PAID' && order.paymentReference && (
              <div className={styles.total}>
                <span>Payment Reference</span>
                <span>{order.paymentReference}</span>
              </div>
            )}
          </div>

          <Link href="/" className={styles.homeBtn}>Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
