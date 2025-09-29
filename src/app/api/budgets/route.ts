import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import prisma from '../../../lib/prisma';
import { z } from 'zod'; 

// Schema for POST request: Ensure data integrity
const BudgetSchema = z.object({
  categoryId: z.string().min(1, 'Category ID harus disediakan'),
  amount: z.number().min(0, 'Jumlah tidak boleh negatif'),
  month: z.number().int().min(1).max(12, 'Bulan harus antara 1 sampai 12'),
  year: z.number().int().min(2000, 'Tahun tidak valid'),
});

// GET /api/budgets - Get all expense categories with current budget and spent amount
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }); // Pastikan balasan 401 berupa JSON
  
  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  
  // Amankan parsing input
  const rawYear = searchParams.get('year');
  const rawMonth = searchParams.get('month');

  const year = parseInt(rawYear || new Date().getFullYear().toString());
  const month = parseInt(rawMonth || (new Date().getMonth() + 1).toString());

  // Validasi dasar parameter date
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Parameter tahun atau bulan tidak valid.' }, { status: 400 });
  }

  try {
    // 1. Get all EXPENSE categories for the user
    const categories = await prisma.category.findMany({
      where: { user_id: userId, type: 'EXPENSE' },
      include: {
        budgets: { where: { year, month } },
      },
    });

    // 2. Calculate total spent (transactions) for the period by category
    const transactionsSum = await prisma.transaction.groupBy({
      by: ['category_id'],
      where: {
        account: { user_id: userId },
        type: 'EXPENSE',
        transaction_date: { 
          gte: new Date(year, month - 1, 1), 
          lt: new Date(year, month, 1) 
        }
      },
      _sum: { amount: true }
    });
    
    // Map spent amounts for easy lookup
    const spentMap = new Map(transactionsSum.map(t => [t.category_id, t._sum.amount?.toNumber() ?? 0]));

    // 3. Combine results
    const result = categories.map(cat => ({
      ...cat,
      // Convert budget amount from Decimal to number
      budgets: cat.budgets.map(b => ({ ...b, amount: b.amount.toNumber() })),
      // Get spent amount, default to 0
      spent: spentMap.get(cat.id) ?? 0
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('[BUDGETS_GET_INTERNAL_ERROR]', error);
    // Return structured error response
    return NextResponse.json({ error: 'Gagal mengambil data anggaran. Kesalahan internal server.' }, { status: 500 });
  }
}

// POST /api/budgets - Create or update new budget (upsert)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }); 
  const userId = session.user.id;

  try {
    const body = await request.json();
    // Validate request body using Zod schema
    const validatedData = BudgetSchema.parse(body);

    const { categoryId, amount, month, year } = validatedData;
    
    const budget = await prisma.budget.upsert({
      where: {
        user_id_category_id_year_month: {
          user_id: userId,
          category_id: categoryId,
          year,
          month,
        },
      },
      update: { amount },
      create: { user_id: userId, category_id: categoryId, amount, month, year },
    });
    
    const serializableBudget = {
      ...budget,
      amount: budget.amount.toNumber(),
    };

    return NextResponse.json(serializableBudget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return specific Zod validation error message
      return NextResponse.json({ error: `Data tidak valid: ${error.issues[0].message}` }, { status: 400 });
    }
    console.error('[BUDGETS_POST_INTERNAL_ERROR]', error);
    return NextResponse.json({ error: 'Gagal menyimpan anggaran. Kesalahan internal server.' }, { status: 500 });
  }
}