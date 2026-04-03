import { NextRequest, NextResponse } from 'next/server';

const PAYMONGO_CHECKOUT_URL = 'https://api.paymongo.com/v1/checkout_sessions';

type CheckoutRequestBody = {
  orderId: string;
  totalAmount: number;
  paymentFee?: number;
  paymentMethod?: string;
  customerName?: string | null;
  customerContact?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Missing PayMongo secret key.' }, { status: 500 });
    }

    const body = (await req.json()) as CheckoutRequestBody;
    if (!body?.orderId || !Number.isFinite(body?.totalAmount) || body.totalAmount <= 0) {
      return NextResponse.json({ error: 'Missing order details.' }, { status: 400 });
    }

    const origin = req.headers.get('origin') ?? '';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || origin;
    if (!siteUrl) {
      return NextResponse.json({ error: 'Missing site URL for redirects.' }, { status: 500 });
    }
    const successUrl = `${siteUrl}/order-tracker/${body.orderId}?paid=1`;
    const cancelUrl = `${siteUrl}/checkout?cancel=1`;

    const baseAmount = Number(body.totalAmount) - Number(body.paymentFee ?? 0);
    const orderAmount = Math.max(baseAmount, 0);
    const feeAmount = Math.max(Number(body.paymentFee ?? 0), 0);
    const orderCents = Math.round(orderAmount * 100);
    const feeCents = Math.round(feeAmount * 100);
    const lineItems = [
      {
        name: 'Order Subtotal',
        amount: orderCents,
        currency: 'PHP',
        quantity: 1,
        description: `Order ${body.orderId}`,
      },
    ];
    if (feeCents > 0) {
      lineItems.push({
        name: 'Processing Fee',
        amount: feeCents,
        currency: 'PHP',
        quantity: 1,
        description: 'PayMongo processing fee',
      });
    }

    const payload = {
      data: {
        attributes: {
          line_items: lineItems,
          payment_method_types: ['qrph'],
          success_url: successUrl,
          cancel_url: cancelUrl,
          description: `Order ${body.orderId}`,
          metadata: {
            orderId: body.orderId,
            paymentMethod: body.paymentMethod ?? '',
            paymentFee: String(body.paymentFee ?? ''),
            customerName: body.customerName ?? '',
            customerContact: body.customerContact ?? '',
          },
        },
      },
    };

    const auth = Buffer.from(`${secretKey}:`).toString('base64');
    const response = await fetch(PAYMONGO_CHECKOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('PayMongo checkout error:', data);
      return NextResponse.json(
        { error: data?.errors?.[0]?.detail ?? 'PayMongo checkout failed.', raw: data },
        { status: response.status },
      );
    }

    const checkoutUrl = data?.data?.attributes?.checkout_url as string | undefined;
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Missing checkout URL.' }, { status: 502 });
    }

    return NextResponse.json({ checkoutUrl, id: data?.data?.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
