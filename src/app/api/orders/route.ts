import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/admin-auth';
import { notifyPurchase } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { productId, licenseType } = await request.json();
    const userId = authUser.userId;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const existingOrder = await db.order.findFirst({
      where: { userId, productId, status: 'COMPLETED' },
    });
    if (existingOrder) {
      return NextResponse.json({ error: 'Product already purchased' }, { status: 400 });
    }

    const order = await db.order.create({
      data: {
        userId,
        productId,
        licenseType: licenseType || 'PERSONAL',
        amount: product.price,
        status: 'COMPLETED',
        transactionId: 'TXN_' + Date.now(),
      },
    });

    await db.product.update({
      where: { id: productId },
      data: { downloads: { increment: 1 } },
    });

    notifyPurchase(userId, product.title, product.titleEn || product.title, product.price).catch(() => {});

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const orders = await db.order.findMany({
      where: { userId: authUser.userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
