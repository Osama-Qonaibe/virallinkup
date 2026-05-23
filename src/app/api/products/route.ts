import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const licenseType = searchParams.get('licenseType');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = { isActive: true };

    if (category && category !== 'all') {
      where.category = category;
    }
    if (licenseType && licenseType !== 'all') {
      where.licenseType = licenseType;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { titleEn: { contains: search } },
        { description: { contains: search } },
        { descriptionEn: { contains: search } },
      ];
    }

    const orderBy: Record<string, string> = sort === 'popular' 
      ? { downloads: 'desc' } 
      : sort === 'priceLow' 
      ? { price: 'asc' } 
      : sort === 'priceHigh' 
      ? { price: 'desc' } 
      : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
