 "use client";
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';

export default function Footer() {
  const pathname = usePathname();
  const hideSocial = pathname === '/contact';

  return (
    <footer className={styles.footer}>
      {!hideSocial && (
        <div className={styles.socialRail}>
          <span className={styles.socialTitle}>Follow Us</span>
          <div className={styles.socialIcons}>
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
        </div>
      )}
      <div className={styles.content}>
        <p>&copy; {new Date().getFullYear()} Cravings Ko. Made to Match Every Cravings.</p>
      </div>
    </footer>
  );
}
