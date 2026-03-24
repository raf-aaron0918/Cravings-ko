import Image from 'next/image';
import styles from './page.module.css';

export const metadata = {
  title: 'Contact | Crave Corner',
  description: 'Get in touch with us.',
};

export default function ContactPage() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Contact</span>
          <h1>Get in Touch</h1>
          <p>Questions, orders, or custom requests. Reach out and we will get back to you.</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.info}>
          <div className={styles.infoBlock}>
            <span className={styles.label}>Visit Us</span>
            <h3>Heritage District Shop</h3>
            <p>123 Old Bakery Lane, Heritage District</p>
          </div>

          <div className={styles.infoBlock}>
            <span className={styles.label}>Call Us</span>
            <h3>(+63) 912-345-6789</h3>
            <p>Available for orders, pickup questions, and delivery updates.</p>
          </div>

          <div className={styles.infoBlock}>
            <span className={styles.label}>Store Hours</span>
            <h3>Fresh daily</h3>
            <p>Mon - Sat: 8:00 AM - 9:00 PM<br />Sunday: 9:00 AM - 6:00 PM</p>
          </div>

          <div className={styles.infoBlock}>
            <span className={styles.label}>Email</span>
            <h3>hello@cravecorner.com</h3>
            <p>Send us inquiries for bulk orders, events, and menu requests.</p>
          </div>

          <div className={styles.infoBlock}>
            <span className={styles.label}>Socials</span>
            <h3>Follow Crave Corner</h3>
            <div className={styles.socialList}>
              <a
                href="tel:+639123456789"
                className={styles.socialLink}
              >
                <span className={styles.socialIcon}>
                  <Image src="/uploads/telephone.png" alt="Telephone" width={20} height={20} />
                </span>
                <span>Call Us</span>
              </a>
              <a
                href="mailto:hello@cravecorner.com"
                className={styles.socialLink}
              >
                <span className={styles.socialIcon}>
                  <Image src="/uploads/gmail.png" alt="Gmail" width={20} height={20} />
                </span>
                <span>Gmail</span>
              </a>
              <a
                href="https://www.facebook.com/people/Cravings-Ko/61579546756036/"
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
              >
                <span className={styles.socialIcon}>
                  <Image src="/uploads/facebook_icon.png" alt="Facebook" width={20} height={20} />
                </span>
                <span>Facebook</span>
              </a>
              <a
                href="https://www.tiktok.com/@cravings_ko?"
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
              >
                <span className={`${styles.socialIcon} ${styles.socialIconTikTok}`}>
                  <Image src="/uploads/tiktok_icon.png" alt="TikTok" width={20} height={20} />
                </span>
                <span>TikTok</span>
              </a>
              <a
                href="https://www.instagram.com/cravings_ko"
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
              >
                <span className={styles.socialIcon}>
                  <Image src="/uploads/instagram_icon.png" alt="Instagram" width={20} height={20} />
                </span>
                <span>Instagram</span>
              </a>
            </div>
          </div>

          <div className={`${styles.infoBlock} ${styles.infoBlockWide}`}>
            <span className={styles.label}>What to Expect</span>
            <h3>Quick replies and warm service</h3>
            <p>Message us for same-day availability, preorder scheduling, and large-batch snack trays.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
