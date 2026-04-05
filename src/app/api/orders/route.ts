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
  customerEmail: string;
  customerAddress: string;
  customerContact: string;
  paymentMethod?: string;
  transactionType?: string;
  items: OrderRequestItem[];
};

async function sendOrderEmail(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerContact: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  transactionType: string | null;
  totalAmount: number;
  items: { name: string; quantity: number; lineTotal: number; price: number; imageUrl?: string | null }[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const adminTo = process.env.RESEND_TO;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cravingsko.com';

  if (!apiKey || !from) return;

  const paymentText = params.paymentMethod
    ? `${params.paymentMethod}${params.paymentStatus ? ` (${params.paymentStatus})` : ''}`
    : 'Not set';

  // Beautiful HTML Email Template matching the provided images
  const itemRows = params.items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #eeeeee;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="80" style="vertical-align: top;">
              ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" width="70" height="70" style="border-radius: 8px; object-fit: cover; display: block;" />` : `<div style="width: 70px; height: 70px; background: #f0f0f0; border-radius: 8px;"></div>`}
            </td>
            <td style="padding-left: 15px; vertical-align: middle;">
              <div style="font-size: 16px; font-weight: 600; color: #333333; margin-bottom: 4px;">${item.name}</div>
              <div style="font-size: 14px; color: #666666;">${formatPeso(item.price)}</div>
              <div style="font-size: 14px; color: #666666;">Quantity: ${item.quantity}</div>
            </td>
            <td style="text-align: right; vertical-align: middle; font-weight: 600; color: #333333;">
              ${formatPeso(item.lineTotal)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 4px solid #000; }
        .logo-text { font-size: 24px; font-weight: bold; margin-left: 10px; vertical-align: middle; }
        .hero { text-align: center; padding: 40px 0; }
        .hero h1 { font-size: 32px; font-weight: 800; margin-bottom: 10px; line-height: 1.2; }
        .section-title { font-size: 20px; font-weight: 700; margin: 30px 0 15px; padding-bottom: 10px; border-bottom: 1px solid #cccccc; }
        .details-grid { width: 100%; margin-bottom: 30px; }
        .details-grid td { vertical-align: top; padding-bottom: 10px; }
        .label { font-size: 13px; color: #666666; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
        .value { font-size: 15px; color: #333333; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; }
        .grand-total { font-size: 20px; font-weight: 800; border-top: 2px solid #eeeeee; margin-top: 10px; padding-top: 10px; }
        .btn { display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 700; margin-top: 30px; }
        .footer-text { font-size: 12px; color: #999999; text-align: center; margin-top: 50px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${siteUrl}/uploads/cravingsko_logo.png" alt="Cravings Ko" width="50" height="50" style="vertical-align: middle; border-radius: 8px;" />
          <span class="logo-text">Cravings Ko</span>
        </div>
        
        <div class="hero">
          <h1>Thanks for shopping with us!</h1>
          <p>Hi ${params.customerName.split(' ')[0]},</p>
          <p>We got your order!</p>
          <p>We'll let you know when it's headed your way. Thank you for your business!</p>
        </div>

        <div class="section-title">My Orders</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
          ${itemRows}
        </table>

        <div class="section-title">Delivery Details</div>
        <table class="details-grid" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%">
              <div class="label">Name:</div>
              <div class="value">${params.customerName}</div>
              <div style="margin-top: 15px;" class="label">Phone:</div>
              <div class="value">${params.customerContact}</div>
            </td>
            <td width="50%">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${params.customerEmail}" style="color: #0066cc;">${params.customerEmail}</a></div>
              <div style="margin-top: 15px;" class="label">Address:</div>
              <div class="value">${params.customerAddress}</div>
            </td>
          </tr>
        </table>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px;">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatPeso(params.totalAmount)}</span>
          </div>
          <div class="total-row">
            <span>Transaction Mode:</span>
            <span>${params.transactionType || 'DELIVERY'}</span>
          </div>
          <div class="total-row grand-total">
            <span><strong>Total Paid:</strong></span>
            <span><strong>${formatPeso(params.totalAmount)}</strong></span>
          </div>
        </div>

        <div style="text-align: center;">
          <a href="${siteUrl}/order-tracker/${params.orderId}" class="btn">Track Your Order</a>
        </div>

        <div class="footer-text">
          &copy; 2026 Cravings Ko. All rights reserved.<br>
          Order ID: ${params.orderId}
        </div>
      </div>
    </body>
    </html>
  `;

  const recipients = [params.customerEmail];
  // if (adminTo) recipients.push(adminTo); // We'll send separately now

  // 1. Send Customer Email (Beautiful)
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [params.customerEmail],
      reply_to: adminTo, // Direct replies back to the admin!
      subject: `Order Confirmation — ${params.orderId.slice(-6)}`,
      html,
    }),
  });

  // 2. Send Admin Email (Simple format showing full details)
  if (adminTo) {
    const adminItems = params.items.map(item => 
      `<li>${item.quantity}x <strong>${item.name}</strong> — ${formatPeso(item.lineTotal)}</li>`
    ).join('');

    const adminHtml = `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
        <div style="background-color: #000; color: #fff; padding: 15px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">New Order Received! 🛍️</h2>
          <p style="margin: 5px 0 0 0;">Order ID: ${params.orderId}</p>
        </div>
        
        <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
          <h3 style="margin-top: 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 5px;">Customer Details</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${params.customerName}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${params.customerContact}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${params.customerEmail}">${params.customerEmail}</a></p>
          <p style="margin: 5px 0;"><strong>Address:</strong> ${params.customerAddress}</p>

          <h3 style="margin-top: 25px; color: #333; border-bottom: 2px solid #eee; padding-bottom: 5px;">Order Items</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            ${adminItems}
          </ul>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin-top: 25px;">
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentText}</p>
            <p style="margin: 5px 0;"><strong>Transaction Mode:</strong> ${params.transactionType || 'DELIVERY'}</p>
            <p style="margin: 5px 0; font-size: 18px;"><strong>Total Amount:</strong> <span style="color: #27ae60;">${formatPeso(params.totalAmount)}</span></p>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <a href="${siteUrl}/admin/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">View Order in Dashboard</a>
          </div>
        </div>
      </div>
    `;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [adminTo],
        subject: `New Order: ${params.customerName} — ${params.orderId.slice(-6)}`,
        html: adminHtml,
      }),
    });
  }
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
    const { customerName, customerEmail, customerAddress, customerContact, items, paymentMethod, transactionType } = body;
    const normalizedMethod = paymentMethod === 'cod' ? 'COD' : paymentMethod === 'qrph' ? 'QRPH' : null;

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerAddress,
        customerContact,
        status: 'PENDING',
        paymentMethod: normalizedMethod,
        transactionType: transactionType || 'DELIVERY',
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
      select: { id: true, name: true, imageUrl: true },
    });
    const itemLookup = new Map(menuItems.map(item => [item.id, item]));
    
    const emailItems = items.map(item => {
      const match = itemLookup.get(item.menuItemId);
      return {
        name: match?.name ?? 'Item',
        price: item.priceAtPurchase,
        quantity: item.quantity,
        lineTotal: item.priceAtPurchase * item.quantity,
        imageUrl: match?.imageUrl,
      };
    });

    try {
      await sendOrderEmail({
        orderId: order.id,
        customerName,
        customerEmail,
        customerAddress,
        customerContact,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        transactionType: order.transactionType,
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
