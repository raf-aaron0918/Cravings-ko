"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartProvider';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { items } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Hamburger Icon */}
        <button 
          className={styles.hamburger} 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <div className={`${styles.bar} ${isOpen ? styles.barOpen : ''}`} />
          <div className={`${styles.bar} ${isOpen ? styles.barOpen : ''}`} />
          <div className={`${styles.bar} ${isOpen ? styles.barOpen : ''}`} />
        </button>

        <div className={styles.logo}>
          <Link href="/">Cravings Ko</Link>
        </div>

        {/* Modal/Overlay Menu for Mobile */}
        <div className={`${styles.menuOverlay} ${isOpen ? styles.menuVisible : ''}`}>
          <ul className={styles.navLinks}>
            <li><Link href="/" onClick={closeMenu}>Home</Link></li>
            <li><Link href="/menu" onClick={closeMenu}>Menu</Link></li>
            <li><Link href="/about" onClick={closeMenu}>About</Link></li>
            <li><Link href="/contact" onClick={closeMenu}>Contact</Link></li>
            <li className={styles.mobileOnly}><Link href="/order-tracker" onClick={closeMenu}>Track Order</Link></li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Link href="/order-tracker" className={`${styles.trackLink} ${styles.desktopOnly}`}>
            Track Order
          </Link>
          <Link href="/checkout" className={styles.cartLink} aria-label="Cart">
            <Image
              src="/uploads/shopping-cart.png"
              alt="Cart"
              width={22}
              height={22}
              className={styles.cartIcon}
              priority
            />
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}
