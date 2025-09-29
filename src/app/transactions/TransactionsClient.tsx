'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type SerializableTransaction } from './page';
import TransactionFormModal from '../../components/transactions/TransactionFormModal';
import { type Category } from '@prisma/client';
import { type SerializableAccount } from '../dashboard/page';
import { useAppToast } from '../../hooks/useAppToast';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

interface TransactionsClientProps {
  initialTransactions: SerializableTransaction[];
  totalTransactions: number;
  accounts: SerializableAccount[];
  categories: Category[];
  currentPage: number;
}

export function TransactionsClient({
  initialTransactions,
  totalTransactions,
  accounts,
  categories,
  currentPage,
}: TransactionsClientProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState<SerializableTransaction | null>(null);
  const router = useRouter();
  const toast = useAppToast();

  const totalPages = Math.ceil(totalTransactions / 10);

  const handleEdit = (tx: SerializableTransaction) => {
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Gagal menghapus transaksi.');
        toast.success('Transaksi berhasil dihapus!');
        router.refresh();
      } catch (error) {
        const err = error as Error;
        toast.error(err.message);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/transactions?page=${newPage}`);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Semua Transaksi</h1>
        <Button onClick={() => {
          setSelectedTransaction(null);
          setIsModalOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Transaksi
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akun</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {initialTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.transaction_date).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.category.name}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.account.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(tx)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(tx.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="space-x-2">
              <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>Sebelumnya</Button>
              <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Berikutnya</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {isModalOpen && (
        <TransactionFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            router.refresh();
          }}
          accounts={accounts}
          categories={categories}
          transaction={selectedTransaction}
        />
      )}
    </div>
  );
}