import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import prisma from '../../../lib/prisma';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  
  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

  try {
    const categories = await prisma.category.findMany({
      where: { user_id: userId, type: 'EXPENSE' },
      include: {
        budgets: { where: { year, month } },
      },
    });

    const transactionsSum = await prisma.transaction.groupBy({
      by: ['category_id'],
      where: {
        category: { user_id: userId, type: 'EXPENSE' },
        transaction_date: { 
          gte: new Date(year, month - 1, 1), 
          lt: new Date(year, month, 1) 
        }
      },
      _sum: { amount: true }
    })
    
    const spentMap = new Map(transactionsSum.map(t => [t.category_id, t._sum.amount?.toNumber() ?? 0]));

    const result = categories.map(cat => ({
      ...cat,
      spent: spentMap.get(cat.id) ?? 0
    }))

    return NextResponse.json(result);
  } catch (error) {
    console.error('[BUDGETS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  const userId = session.user.id;

  try {
    const { categoryId, amount, month, year } = await request.json();
    if (!categoryId || amount == null || !month || !year) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

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

    return NextResponse.json(budget);
  } catch (error) {
    console.error('[BUDGETS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}