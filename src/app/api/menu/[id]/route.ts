import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import { Prisma } from '@prisma/client';
import sharp from 'sharp';
import { revalidatePath } from 'next/cache';

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
    const preOrder = formData.get('preOrder') === 'true';
    const details = (formData.get('details') as string | null)?.trim() || null;
    const packagingType = formData.get('packagingType') as string | null;
    const packagingPiecesStr = formData.get('packagingPieces') as string | null;
    const packagingPieces = packagingPiecesStr ? parseInt(packagingPiecesStr, 10) : null;
    const file = formData.get('file') as File | null;
    const MAX_IMAGE_BYTES = 30 * 1024 * 1024;

    const currentItem = await prisma.menuItem.findUnique({ where: { id } });
    let imageUrl = currentItem?.imageUrl;
    let thumbnailUrl = currentItem?.thumbnailUrl;

    if (isFeatured && !(await canFeatureAnotherItem(id))) {
      return NextResponse.json({ error: 'Only 2 specialties can be shown on the home page.' }, { status: 400 });
    }

    if (file) {
      if (file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: 'Image too large. Please upload a file under 25 MB.' },
          { status: 400 }
        );
      }
      const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
      if (file.type === 'image/heic' || file.type === 'image/heif') {
        return NextResponse.json(
          { error: 'HEIC images are not supported. Please upload JPG or PNG.' },
          { status: 400 }
        );
      }
      if (file.type && !allowedTypes.has(file.type)) {
        return NextResponse.json(
          { error: 'Unsupported image type. Please upload JPG, PNG, or WebP.' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeBase = file.name.replace(/\s+/g, '-').replace(/\.[^.]+$/, '');
      const baseName = `${Date.now()}-${safeBase}`;
      const filename = `${baseName}.webp`;
      const thumbFilename = `${baseName}-thumb.webp`;
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename);
      const thumbPath = path.join(process.cwd(), 'public', 'uploads', thumbFilename);

      if (file.type.startsWith('image/')) {
        const optimized = await sharp(buffer, { limitInputPixels: 268402689 })
          .rotate()
          .resize({ width: 1800, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
        const thumbnail = await sharp(buffer, { limitInputPixels: 268402689 })
          .rotate()
          .resize({ width: 480, withoutEnlargement: true })
          .webp({ quality: 70 })
          .toBuffer();
        await writeFile(uploadPath, optimized);
        await writeFile(thumbPath, thumbnail);
      } else {
        await writeFile(uploadPath, buffer);
      }
      imageUrl = `/uploads/${filename}`;
      thumbnailUrl = `/uploads/${thumbFilename}`;
    }

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        details,
        price: parseFloat(price),
        imageUrl,
        thumbnailUrl,
        category,
        isFeatured,
        outOfStock,
        preOrder,
        packagingType,
        packagingPieces,
      },
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
  if (!(await ensureAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const activeOrder = await prisma.orderItem.findFirst({
      where: {
        menuItemId: id,
        order: {
          status: { in: ['PENDING', 'PREPARING', 'READY'] },
        },
      },
    });

    if (activeOrder) {
      return NextResponse.json(
        { error: 'Cannot delete item with active orders. Complete or cancel those orders first.' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { menuItemId: id } }),
      prisma.menuItem.delete({ where: { id } }),
    ]);
    revalidatePath('/');
    revalidatePath('/menu');
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete item with existing orders. Mark it out of stock instead.' },
        { status: 400 }
      );
    }
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
