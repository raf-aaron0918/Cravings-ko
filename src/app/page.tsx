import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { prisma } from '@/lib/prisma';
import StarRating from '@/components/StarRating';
import AddToCartButton from '@/components/AddToCartButton';
import BuyNowButton from '@/components/BuyNowButton';
import { formatPeso } from '@/lib/currency';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string;
  isFeatured: boolean;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  outOfStock?: boolean;
};

export default async function HomePage() {
  // Top 3 sellers by total quantity across order items
  const bestSellers = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 3,
  });

  type BestSeller = (typeof bestSellers)[number];
  const bestIds = bestSellers.map((item: BestSeller) => item.menuItemId);
  const soldLookup = new Map<string, number>(
    bestSellers.map((item: BestSeller) => [item.menuItemId, item._sum.quantity ?? 0])
  );

  const bestItems = await prisma.menuItem.findMany({
    where: { id: { in: bestIds } },
  }) as MenuItem[];

  // preserve best seller order
  type BestId = BestSeller['menuItemId'];
  const orderedBest = bestIds
    .map((id: BestId) => bestItems.find(i => i.id === id))
    .filter((item): item is MenuItem => Boolean(item))
    .map((item: MenuItem) => ({ ...item, soldCount: soldLookup.get(item.id) ?? 0 }));

  const fillersNeeded = Math.max(0, 3 - orderedBest.length);
  const fillerItems = fillersNeeded
    ? (await prisma.menuItem.findMany({
        where: orderedBest.length ? { NOT: { id: { in: orderedBest.map(i => i.id) } } } : undefined,
        orderBy: [
          { updatedAt: 'desc' },
          { name: 'asc' },
        ],
        take: fillersNeeded,
      })) as MenuItem[]
    : [];

  const displayItems = [...orderedBest, ...fillerItems.map(item => ({ ...item, soldCount: 0 }))];

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logoWrap}>
            <Image
              src="/uploads/cravings-ko-logo.png"
              alt="Cravings Ko Filipino Snacks and Sweets"
              className={styles.logo}
              width={1920}
              height={640}
              priority
            />
          </div>
          <p className={styles.subtitle}>Made to Match your Cravings</p>
        </div>
      </header>

      <section className={styles.featured}>
        <div className={`${styles.featuredInner} container`}>
          <h2 className={styles.sectionTitle}>Best Sellers</h2>
          <div className={styles.menuGrid}>
          {displayItems.length === 0 ? (
            <p className={styles.empty}>Our oven is warming up — check back soon for our best sellers!</p>
          ) : (
            displayItems.map((item: MenuItem) => (
              <div key={item.id} className={`${styles.card} handcrafted-border`}>
                <Link href={`/menu/${item.id}`} className={styles.cardLink}>
                  <div className={styles.imagePlaceholder}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <span>No image</span>
                    )}
                  </div>
                </Link>
                <div className={styles.cardBody}>
                  <h3><Link href={`/menu/${item.id}`}>{item.name}</Link></h3>
                  <div className={styles.ratingRow}>
                    <StarRating rating={item.rating ?? 0} />
                    <span className={styles.ratingCount}>({item.reviewCount ?? 0})</span>
                  </div>
                  <p className={styles.desc}>{item.description}</p>
                  <div className={styles.metaRow}>
                    <span className={`${styles.metaBadge} ${item.outOfStock ? styles.stockBadge : ''}`}>
                      {item.outOfStock ? 'Out of Stock' : 'Best Seller'}
                    </span>
                    <span className={styles.metaText}>{item.soldCount ?? 0} sold</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>{formatPeso(item.price)}</span>
                    <div className={styles.actions}>
                      <AddToCartButton item={item} />
                      <BuyNowButton item={item} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className={styles.ctaRow}>
          <Link href="/menu" className={styles.heroBtn}>Explore the Menu →</Link>
        </div>
      </div>
      </section>

      <section className={styles.storySection}>
        <div className="container">
          <h2 className={styles.storyTitle}>Our Story</h2>
          <p className={styles.storyText}>
            Founded on the principle that the best recipes are passed down through
            generations, Crave Corner brings you old-school flavors with zero shortcuts.
            Every dish is handcrafted from fresh ingredients and a lot of heart.
          </p>
          <Link href="/about" className={styles.storyLink}>Read more about us →</Link>
        </div>
      </section>
    </main>
  );
}
