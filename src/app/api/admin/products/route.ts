import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (id) {
      const product = await db.product.update({
        where: { id },
        data: {
          title: data.title,
          titleEn: data.titleEn,
          description: data.description,
          descriptionEn: data.descriptionEn,
          price: parseFloat(data.price),
          category: data.category,
          licenseType: data.licenseType,
          features: JSON.stringify(data.features || []),
          thumbnailUrl: data.thumbnailUrl,
          fileUrl: data.fileUrl,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
      return NextResponse.json(product);
    } else {
      const product = await db.product.create({
        data: {
          title: data.title,
          titleEn: data.titleEn || null,
          description: data.description,
          descriptionEn: data.descriptionEn || null,
          price: parseFloat(data.price),
          category: data.category || null,
          licenseType: data.licenseType || 'PERSONAL',
          features: JSON.stringify(data.features || []),
          thumbnailUrl: data.thumbnailUrl || null,
          fileUrl: data.fileUrl || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
      return NextResponse.json(product);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
