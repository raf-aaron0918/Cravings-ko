
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'About Us | Crave Corner',
  description: 'Our story and passion for handcrafted food.',
};

const team = [
  {
    name: 'Maria Santos',
    role: 'Founder',
    blurb: 'Keeps the recipes rooted in Filipino comfort food and family tradition.',
    photo: null,
  },
  {
    name: 'Paolo Reyes',
    role: 'Kitchen Lead',
    blurb: 'Handles daily prep, quality checks, and the flavors that keep regulars coming back.',
    photo: null,
  },
  {
    name: 'Jasmine Cruz',
    role: 'Customer Care',
    blurb: 'Manages orders, messages, and custom requests with fast and friendly service.',
    photo: null,
  },
  {
    name: 'Ethan Garcia',
    role: 'Operations',
    blurb: 'Coordinates deliveries, stocking, and smooth day-to-day workflow behind the scenes.',
    photo: null,
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
            Crave Corner started with familiar snacks, homemade sweets, and the goal of
            serving food that feels personal from the first bite.
          </p>
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.storyGrid}>
          <article className={styles.storyCard}>
            <span className={styles.kicker}>How It Started</span>
            <h2>From family recipes to a shared table.</h2>
            <p>
              Crave Corner was built from the kind of dishes that stay with you: merienda
              favorites, homemade desserts, and recipes passed around in kitchens full of
              conversation. The goal was simple: serve food that feels honest and familiar.
            </p>
          </article>

          <article className={styles.storyCard}>
            <span className={styles.kicker}>What We Value</span>
            <h2>Fresh, handcrafted, and worth the extra effort.</h2>
            <p>
              We believe good food should feel made, not manufactured. That means careful
              prep, balanced flavor, and no shortcuts where quality matters. A little
              imperfection is welcome because that is often where the character lives.
            </p>
          </article>

          <article className={`${styles.storyCard} ${styles.storyCardWide}`}>
            <span className={styles.kicker}>Why We Do It</span>
            <h2>Comfort food should still feel special.</h2>
            <p>
              Whether someone is ordering for a quiet craving, a family gathering, or a
              celebration, we want every box and every plate to carry the same warmth as a
              homemade meal. That is the standard we work toward every day.
            </p>
            <Link href="/menu" className={styles.cta}>Explore the Menu</Link>
          </article>
        </div>
      </section>

      <section className={styles.teamSection}>
        <div className={styles.teamHeader}>
          <span className={styles.eyebrow}>Our Team</span>
          <h2>The people behind Crave Corner.</h2>
        </div>

        <div className={styles.teamGrid}>
          {team.map((member) => (
            <article key={member.name} className={styles.memberCard}>
              <div className={styles.memberPhoto}>
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className={styles.memberPhotoImg} />
                ) : (
                  <span className={styles.memberPhotoPlaceholder}>Photo</span>
                )}
              </div>
              <div className={styles.memberBody}>
                <span className={styles.memberRole}>{member.role}</span>
                <h3>{member.name}</h3>
                <p>{member.blurb}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
