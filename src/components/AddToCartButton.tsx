"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useCart } from './CartProvider';
import styles from './AddToCartButton.module.css';

type MenuItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  outOfStock?: boolean;
};

export default function AddToCartButton({ item }: { item: MenuItem }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (item.outOfStock) return;
    addToCart({ id: item.id, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button onClick={handleAdd} disabled={item.outOfStock} className={`${styles.btn} ${added ? styles.added : ''} ${item.outOfStock ? styles.disabled : ''}`}>
      <Image
        src="/uploads/shopping-cart-add.png"
        alt="Add to cart"
        width={16}
        height={16}
        className={styles.icon}
      />
      {item.outOfStock ? 'Unavailable' : added ? 'Added' : 'Add to Cart'}
    </button>
  );
}
