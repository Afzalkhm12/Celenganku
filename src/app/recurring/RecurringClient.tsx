'use client';

import * as React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { type SerializableRecurringTransaction } from './page';
import { RecurringTransactionModal } from './ReccuringTransactionModal';
import { Category, Account as PrismaAccount } from '@prisma/client';
import { useAppToast } from '../../hooks/useAppToast';
import { useRouter } from 'next/navigation';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

type SerializableAccount = Omit<PrismaAccount, 'balance'> & {
    balance: number;
};

interface RecurringClientProps {
    initialRecurring: SerializableRecurringTransaction[];
    accounts: SerializableAccount[];
    categories: Category[];
}

export default function RecurringClient({ initialRecurring, accounts, categories }: RecurringClientProps) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const recurring = initialRecurring;
    const toast = useAppToast();
    const router = useRouter();

    const refreshData = () => {
        router.refresh(); // Menggunakan router.refresh() untuk pembaruan data yang benar
    };

    const handleDeleteRecurring = async (id: string, description: string) => {
        if (!window.confirm(`Anda yakin ingin menghapus transaksi rutin "${description}"? Transaksi yang sudah tercatat (sudah terjadi) tidak akan ikut terhapus.`)) return;
        
        try {
            const response = await fetch(`/api/recurring/${id}`, {
                method: 'DELETE',
            });

            if (response.status === 204) {
                toast.success('Transaksi rutin berhasil dihapus.');
                refreshData(); 
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Gagal menghapus transaksi rutin.');
            }
        } catch { // FIX: Mengganti catch(_error)
            toast.error('Terjadi kesalahan saat menghapus transaksi rutin.');
        }
    };


    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Transaksi Rutin</h1>
                <Button onClick={() => setIsModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Atur Baru</Button>
            </div>
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frekuensi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jadwal Berikutnya</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recurring.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                            Anda belum memiliki transaksi rutin.
                                        </td>
                                    </tr>
                                ) : (
                                    recurring.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.description}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.type === 'INCOME' ? '+' : '-'} {formatCurrency(item.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.frequency.toLowerCase()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.next_occurrence_date).toLocaleDateString('id-ID')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteRecurring(item.id, item.description || item.category.name)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    title="Hapus Transaksi Rutin"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            <RecurringTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    refreshData();
                }}
                accounts={accounts}
                categories={categories}
            />
        </div>
    );
}