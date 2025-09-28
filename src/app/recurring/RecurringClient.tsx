'use client';

import * as React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PlusCircle } from 'lucide-react';
import { type SerializableRecurringTransaction } from './page';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

interface RecurringClientProps {
    initialRecurring: SerializableRecurringTransaction[];
}

export default function RecurringClient({ initialRecurring }: RecurringClientProps) {
    // Data sudah disediakan oleh server, tidak perlu state loading
    const recurring = initialRecurring;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Transaksi Rutin</h1>
                <Button disabled><PlusCircle className="mr-2 h-4 w-4" /> Atur Baru (TBD)</Button>
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
                                {recurring.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
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
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}