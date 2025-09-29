import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import prisma from '../../../lib/prisma';
import { z } from 'zod';

const CategorySchema = z.object({
  name: z.string().min(1, 'Nama kategori harus diisi'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Tipe kategori harus diisi' }),
});

// GET /api/categories - Get all categories for authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where: any = { user_id: session.user.id };
    if (type && (type === 'INCOME' || type === 'EXPENSE')) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            transactions: true,
            budgets: true,
          }
        }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CategorySchema.parse(body);

    // Check if category name already exists for this user and type
    const existingCategory = await prisma.category.findFirst({
      where: {
        user_id: session.user.id,
        name: validatedData.name,
        type: validatedData.type,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Kategori dengan nama ini sudah ada untuk tipe yang sama' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        user_id: session.user.id,
      },
      include: {
        _count: {
          select: {
            transactions: true,
            budgets: true,
          }
        }
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Gagal membuat kategori' },
      { status: 500 }
    );
  }
}