'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { InsightCard } from '../ui/InsightCard';
import { Button } from '../ui/Button';
import { DollarSign, TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';
import TransactionFormModal from '../transactions/TransactionFormModal';
import DashboardCharts from './DashboardCharts';
import type { DashboardData } from '../../app/dashboard/page';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const refreshData = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dasbor</h1>
            <p className="text-gray-600">Selamat datang kembali, {initialData.userName || 'Pengguna'}!</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Tambah Transaksi
          </Button>
        </header>

        <div className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Insight Bulan Ini</h2>
          {initialData.insights.length > 0 ? (
            initialData.insights.map((insight, index) => (
              <InsightCard key={index} variant={insight.variant}>
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
              <div className="text-2xl font-bold">{formatCurrency(initialData.totalIncome)}</div>
              <p className="text-xs text-gray-500">Bulan ini</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(initialData.totalExpenses)}</div>
              <p className="text-xs text-gray-500">Bulan ini</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tabungan</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${initialData.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(initialData.savings)}
              </div>
              <p className="text-xs text-gray-500">Bulan ini</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Transaksi Terakhir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {initialData.recentTransactions.length > 0 ? initialData.recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{tx.category.name}</p>
                        <p className="text-sm text-gray-500">{new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
                      </div>
                      <p className={`font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(Number(tx.amount))}
                      </p>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 text-center py-4">Belum ada transaksi bulan ini.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <DashboardCharts />
          </div>
        </div>

        <TransactionFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            refreshData();
          }}
          accounts={initialData.accounts}
          categories={initialData.categories}
        />
      </div>
    </div>
  );
}
