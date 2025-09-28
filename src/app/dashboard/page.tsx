import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import prisma from '../../lib/prisma';
import DashboardClient from '../../components/dashboard/DashboardClient';
import { type Account, type Category, type Transaction } from '@prisma/client';

export type DashboardData = {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  accounts: Account[];
  categories: Category[];
  recentTransactions: (Transaction & { category: { name: string }, account: { name: string } })[];
  insights: { variant: 'positive' | 'warning' | 'info'; text: string }[];
  userName: string | null | undefined;
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [transactions, accounts, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        account: { user_id: userId },
        transaction_date: { gte: startDate, lte: endDate },
      },
      include: { category: { select: { name: true } }, account: { select: { name: true } } },
      orderBy: { transaction_date: 'desc' },
    }),
    prisma.account.findMany({ where: { user_id: userId } }),
    prisma.category.findMany({ where: { user_id: userId } }),
  ]);
  
  let totalIncome = 0;
  let totalExpenses = 0;
  const expenseByCategory: { [key: string]: number } = {};

  transactions.forEach((tx) => {
    const amount = Number(tx.amount);
    if (tx.type === 'INCOME') {
      totalIncome += amount;
    } else if (tx.type === 'EXPENSE') {
      totalExpenses += amount;
      const categoryName = tx.category.name;
      expenseByCategory[categoryName] = (expenseByCategory[categoryName] || 0) + amount;
    }
  });

  const savings = totalIncome - totalExpenses;
  const insights: DashboardData['insights'] = [];

  if (totalIncome > 0) {
    const savingsRate = savings / totalIncome;
    if (savingsRate >= 0.2) {
      insights.push({
        variant: 'positive',
        text: `Kerja bagus! Bulan ini Anda berhasil menabung lebih dari ${(savingsRate * 100).toFixed(0)}% dari pendapatan Anda.`,
      });
    }
  }

  if (totalExpenses > 0 && Object.keys(expenseByCategory).length > 0) {
    const highestSpendingCategory = Object.entries(expenseByCategory).reduce((a, b) => a[1] > b[1] ? a : b);
    const [categoryName, categoryAmount] = highestSpendingCategory;
    const spendingPercentage = (categoryAmount / totalExpenses) * 100;
    
    if (spendingPercentage > 30) {
      insights.push({
        variant: 'warning',
        text: `Perhatian: Pengeluaran untuk kategori "${categoryName}" mencapai ${spendingPercentage.toFixed(0)}% dari total pengeluaran Anda bulan ini.`,
      });
    }
  }

  const dashboardData: DashboardData = {
    totalIncome,
    totalExpenses,
    savings,
    accounts,
    categories,
    recentTransactions: transactions.slice(0, 5),
    insights,
    userName: session.user.name,
  };

  return <DashboardClient initialData={dashboardData} />;
}