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
  if (!item) return { title: 'Not Found | Cravings Ko' };
  return { title: `${item.name} | Cravings Ko`, description: item.description };
}

export const revalidate = 30;

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reviewWhere = {
    items: { some: { menuItemId: id } },
    OR: [{ rating: { not: null } }, { feedback: { not: null } }],
  };

  const [bestSellers, item, reviews] = await Promise.all([
    prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 3,
    }),
    prisma.menuItem.findUnique({
      where: { id },
      include: { _count: { select: { orderItems: true } } },
    }),
    prisma.order.findMany({
      where: reviewWhere,
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        customerName: true,
        rating: true,
        feedback: true,
        createdAt: true,
      },
    }),
  ]);

  const bestSellerIds = new Set(bestSellers.map(entry => entry.menuItemId));

  if (!item) notFound();

  const displayCategory = CATEGORY_LABELS[item.category] ?? item.category;
  const isBestSeller = bestSellerIds.has(item.id);
  const maskName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return 'Customer';
    if (trimmed.length <= 2) return `${trimmed[0]}*`;
    return `${trimmed[0]}${'*'.repeat(Math.max(1, trimmed.length - 2))}${trimmed[trimmed.length - 1]}`;
  };

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
            <div className={styles.reviews}>
              <h3>Customer Reviews</h3>
              {reviews.length === 0 ? (
                <p className={styles.noReviews}>No reviews yet. Be the first to leave one!</p>
              ) : (
                <>
                  <div className={styles.reviewList}>
                    {reviews.slice(0, 3).map(review => (
                      <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                          <span className={styles.reviewerName}>{maskName(review.customerName)}</span>
                          <span className={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className={styles.reviewRating}>
                          <StarRating rating={review.rating ?? 0} />
                          <span className={styles.reviewScore}>{review.rating ? `${review.rating}/5` : 'No rating'}</span>
                        </div>
                        {review.feedback && <p className={styles.reviewText}>&ldquo;{review.feedback}&rdquo;</p>}
                      </div>
                    ))}
                  </div>
                  {reviews.length > 3 && (
                    <details className={styles.reviewDetails}>
                      <summary className={styles.reviewSummary}>See more reviews</summary>
                      <div className={styles.reviewList}>
                        {reviews.slice(3).map(review => (
                          <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                              <span className={styles.reviewerName}>{maskName(review.customerName)}</span>
                              <span className={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className={styles.reviewRating}>
                              <StarRating rating={review.rating ?? 0} />
                              <span className={styles.reviewScore}>{review.rating ? `${review.rating}/5` : 'No rating'}</span>
                            </div>
                            {review.feedback && <p className={styles.reviewText}>&ldquo;{review.feedback}&rdquo;</p>}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
