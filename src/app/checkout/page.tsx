"use client";
import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import Link from 'next/link';
import styles from './page.module.css';
import { formatPeso } from '@/lib/currency';
import { addRecentOrder } from '@/lib/recentOrders';

export default function CheckoutPage() {
  const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  const [orderId, setOrderId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      customerName: data.get('name') as string,
      customerAddress: data.get('address') as string,
      customerContact: data.get('contact') as string,
      items: items.map(i => ({ menuItemId: i.id, quantity: i.quantity, priceAtPurchase: i.price })),
    };
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      const order = await res.json();
      addRecentOrder(order.id);
      setOrderId(order.id);
      clearCart();
    } else {
      alert('Something went wrong. Please try again.');
    }
  };

  if (orderId) {
    return (
      <main className={styles.main}>
        <div className={styles.success}>
          <div className={styles.successIcon}>✨</div>
          <h1>Order Placed!</h1>
          <p>Thank you for dining with Crave Corner. Your order is being prepared with love.</p>
          <div className={styles.orderIdBox}>
            <span>Tracking Number:</span>
            <strong className={styles.idText}>{orderId}</strong>
            <p className={styles.copyHint}>Save this ID to track your order later!</p>
          </div>
          <div className={styles.successActions}>
            <Link href={`/order-tracker/${orderId}`} className={styles.trackBtn}>Track Your Order</Link>
            <Link href="/" className={styles.backHomeBtn}>Back to Home</Link>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className={styles.main}>
        <div className={styles.emptyCart}>
          <h1>Your Cart</h1>
          <p>Nothing here yet. Head to the <Link href="/menu">menu</Link> to add some delicious items!</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className="container">
        <h1 className={styles.title}>Checkout</h1>
        <div className={styles.layout}>
          {/* Order Summary */}
          <div className={styles.summary}>
            <h2>Order Summary</h2>
            {items.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <div className={styles.qtyControls}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <div className={styles.itemRight}>
                  <span className={styles.itemPrice}>{formatPeso(item.price * item.quantity)}</span>
                  <button onClick={() => removeFromCart(item.id)} className={styles.removeBtn}>✕</button>
                </div>
              </div>
            ))}
            <div className={styles.total}>
              <span>Total</span>
              <span className={styles.totalAmount}>{formatPeso(cartTotal)}</span>
            </div>
          </div>

          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Your Details</h2>
            <label>Full Name
              <input name="name" type="text" required placeholder="e.g. Maria Santos" />
            </label>
            <label>Address
              <textarea name="address" required placeholder="123 Café Street, Old Town" rows={3} />
            </label>
            <label>Contact Number
              <input name="contact" type="tel" required placeholder="e.g. 09XX-XXX-XXXX" />
            </label>
            <button type="submit" className={styles.orderBtn}>Place Order ✓</button>
          </form>
        </div>
      </div>
    </main>
  );
}
