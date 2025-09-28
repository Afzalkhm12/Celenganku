import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Pie Chart Data (This Month)
    const now = new Date();
    const startDateThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDateThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expenseBreakdown = await prisma.transaction.groupBy({
      by: ['category_id'],
      where: {
        account: { user_id: userId },
        type: 'EXPENSE',
        transaction_date: {
          gte: startDateThisMonth,
          lte: endDateThisMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const categoryIds = expenseBreakdown.map(item => item.category_id);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
    const pieChartData = expenseBreakdown.map(item => ({
      name: categoryMap.get(item.category_id) || 'Lainnya',
      value: item._sum.amount?.toNumber() || 0,
    }));

    // Bar Chart Data (Last 6 Months)
    const barChartDataPromises = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.toLocaleString('id-ID', { month: 'short' });
        const year = d.getFullYear();
        const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
        const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

        return prisma.transaction.groupBy({
            by: ['type'],
            where: {
                account: { user_id: userId },
                transaction_date: { gte: firstDay, lte: lastDay },
            },
            _sum: { amount: true },
        }).then(monthlyData => {
            const result = { name: `${month} '${String(year).slice(-2)}`, Pemasukan: 0, Pengeluaran: 0 };
            monthlyData.forEach(d => {
                if (d.type === 'INCOME') result.Pemasukan = d._sum.amount?.toNumber() ?? 0;
                else if (d.type === 'EXPENSE') result.Pengeluaran = d._sum.amount?.toNumber() ?? 0;
            });
            return result;
        });
    });
    const barChartData = (await Promise.all(barChartDataPromises)).reverse();


    return NextResponse.json({ pieChartData, barChartData });
  } catch (error) {
    console.error('[CHARTS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}