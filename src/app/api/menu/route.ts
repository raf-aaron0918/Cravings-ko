import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { MenuItem } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';

import { cookies } from 'next/headers';

async function canFeatureAnotherItem() {
  const featuredCount = await prisma.menuItem.count({ where: { isFeatured: true } });
  return featuredCount < 2;
}

export async function GET() {
  const items = (await prisma.menuItem.findMany({
    orderBy: [
      { isFeatured: 'desc' },
      { category: 'asc' },
      { name: 'asc' },
    ],
  })) as MenuItem[];

  const reviewedOrders = await prisma.order.findMany({
    where: {
      OR: [
        { rating: { not: null } },
        { feedback: { not: null } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        select: { menuItemId: true },
      },
    },
  });

  const reviewMap = new Map<string, Array<{ rating: number | null; feedback: string | null }>>();

  for (const order of reviewedOrders) {
    for (const item of order.items) {
      const existing = reviewMap.get(item.menuItemId) ?? [];
      if (existing.length >= 3) continue;
      existing.push({
        rating: order.rating,
        feedback: order.feedback,
      });
      reviewMap.set(item.menuItemId, existing);
    }
  }

  return NextResponse.json(
    items.map((item: MenuItem) => ({
      ...item,
      reviews: reviewMap.get(item.id) ?? [],
    }))
  );
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin_auth');
  
  if (!auth || auth.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const isFeatured = formData.get('isFeatured') === 'true';
    const outOfStock = formData.get('outOfStock') === 'true';
    const file = formData.get('file') as File | null;

    if (!name || !description || !price || !category) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (isFeatured && !(await canFeatureAnotherItem())) {
      return NextResponse.json({ error: 'Only 2 specialties can be shown on the home page.' }, { status: 400 });
    }

    let imageUrl = null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(uploadPath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const item = await prisma.menuItem.create({
      data: { name, description, price: parseFloat(price), imageUrl, category, isFeatured, outOfStock },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
