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
  preOrder?: boolean;
  isBestSeller?: boolean;
  packagingType?: string | null;
  packagingPieces?: number | null;
};

export default async function HomePage() {
  // 1. Get manually featured items (Specialties)
  const featuredItems = await prisma.menuItem.findMany({
    where: { isFeatured: true },
  }) as MenuItem[];

  // 2. Get top sellers by sales volume
  const salesData = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 6,
  });

  const bestIds = salesData.map(item => item.menuItemId);
  const soldLookup = new Map<string, number>(
    salesData.map(item => [item.menuItemId, item._sum.quantity ?? 0])
  );

  // 3. Combine: Featured first, then fill up to 3 with sales-based sellers
  const featuredIds = new Set(featuredItems.map(i => i.id));
  const additionalIds = bestIds.filter(id => !featuredIds.has(id)).slice(0, Math.max(0, 3 - featuredItems.length));
  
  const additionalItems = additionalIds.length > 0 
    ? await prisma.menuItem.findMany({ where: { id: { in: additionalIds } } }) as MenuItem[]
    : [];

  const displayItems = [...featuredItems, ...additionalItems].slice(0, 3).map(item => ({
    ...item,
    soldCount: soldLookup.get(item.id) ?? 0,
    isBestSeller: true,
  }));

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
          <p className={styles.subtitle}>Made to Match every Cravings</p>
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
                    {item.isBestSeller && (
                      <span className={styles.metaBadge}>Best Seller</span>
                    )}
                    {item.outOfStock && (
                      <span className={`${styles.metaBadge} ${styles.stockBadge}`}>Out of Stock</span>
                    )}
                    {item.preOrder && (
                      <span className={styles.metaBadge}>Pre-order</span>
                    )}
                    {item.packagingPieces && item.packagingType && (
                      <span className={styles.pkgBadge}>
                        {item.packagingPieces}pcs / {item.packagingType.toLowerCase()}
                      </span>
                    )}
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
            Cravings Ko was created with one simple goal in mind—to satisfy every
            craving with comfort, quality, and convenience. Inspired by the love for
            Filipino snacks and sweets, the brand brings together classic favorites
            like cheese sticks, lumpia, and cookies in one place. Guided by our
            tagline, “Made to Match Every Cravings”, we aim to offer a variety of
            flavors that suit every mood, whether you’re craving something crispy,
            sweet, or savory. At Cravings Ko, we believe that food is more than just
            a quick bite, it’s an experience that brings joy, comfort, and connection.
          </p>
          <Link href="/about" className={styles.storyLink}>Read more about us →</Link>
        </div>
      </section>
    </main>
  );
}
