"use client";
import Link from 'next/link';
import AddToCartButton from './AddToCartButton';
import BuyNowButton from './BuyNowButton';
import StarRating from './StarRating';
import styles from './MenuPageClient.module.css';
import { formatPeso } from '@/lib/currency';
import Image from 'next/image';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  isBestSeller?: boolean;
  outOfStock?: boolean;
};

const CATEGORY_ORDER = ['Cookies', 'Cheese Sticks', 'Lumpia'];
const CATEGORY_LABELS: Record<string, string> = {
  Cookies: 'Cookies',
  'Cheese Sticks': 'Cheese Sticks',
  Lumpia: 'Lumpia',
  Desserts: 'Cookies',
  Snacks: 'Cheese Sticks',
  Meals: 'Lumpia',
  Drinks: 'Cheese Sticks',
};

export default function MenuPageClient({ items }: { items: MenuItem[] }) {
  const groupedItems = items.reduce<Record<string, MenuItem[]>>((groups, item) => {
    const key = CATEGORY_LABELS[item.category] ?? item.category ?? 'Other';
    groups[key] = groups[key] ? [...groups[key], item] : [item];
    return groups;
  }, {});

  const orderedCategories = [
    ...CATEGORY_ORDER.filter(category => groupedItems[category]?.length),
    ...Object.keys(groupedItems).filter(category => !CATEGORY_ORDER.includes(category)),
  ];

  return (
    <div>
      {items.length === 0 ? (
        <p className={styles.empty}>Our menu is currently empty. Check back soon!</p>
      ) : (
        <div className={styles.sections}>
          {orderedCategories.map(category => (
            <section key={category} className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>{category}</h2>
              </div>
              <div className={styles.grid}>
                {groupedItems[category].map(item => (
                  <div key={item.id} className={`${styles.card} handcrafted-border`}>
                    <Link href={`/menu/${item.id}`} className={styles.cardLink}>
                      <div className={styles.imageBox}>
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="(max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <span>No image</span>
                        )}
                      </div>
                    </Link>
                    <div className={styles.cardBody}>
                      <h3 className={styles.itemName}>
                        <Link href={`/menu/${item.id}`}>{item.name}</Link>
                      </h3>
                      <div className={styles.ratingRow}>
                        <StarRating rating={item.rating ?? 0} />
                        <span className={styles.ratingCount}>({item.reviewCount ?? 0})</span>
                      </div>
                      <div className={styles.metaRow}>
                        <span className={`${styles.metaBadge} ${item.outOfStock ? styles.stockBadge : ''}`}>
                          {item.outOfStock ? 'Out of Stock' : item.isBestSeller ? 'Best Seller' : 'Fresh Pick'}
                        </span>
                        <span className={styles.metaText}>{item.soldCount ?? 0} sold</span>
                      </div>
                      <p className={styles.desc}>{item.description}</p>
                      <div className={styles.footer}>
                        <span className={styles.price}>{formatPeso(item.price)}</span>
                        <div className={styles.actions}>
                          <AddToCartButton item={item} />
                          <BuyNowButton item={item} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
