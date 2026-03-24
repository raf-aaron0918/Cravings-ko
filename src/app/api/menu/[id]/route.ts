import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

import { cookies } from 'next/headers';

async function ensureAuth() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin_auth');

  return auth?.value === 'true';
}

async function canFeatureAnotherItem(id: string) {
  const featuredCount = await prisma.menuItem.count({
    where: {
      isFeatured: true,
      id: { not: id },
    },
  });

  return featuredCount < 2;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await ensureAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const isFeatured = formData.get('isFeatured') === 'true';
    const outOfStock = formData.get('outOfStock') === 'true';
    const file = formData.get('file') as File | null;

    const currentItem = await prisma.menuItem.findUnique({ where: { id } });
    let imageUrl = currentItem?.imageUrl;

    if (isFeatured && !(await canFeatureAnotherItem(id))) {
      return NextResponse.json({ error: 'Only 2 specialties can be shown on the home page.' }, { status: 400 });
    }

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(uploadPath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const item = await prisma.menuItem.update({
      where: { id },
      data: { name, description, price: parseFloat(price), imageUrl, category, isFeatured, outOfStock },
    });
    return NextResponse.json(item);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await ensureAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const isFeatured = body.isFeatured === true;

    if (isFeatured && !(await canFeatureAnotherItem(id))) {
      return NextResponse.json({ error: 'Only 2 specialties can be shown on the home page.' }, { status: 400 });
    }

    const item = await prisma.menuItem.update({
      where: { id },
      data: { isFeatured },
    });

    return NextResponse.json(item);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.menuItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
