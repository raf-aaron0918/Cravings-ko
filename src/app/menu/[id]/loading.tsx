"use client";
import styles from './loading.module.css';

export default function Loading() {
  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} aria-hidden="true" />
          <p className={styles.loadingText}>Loading product details...</p>
        </div>
      </div>
    </main>
  );
}
