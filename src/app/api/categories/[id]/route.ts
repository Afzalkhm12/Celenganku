import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import prisma from '../../../../lib/prisma';
import { z } from 'zod';

const CategoryUpdateSchema = z.object({
  name: z.string().min(1, 'Nama kategori harus diisi').optional(),
  type: z.enum(['income', 'expense']).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

// GET /api/categories/[id] - Get specific category
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // CRITICAL FIX: Await params - it's a Promise in Next.js 15
  const params = await context.params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const category = await prisma.category.findFirst({
      where: {
        id: params.id,
        user_id: session.user.id,
      },
      include: {
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // CRITICAL FIX: Await params - it's a Promise in Next.js 15
  const params = await context.params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CategoryUpdateSchema.parse(body);

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: params.id,
        user_id: session.user.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui kategori' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // CRITICAL FIX: Await params - it's a Promise in Next.js 15
  const params = await context.params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: params.id,
        user_id: session.user.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if category has transactions
    const transactionCount = await prisma.transaction.count({
      where: { category_id: params.id },
    });

    if (transactionCount > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus kategori yang masih digunakan' },
        { status: 400 }
      );
    }

    // Check if category has budgets
    const budgetCount = await prisma.budget.count({
      where: { category_id: params.id },
    });

    if (budgetCount > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus kategori yang memiliki budget' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus kategori' },
      { status: 500 }
    );
  }
}