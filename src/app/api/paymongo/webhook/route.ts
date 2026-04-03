import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type SignatureParts = {
  timestamp: string;
  testSignature: string | null;
  liveSignature: string | null;
};

const MAX_SKEW_SECONDS = 5 * 60;

function parseSignatureHeader(header: string): SignatureParts | null {
  const parts = header.split(',').map(part => part.trim());
  const t = parts.find(p => p.startsWith('t='));
  const te = parts.find(p => p.startsWith('te='));
  const li = parts.find(p => p.startsWith('li='));

  if (!t) return null;

  return {
    timestamp: t.replace('t=', ''),
    testSignature: te ? te.replace('te=', '') : null,
    liveSignature: li ? li.replace('li=', '') : null,
  };
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Missing PAYMONGO_WEBHOOK_SECRET.' }, { status: 500 });
  }

  const signatureHeader = req.headers.get('paymongo-signature');
  if (!signatureHeader) {
    return NextResponse.json({ error: 'Missing Paymongo-Signature header.' }, { status: 400 });
  }

  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid signature header.' }, { status: 400 });
  }

  const rawBody = await req.text();
  const expectedBase = `${parsed.timestamp}.${rawBody}`;
  const computed = crypto.createHmac('sha256', secret).update(expectedBase).digest('hex');

  const mode = (process.env.PAYMONGO_WEBHOOK_MODE || '').toLowerCase();
  const expected = mode === 'live'
    ? parsed.liveSignature
    : mode === 'test'
      ? parsed.testSignature
      : parsed.testSignature || parsed.liveSignature;

  if (!expected || !safeEqual(computed, expected)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  const timestamp = Number(parsed.timestamp);
  if (Number.isFinite(timestamp)) {
    const age = Math.abs(Date.now() / 1000 - timestamp);
    if (age > MAX_SKEW_SECONDS) {
      return NextResponse.json({ error: 'Signature timestamp too old.' }, { status: 400 });
    }
  }

  try {
    const payload = JSON.parse(rawBody);
    const eventType =
      (payload?.data?.attributes?.type as string | undefined) ??
      (payload?.type as string | undefined);
    const eventData = payload?.data?.attributes?.data ?? payload?.data;

    const extractOrderId = (data: any) => {
      const metadata =
        data?.attributes?.metadata ??
        data?.attributes?.payment_intent?.attributes?.metadata ??
        data?.attributes?.payments?.[0]?.attributes?.metadata ??
        {};
      return metadata.orderId || metadata.order_id || metadata.orderID;
    };

    const extractPaymentReference = (data: any) => {
      const directPayment = data?.attributes?.payments?.[0] ?? data;
      const paymentAttributes = directPayment?.attributes ?? directPayment;
      return (
        paymentAttributes?.id ||
        directPayment?.id ||
        paymentAttributes?.balance_transaction_id ||
        paymentAttributes?.payment_intent_id ||
        null
      );
    };

    if (eventType === 'checkout_session.payment.paid' || eventType === 'payment.paid') {
      const orderId = extractOrderId(eventData);
      if (orderId) {
        const paymentReference = extractPaymentReference(eventData);
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
            paidAt: new Date(),
            paymentMethod: 'QRPH',
            paymentReference,
          },
        });
      } else {
        console.warn('PayMongo webhook: missing orderId metadata', { eventType });
      }
    } else {
      console.log('PayMongo webhook received', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook handling failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
