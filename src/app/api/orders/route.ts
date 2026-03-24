import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { cookies } from 'next/headers';

type OrderRequestItem = {
  menuItemId: string;
  quantity: number;
  priceAtPurchase: number;
};

type OrderRequestBody = {
  customerName: string;
  customerAddress: string;
  customerContact: string;
  items: OrderRequestItem[];
};

export async function GET() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin_auth');
  
  if (!auth || auth.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as OrderRequestBody;
    const { customerName, customerAddress, customerContact, items } = body;

    const order = await prisma.order.create({
      data: {
        customerName,
        customerAddress,
        customerContact,
        status: 'PENDING',
        totalAmount: items.reduce((acc: number, item) => acc + (item.priceAtPurchase * item.quantity), 0),
        items: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
          })),
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
