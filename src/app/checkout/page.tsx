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
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qrph'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feeConfig = {
    qrph: { rate: 0.0134, fixed: 0 },
    gcash: { rate: 0.0223, fixed: 0 },
    maya: { rate: 0.0179, fixed: 0 },
    grabpay: { rate: 0.0196, fixed: 0 },
    card: { rate: 0.03125, fixed: 13.39 },
  } as const;

  const roundToCents = (value: number) => Math.round(value * 100) / 100;

  const computeFee = (base: number, method: 'cod' | 'qrph') => {
    if (method === 'cod') return 0;
    const config = feeConfig.qrph;
    const gross = (base + config.fixed) / (1 - config.rate);
    return roundToCents(gross - base);
  };

  const transactionFee = computeFee(cartTotal, paymentMethod);
  const totalWithFee = roundToCents(cartTotal + transactionFee);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const selectedPayment = (data.get('paymentMethod') as 'cod' | 'qrph') || 'cod';
    const payload = {
      customerName: data.get('name') as string,
      customerEmail: data.get('email') as string,
      customerAddress: data.get('address') as string,
      customerContact: data.get('contact') as string,
      paymentMethod: selectedPayment,
      transactionType: data.get('transactionType') as string || 'DELIVERY',
      items: items.map(i => ({ menuItemId: i.id, quantity: i.quantity, priceAtPurchase: i.price })),
    };
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) {
      const errorData = await res.json();
      const detailStr = errorData.details ? ` [${errorData.details}]` : '';
      const metaStr = errorData.meta ? ` (${JSON.stringify(errorData.meta)})` : '';
      alert(`Something went wrong: ${errorData.error || 'Unknown error'}${detailStr}${metaStr}`);
      setIsSubmitting(false);
      return;
    }

    const order = await res.json();
    addRecentOrder(order.id);

    if (selectedPayment === 'qrph') {
      const checkoutRes = await fetch('/api/paymongo/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          totalAmount: totalWithFee,
          paymentFee: transactionFee,
          paymentMethod: selectedPayment,
          customerName: payload.customerName,
          customerContact: payload.customerContact,
        }),
      });

      const checkout = await checkoutRes.json();
      if (!checkoutRes.ok) {
        const detail = checkout?.error ? ` (${checkout.error})` : '';
        alert(`Online checkout failed${detail}. Please try again or choose Cash on Delivery.`);
        setIsSubmitting(false);
        return;
      }

      if (checkout?.checkoutUrl) {
        clearCart();
        window.location.href = checkout.checkoutUrl as string;
        return;
      }
    }

    clearCart();
    setOrderId(order.id);
  };

  if (orderId) {
    return (
      <main className={styles.main}>
        <div className={styles.success}>
          <div className={styles.successIcon}>✨</div>
          <h1>Order Placed!</h1>
          <p>Thank you for choosing <strong>Cravings Ko</strong>. Your order is being prepared with love.</p>
          <p className={styles.adminNote}>Please stay tuned! Our admin will call you shortly to confirm your delivery details.</p>
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
            {paymentMethod === 'qrph' && (
              <>
                <div className={styles.feeRow}>
                  <span>Transaction Fee</span>
                  <span className={styles.money}>{formatPeso(transactionFee)}</span>
                </div>
                <div className={styles.total}>
                  <span>Total to Pay</span>
                  <span className={styles.totalAmount}>{formatPeso(totalWithFee)}</span>
                </div>
              </>
            )}
          </div>

          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Your Details</h2>
            <label>Full Name
              <input name="name" type="text" required placeholder="e.g. Maria Santos" />
            </label>
            <label>Email Address
              <input name="email" type="email" required placeholder="e.g. maria@example.com" />
            </label>
            <label>Address
              <textarea name="address" required placeholder="123 Café Street, Old Town" rows={3} />
            </label>
            <label>Contact Number
              <input name="contact" type="tel" required placeholder="e.g. 09XX-XXX-XXXX" />
            </label>
            <div className={styles.paymentSection}>
              <h2>Payment Method</h2>
              <div className={styles.paymentOptions}>
                <label className={styles.paymentOption}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className={styles.paymentCard}>
                    <strong>Cash on Delivery</strong>
                    <span>Pay when your order arrives.</span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className={`${styles.paymentDetails} ${styles.paymentDetailsInline}`}>
                      <div className={styles.paymentRow}>
                        <span>Total to Pay:</span>
                        <strong className={styles.money}>{formatPeso(cartTotal)}</strong>
                      </div>
                      <p className={styles.paymentHint}>
                        Pay the exact total amount upon delivery.
                      </p>
                      <div className={styles.transactionMode}>
                        <span>Mode of Transaction:</span>
                        <div className={styles.transactionOptions}>
                          <label>
                            <input type="radio" name="transactionType" value="DELIVERY" defaultChecked /> Delivery
                          </label>
                          <label>
                            <input type="radio" name="transactionType" value="PICKUP" /> Pick up
                          </label>
                          <label>
                            <input type="radio" name="transactionType" value="MEETUP" /> Meet up
                          </label>
                        </div>
                        <p className={styles.adminNoteInFlow}>Note: Our admin will contact you to confirm your delivery details.</p>
                      </div>
                    </div>
                  )}
                </label>
                <label className={styles.paymentOption}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qrph"
                    checked={paymentMethod === 'qrph'}
                    onChange={() => setPaymentMethod('qrph')}
                  />
                  <div className={styles.paymentCard}>
                    <strong>QR Ph</strong>
                    <span>Redirects to PayMongo with the exact amount.</span>
                  </div>
                  {paymentMethod === 'qrph' && (
                    <div className={`${styles.paymentDetails} ${styles.paymentDetailsInline}`}>
                      <div className={styles.paymentRow}>
                        <span>Amount:</span>
                        <strong className={styles.money}>{formatPeso(cartTotal)}</strong>
                      </div>
                      <div className={styles.paymentRow}>
                        <span>Transaction Fee:</span>
                        <strong className={styles.money}>{formatPeso(transactionFee)}</strong>
                      </div>
                      <div className={styles.paymentRow}>
                        <span>Total to Pay:</span>
                        <strong className={styles.money}>{formatPeso(totalWithFee)}</strong>
                      </div>
                      <p className={styles.paymentHint}>
                        You'll be redirected to PayMongo to scan and pay.
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <button type="submit" className={styles.orderBtn} disabled={isSubmitting}>
              {isSubmitting ? ' Placing Order...' : 'Place Order ✓'}
            </button>
          </form>
        </div>
      </div>
    </main> 
  ); 
}
