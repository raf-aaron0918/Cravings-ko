import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatPeso } from '@/lib/currency';

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
  paymentMethod?: string;
  items: OrderRequestItem[];
};

async function sendOrderEmail(params: {
  orderId: string;
  customerName: string;
  customerAddress: string;
  customerContact: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  totalAmount: number;
  items: { name: string; quantity: number; lineTotal: number }[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.RESEND_TO;

  if (!apiKey || !from || !to) return;

  const lines = params.items
    .map(item => `${item.quantity}x ${item.name} — ${formatPeso(item.lineTotal)}`)
    .join('\n');

  const paymentLine = params.paymentMethod
    ? `Payment: ${params.paymentMethod}${params.paymentStatus ? ` (${params.paymentStatus})` : ''}`
    : 'Payment: Not set';

  const text = [
    `Order ${params.orderId}`,
    `Customer: ${params.customerName}`,
    `Contact: ${params.customerContact}`,
    `Address: ${params.customerAddress}`,
    paymentLine,
    'Items:',
    lines,
    `Total: ${formatPeso(params.totalAmount)}`,
  ].join('\n');

  const htmlLines = params.items
    .map(item => `<li>${item.quantity}x ${item.name} — ${formatPeso(item.lineTotal)}</li>`)
    .join('');

  const html = `
    
    <p><strong>Order:</strong> ${params.orderId}</p>
    <p><strong>Customer:</strong> ${params.customerName}</p>
    <p><strong>Contact:</strong> ${params.customerContact}</p>
    <p><strong>Address:</strong> ${params.customerAddress}</p>
    <p><strong>${paymentLine}</strong></p>
    <p><strong>Items:</strong></p>
    <ul>${htmlLines}</ul>
    <p><strong>Total:</strong> ${formatPeso(params.totalAmount)}</p>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Order ${params.orderId.slice(-6)}`,
      text,
      html,
    }),
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin_auth');
  
  if (!auth || auth.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const expirationThreshold = new Date(Date.now() - 30 * 60 * 1000);
  await prisma.order.updateMany({
    where: {
      status: 'PENDING',
      paymentMethod: 'QRPH',
      paymentStatus: 'UNPAID',
      createdAt: { lt: expirationThreshold },
    },
    data: { status: 'EXPIRED' },
  });

  const orders = await prisma.order.findMany({
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as OrderRequestBody;
    const { customerName, customerAddress, customerContact, items, paymentMethod } = body;
    const normalizedMethod = paymentMethod === 'cod' ? 'COD' : paymentMethod === 'qrph' ? 'QRPH' : null;

    const order = await prisma.order.create({
      data: {
        customerName,
        customerAddress,
        customerContact,
        status: 'PENDING',
        paymentMethod: normalizedMethod,
        paymentStatus: normalizedMethod ? 'UNPAID' : null,
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

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map(item => item.menuItemId) } },
      select: { id: true, name: true },
    });
    const nameLookup = new Map(menuItems.map(item => [item.id, item.name]));
    const emailItems = items.map(item => ({
      name: nameLookup.get(item.menuItemId) ?? 'Item',
      quantity: item.quantity,
      lineTotal: item.priceAtPurchase * item.quantity,
    }));

    try {
      await sendOrderEmail({
        orderId: order.id,
        customerName,
        customerAddress,
        customerContact,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        items: emailItems,
      });
    } catch (error) {
      console.warn('Order email failed:', error);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
