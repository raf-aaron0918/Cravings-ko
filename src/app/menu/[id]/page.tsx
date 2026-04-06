import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import AddToCartButton from '@/components/AddToCartButton';
import BuyNowButton from '@/components/BuyNowButton';
import Link from 'next/link';
import Image from 'next/image';

import StarRating from '@/components/StarRating';
import { formatPeso } from '@/lib/currency';

const CATEGORY_LABELS: Record<string, string> = {
  Cookies: 'Cookies',
  'Cheese Sticks': 'Cheese Sticks',
  Lumpia: 'Lumpia',
  Desserts: 'Cookies',
  Snacks: 'Cheese Sticks',
  Meals: 'Lumpia',
  Drinks: 'Cheese Sticks',
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) return { title: 'Not Found | Crave Corner' };
  return { title: `${item.name} | Crave Corner`, description: item.description };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bestSellers = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 3,
  });
  const bestSellerIds = new Set(bestSellers.map(entry => entry.menuItemId));

  const item = await prisma.menuItem.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  });

  if (!item) notFound();

  const displayCategory = CATEGORY_LABELS[item.category] ?? item.category;
  const isBestSeller = bestSellerIds.has(item.id);

  return (
    <main className={styles.main}>
      <div className="container">
        <Link href="/menu" className={styles.backLink}>← Back to Menu</Link>
        <div className={styles.productGrid}>
          <div className={styles.imageSection}>
            {item.imageUrl ? (
              <Image
                src={item.imageUrl.startsWith('/') ? item.imageUrl : `/${item.imageUrl.replace(/^public\//, '')}`}
                alt={item.name}
                className={styles.image}
                width={900}
                height={600}
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
                loading="eager"
                unoptimized
              />
            ) : (
              <div className={styles.placeholder}>{displayCategory}</div>
            )}
          </div>
          <div className={styles.infoSection}>
            <div className={styles.categoryRow}>
              <span className={styles.category}>{displayCategory}</span>
              {isBestSeller && <span className={styles.badge}>Best Seller</span>}
              {item.outOfStock && <span className={`${styles.badge} ${styles.stockBadge}`}>Out of Stock</span>}
              {item.preOrder && <span className={`${styles.badge} ${styles.preOrderBadge}`}>Pre-order</span>}
              <span className={styles.sold}>{item._count.orderItems ?? 0} sold</span>
            </div>
            <h1 className={styles.title}>{item.name}</h1>
            <div className={styles.ratingRow}>
              <StarRating rating={item.rating ?? 0} />
              <span className={styles.ratingCount}>({item.reviewCount ?? 0})</span>
            </div>
            <div className={styles.buyRow}>
              <div className={styles.priceContainer}>
                <p className={styles.price}>{formatPeso(item.price)}</p>
                {item.packagingPieces && item.packagingType && (
                  <span className={styles.packaging}>
                    {item.packagingPieces}pcs / {item.packagingType.toLowerCase()}
                  </span>
                )}
              </div>
              <div className={styles.buyButtonWrap}>
                <div className={styles.buttonGroup}>
                  <AddToCartButton item={item} />
                  <BuyNowButton item={item} />
                </div>
              </div>
            </div>
            <p className={styles.description}>{item.description}</p>
            {item.details && (
              <div className={styles.details}>
                <h3>Product Details</h3>
                <p>{item.details}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
