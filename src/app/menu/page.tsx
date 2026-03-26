import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import MenuPageClient from '@/components/MenuPageClient';

export const metadata = {
  title: 'Menu | Crave Corner',
  description: 'Browse our handcrafted menu of cookies, cheese sticks, and lumpia.',
};

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const sales = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
  });

  type Sale = (typeof sales)[number];
  const soldLookup = new Map<string, number>(
    sales.map((item: Sale) => [item.menuItemId, item._sum.quantity ?? 0])
  );
  const soldIds = sales.map((item: Sale) => item.menuItemId);

  const soldItems = soldIds.length
    ? await prisma.menuItem.findMany({
        where: { id: { in: soldIds } },
      })
    : [];

  type SoldItem = (typeof soldItems)[number];
  const orderedSoldItems = soldIds
    .map((id: Sale['menuItemId']) => soldItems.find((item: SoldItem) => item.id === id))
    .filter((item: SoldItem | undefined): item is SoldItem => Boolean(item))
    .map((item: SoldItem) => ({
      ...item,
      soldCount: soldLookup.get(item.id) ?? 0,
      isBestSeller: (soldLookup.get(item.id) ?? 0) > 0,
    }));

  const unsoldItems = await prisma.menuItem.findMany({
    where: soldIds.length ? { NOT: { id: { in: soldIds } } } : undefined,
    orderBy: [
      { updatedAt: 'desc' },
      { name: 'asc' },
    ],
  });

  type UnsoldItem = (typeof unsoldItems)[number];
  const items = [
    ...orderedSoldItems,
    ...unsoldItems.map((item: UnsoldItem) => ({
      ...item,
      soldCount: 0,
      isBestSeller: false,
    })),
  ];

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Our Menu</h1>
        <p>Freshly prepared, lovingly served</p>
      </div>
      <div className="container">
        <MenuPageClient items={items} />
      </div>
    </main>
  );
}
