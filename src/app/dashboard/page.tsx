import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { InsightCard } from '@/components/ui/InsightCard';
import SignOutButton from '@/components/auth/SignOutButton';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
// Impor tipe-tipe dari Prisma Client
import { Transaction, Category, Prisma } from '@prisma/client';

// Tipe helper untuk transaksi yang menyertakan kategori
type TransactionWithCategory = Transaction & {
  category: Category;
};

// Fungsi pembantu untuk format mata uang
const formatCurrency = (amount: number | Prisma.Decimal) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount));
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const transactions: TransactionWithCategory[] = await prisma.transaction.findMany({
    where: {
      account: {
        user_id: userId,
      },
      transaction_date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      transaction_date: 'desc',
    }
  });

  let totalIncome: number = 0;
  let totalExpenses: number = 0;
  const expenseByCategory: { [key: string]: number } = {};

  transactions.forEach((tx: TransactionWithCategory) => {
    if (tx.type === 'INCOME') {
      totalIncome += Number(tx.amount);
    } else if (tx.type === 'EXPENSE') {
      totalExpenses += Number(tx.amount);
      const categoryName = tx.category.name;
      if (expenseByCategory[categoryName]) {
        expenseByCategory[categoryName] += Number(tx.amount);
      } else {
        expenseByCategory[categoryName] = Number(tx.amount);
      }
    }
  });

  const savings = totalIncome - totalExpenses;
  const insights = [];

  const savingsRate = totalIncome > 0 ? savings / totalIncome : 0;
  if (savingsRate >= 0.2) {
    insights.push({
      variant: 'positive',
      text: `Kerja bagus! Bulan ini Anda berhasil menabung lebih dari ${Math.round(savingsRate * 100)}% dari pendapatan Anda.`,
    });
  }

  if (totalExpenses > 0 && Object.keys(expenseByCategory).length > 0) {
    const highestSpendingCategory = Object.entries(expenseByCategory).reduce((a, b) => a[1] > b[1] ? a : b);
    const categoryName = highestSpendingCategory[0];
    const categoryAmount = highestSpendingCategory[1];
    const spendingPercentage = (categoryAmount / totalExpenses) * 100;

    if (spendingPercentage > 30) {
      insights.push({
        variant: 'warning',
        text: `Perhatian: Pengeluaran untuk kategori "${categoryName}" mencapai ${Math.round(spendingPercentage)}% dari total pengeluaran Anda bulan ini.`,
      });
    }
  }
  
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-3xl font-bold text-gray-800">Dasbor</h1>
             <p className="text-gray-600">Selamat datang kembali, {session.user.name}!</p>
          </div>
          <SignOutButton />
        </header>

        <div className="mb-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Insight Bulan Ini</h2>
            {insights.length > 0 ? (
                insights.map((insight, index) => (
                    <InsightCard key={index} variant={insight.variant as 'positive' | 'warning' | 'info'}>
                        {insight.text}
                    </InsightCard>
                ))
            ) : (
                <InsightCard variant="info">
                    Belum ada insight yang tersedia. Terus catat transaksimu!
                </InsightCard>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
                    <p className="text-xs text-gray-500">Bulan ini</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                     <p className="text-xs text-gray-500">Bulan ini</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tabungan</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(savings)}
                    </div>
                     <p className="text-xs text-gray-500">Bulan ini</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Transaksi Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentTransactions.length > 0 ? recentTransactions.map((tx: TransactionWithCategory) => (
                        <div key={tx.id} className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">{tx.category.name}</p>
                                <p className="text-sm text-gray-500">{new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
                            </div>
                            <p className={`font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                            </p>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-500 text-center py-4">Belum ada transaksi bulan ini.</p>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}