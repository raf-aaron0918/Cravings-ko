"use client";
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import styles from './BuyNowButton.module.css';

type MenuItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  outOfStock?: boolean;
};

export default function BuyNowButton({ item }: { item: MenuItem }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleBuyNow = () => {
    if (item.outOfStock) return;
    addToCart({ id: item.id, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl });
    router.push('/checkout');
  };

  return (
    <button type="button" onClick={handleBuyNow} disabled={item.outOfStock} className={`${styles.btn} ${item.outOfStock ? styles.disabled : ''}`}>
      {item.outOfStock ? 'Unavailable' : 'Buy'}
    </button>
  );
}
