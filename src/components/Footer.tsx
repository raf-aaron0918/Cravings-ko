import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.socialRail}>
        <a
          href="mailto:cravingsko18@gmail.com"
          aria-label="Gmail"
          className={styles.socialLink}
        >
          <Image src="/uploads/gmail.png" alt="Gmail" width={18} height={18} />
        </a>
        <a
          href="tel:+639656152690"
          aria-label="Call Us"
          className={styles.socialLink}
        >
          <Image src="/uploads/telephone.png" alt="Call Us" width={18} height={18} />
        </a>
        <a
          href="https://www.facebook.com/people/Cravings-Ko/61579546756036/"
          target="_blank"
          rel="noreferrer"
          aria-label="Facebook"
          className={styles.socialLink}
        >
          <Image src="/uploads/facebook_icon.png" alt="Facebook" width={18} height={18} />
        </a>
        <a
          href="https://www.tiktok.com/@cravings_ko?"
          target="_blank"
          rel="noreferrer"
          aria-label="TikTok"
          className={styles.socialLink}
        >
          <Image src="/uploads/tiktok_icon.png" alt="TikTok" width={18} height={18} />
        </a>
        <a
          href="https://www.instagram.com/cravings_ko"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className={styles.socialLink}
        >
          <Image src="/uploads/instagram_icon.png" alt="Instagram" width={18} height={18} />
        </a>
      </div>
      <div className={styles.content}>
        <p>&copy; {new Date().getFullYear()} Crave Corner. Handcrafted in the neighborhood.</p>
        <p className={styles.subtext}>A cozy place for warm treats and organic aesthetics.</p>
      </div>
    </footer>
  );
}
