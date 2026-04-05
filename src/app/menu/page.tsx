import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import MenuPageClient from '@/components/MenuPageClient';

export const metadata = {
  title: 'Menu | Cravings Ko',
  description: 'Browse our handcrafted menu of cookies, cheese sticks, and lumpia.',
};

export const revalidate = 60; // Revalidate every minute

export default async function MenuPage() {
  // Optimize: Fetch all menu items and sales in fewer queries
  const [sales, menuItems] = await Promise.all([
    prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true },
    }),
    prisma.menuItem.findMany({
      orderBy: [
        { updatedAt: 'desc' },
        { name: 'asc' },
      ],
    })
  ]);

  const soldLookup = new Map<string, number>(
    sales.map((item) => [item.menuItemId, item._sum.quantity ?? 0])
  );

  // Determine Best Sellers by sorting by quantity
  const itemsWithSales = menuItems.map(item => ({
    ...item,
    soldCount: soldLookup.get(item.id) ?? 0,
  })).sort((a, b) => b.soldCount - a.soldCount);

  // Tag top 3 as best sellers if they have sales
  const processedItems = itemsWithSales.map((item, index) => ({
    ...item,
    isBestSeller: index < 3 && item.soldCount > 0
  }));

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Our Menu</h1>
        <p>Freshly prepared, lovingly served</p>
      </div>
      <div className="container">
        <MenuPageClient items={processedItems} />
      </div>
    </main>
  );
}
