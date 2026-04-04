"use client";
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.socialTitle}>Follow Us</span>
        <div className={styles.socialIcons}>
          <a
            href="https://www.facebook.com/people/Cravings-Ko/61579546756036/"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className={styles.socialLink}
          >
            <Image src="/uploads/facebook_icon.png" alt="Facebook" width={20} height={20} />
          </a>
          <a
            href="https://www.instagram.com/cravings_ko"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className={styles.socialLink}
          >
            <Image src="/uploads/instagram_icon.png" alt="Instagram" width={20} height={20} />
          </a>
          <a
            href="https://www.tiktok.com/@cravings_ko?"
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok"
            className={styles.socialLink}
          >
            <Image src="/uploads/tiktok_icon.png" alt="TikTok" width={20} height={20} />
          </a>
        </div>

        <div className={styles.logoWrap}>
          <Image
            src="/uploads/cravingsko_logo.png"
            alt="Cravings Ko"
            width={120}
            height={120}
          />
        </div>

        <h3 className={styles.brand}>Cravings Ko</h3>
        <p className={styles.tagline}>Snacks That Match Every Cravings</p>
        <p className={styles.address}>Blk 12 Lot 64, Ph 2, Spring Town, Bucal, Tanza, Cavite</p>
        <a className={styles.contactLink} href="mailto:cravingsko18@gmail.com">cravingsko18@gmail.com</a>
        <div className={styles.phones}>
          <a href="tel:+639656152690" className={styles.contactLink}>+63 965 615 2690</a>
        </div>

        <div className={styles.accept}>
          <span className={styles.acceptTitle}>We Accept</span>
          <div className={styles.acceptBadges}>
            <span className={styles.acceptBadge}>
              <Image src="/uploads/cash-on-delivery-icon.png" alt="Cash on Delivery" width={26} height={26} />
            </span>
            <span className={styles.acceptBadge}>
              <Image src="/uploads/qr-code-icon.png" alt="QR Payment" width={26} height={26} />
              QR
            </span>
          </div>
        </div>

        <p className={styles.copy}>&copy; {new Date().getFullYear()} Cravings Ko. Made to Match Every Cravings.</p>
      </div>
    </footer>
  );
}
