import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { cookies } from 'next/headers';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { menuItem: true } } },
    });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.status === 'PENDING' && order.paymentMethod === 'QRPH' && order.paymentStatus === 'UNPAID') {
      const expirationThreshold = Date.now() - 30 * 60 * 1000;
      if (order.createdAt.getTime() < expirationThreshold) {
        const updated = await prisma.order.update({
          where: { id },
          data: { status: 'EXPIRED' },
          include: { items: { include: { menuItem: true } } },
        });
        return NextResponse.json(updated);
      }
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const { status, rating, feedback, cancelReason } = body;
  const { id } = await params;

  // Protect status updates (Admin only), except customer-side cancellation while pending.
  if (status !== undefined) {
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (status === 'CANCELLED') {
      const cookieStore = await cookies();
      const auth = cookieStore.get('admin_auth');
      const isAdmin = auth?.value === 'true';

      if (!isAdmin) {
        if (currentOrder.status !== 'PENDING' && currentOrder.status !== 'COD') {
          return NextResponse.json({ error: 'Only pending orders can be cancelled.' }, { status: 400 });
        }
      } else if (currentOrder.status === 'COMPLETED' || currentOrder.status === 'CANCELLED') {
        return NextResponse.json({ error: 'This order can no longer be cancelled.' }, { status: 400 });
      }
    } else {
      const cookieStore = await cookies();
      const auth = cookieStore.get('admin_auth');
      if (!auth || auth.value !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  try {
    const updateData: { status?: string; rating?: number; feedback?: string; completedAt?: Date | null; cancelReason?: string | null } = {};
    if (status !== undefined) {
      updateData.status = status;
      updateData.completedAt = status === 'COMPLETED' ? new Date() : null;
      if (status === 'CANCELLED') {
        updateData.cancelReason = typeof cancelReason === 'string' && cancelReason.trim() ? cancelReason.trim() : null;
      } else {
        updateData.cancelReason = null;
      }
    }
    if (rating !== undefined) updateData.rating = rating;
    if (feedback !== undefined) updateData.feedback = feedback;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    // If a rating was submitted, optionally update the product ratings
    if (rating !== undefined) {
      const orderWithItems = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });
      
      if (orderWithItems) {
        for (const item of orderWithItems.items) {
          const menu = await prisma.menuItem.findUnique({
            where: { id: item.menuItemId },
            select: { rating: true, reviewCount: true },
          });
          if (!menu) continue;

          const currentCount = menu.reviewCount ?? 0;
          const currentRating = menu.rating ?? 0;
          const newCount = currentCount + 1;
          const newRating = ((currentRating * currentCount) + rating) / newCount;

          await prisma.menuItem.update({
            where: { id: item.menuItemId },
            data: {
              reviewCount: newCount,
              rating: newRating,
            },
          });
        }
      }
    }

    return NextResponse.json(order);
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
