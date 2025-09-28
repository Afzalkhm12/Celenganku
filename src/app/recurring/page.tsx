'use client';

import * as React from 'react';
import { Card, CardContent } from '../../components/ui/Card'; // FIX: Hapus impor yang tidak digunakan
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAppToast } from '../../hooks/useAppToast';
import { PlusCircle } from 'lucide-react';
import { RecurringTransaction, Category, Account } from '@prisma/client';

// FIX: Definisikan tipe data yang lebih spesifik
type RecurringTransactionWithDetails = RecurringTransaction & {
    category: Category;
    account: Account;
};

export default function RecurringPage() {
    const [recurring, setRecurring] = React.useState<RecurringTransactionWithDetails[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const toast = useAppToast();

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/recurring');
                const data = await response.json();
                setRecurring(data);
            } catch (error) {
                console.error(error); // FIX: Gunakan 'error'
                toast.error('Gagal memuat transaksi rutin.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [toast]);

    if (isLoading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Transaksi Rutin</h1>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Atur Baru</Button>
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
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recurring.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {Number(item.amount).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.frequency}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.next_occurrence_date).toLocaleDateString('id-ID')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}