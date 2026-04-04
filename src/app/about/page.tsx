
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'About Us | Crave Corner',
  description: 'Our story and passion for handcrafted food.',
};

const team = [
  {
    name: 'CIELO MAE S. COTANAS',
  },
  {
    name: 'JHON WILLIAM D. DAYRIT',
  },
  {
    name: 'GENEVIE S. DEL ROSARIO',
  },
  {
    name: 'CLAUDINE KHRYSS M. BUZA',
  },
];

export default function AboutPage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>About</span>
          <h1>Made with memory, warmth, and everyday comfort.</h1>
          <p>
            Cravings Ko started with familiar snacks, homemade sweets, and the goal of
            serving food that feels personal from the first bite.
          </p>
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.storyGrid}>
          <article className={styles.storyCard}>
            <h2>How It Started</h2>
            <p>
              Cravings Ko started as a simple idea: to make affordable yet high-quality snacks
              easily accessible to everyone, especially students and busy individuals. We noticed
              that many snack options were either expensive, limited in variety, or lacked
              consistency in quality. From this gap, Cravings Ko was born, offering a mix of sweet
              and savory treats in one platform. What began as a small initiative has grown into a
              brand that values customer satisfaction, convenience, and reliability. By combining
              homemade flavors with a modern online ordering system, we made it easier for
              customers to enjoy their favorite snacks anytime.
            </p>
          </article>

          <article className={styles.storyCard}>

            <h2>What We Believe</h2>

            <p>
              At Cravings Ko, we stand by these core values:
              <br></br>
              <b>Quality You Can Trust</b> – We ensure
              that every product is made with care, delivering consistent taste and freshness.
              <br></br>
              <b>Convenience Matters</b> – Our frozen cheese sticks and lumpia are designed for easy
              storage and preparation, turning perfectly crispy when fried, so you can enjoy
              fresh snacks anytime.
              <br></br>
              <b>Affordability for Everyone</b> – Good food doesn’t have to be
              expensive. We offer budget-friendly options without compromising quality.
              <br></br>
              <b>Made to Match Every Cravings</b> – We believe that everyone has different cravings, and we are
              here to satisfy each one with our variety of snacks.
              <br></br>
              <b>Customer First</b> – Your
              satisfaction is our priority, and we strive to provide a smooth and enjoyable
              ordering experience.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.missionVisionSection}>
        <div className={styles.missionVisionGrid}>
          <article className={styles.missionCard}>
            <h2>MISSION</h2>
            <p>
              Our mission is to deliver high-quality, delicious, and crave-worthy snacks that bring joy and satisfaction to every customer. We aim to innovate and create products that excite the taste buds and delight the senses while providing a convenient and enjoyable snacking experience. At the heart of our business is a commitment to quality, creativity, and customer satisfaction in everything we do.
            </p>
          </article>
          <article className={styles.visionCard}>
            <h2>VISION</h2>
            <p>
              To be the leading snack brand that brings joy and satisfaction to every craving, creating memorable moments with every bite.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.productsSection}>
        <article className={`${styles.storyCard} ${styles.storyCardWide}`}>
          <h2>Our Products</h2>
          <p>
            Cravings Ko offers a delicious selection of snacks that are perfect for any time of the day:
            <br></br>
            <b>Cheese Sticks</b> – Frozen and ready-to-cook, coated for that perfect crispy bite with flavorful powder options.
            <br></br>
            <b>Lumpia</b> – Packed with savory filling, delivered frozen for convenience, and made to turn golden and crispy when fried.
            <br></br>
            <b>Cookies</b> – Freshly baked and available in different flavors, perfect for satisfying your sweet cravings.
          </p>
          <Link href="/menu" className={styles.cta}>Explore the Menu</Link>
        </article>
      </section>

      <section className={styles.teamSection}>
        <div className={styles.teamHeader}>
          <span className={styles.eyebrow}>Our Team</span>
          <h2>The people behind Cravings Ko.</h2>
        </div>

        <div className={styles.teamGrid}>
          {team.map((member) => (
            <article key={member.name} className={styles.memberCard}>
              <div className={styles.memberBody}>
                <h3>{member.name}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
