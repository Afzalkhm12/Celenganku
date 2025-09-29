'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppToast } from '../../hooks/useAppToast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface SerializableBudget {
    id: string;
    amount: number;
    month: number;
    year: number;
}

interface SerializableCategoryWithBudget {
    id: string;
    name: string;
    budgets: SerializableBudget[];
    spent: number;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function BudgetsPage() {
    const [budgetsData, setBudgetsData] = React.useState<SerializableCategoryWithBudget[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [pendingBudgets, setPendingBudgets] = React.useState<Record<string, number>>({});
    const toast = useAppToast();
    
    const today = new Date();
    const initialMonth = today.getMonth() + 1;
    const initialYear = today.getFullYear();

    const [date, setDate] = React.useState({
        month: initialMonth,
        year: initialYear,
    });

    const formatMonthForInput = (year: number, month: number) => {
        return `${year}-${String(month).padStart(2, '0')}`;
    };

    // FIX: Refactor fetchBudgets untuk menggunakan state 'date' secara langsung dan menjadikannya dependent pada 'date'
    const fetchBudgets = React.useCallback(async () => { 
        setIsLoading(true);
        setPendingBudgets({});
        const { month, year } = date;

        try {
            const response = await fetch(`/api/budgets?month=${month}&year=${year}`);
            if (!response.ok) throw new Error('Gagal memuat data anggaran.');
            const data: SerializableCategoryWithBudget[] = await response.json();
            
            const initialPending = data.reduce((acc, category) => {
                const budget = category.budgets[0];
                acc[category.id] = budget ? budget.amount : 0;
                return acc;
            }, {} as Record<string, number>);

            setBudgetsData(data);
            setPendingBudgets(initialPending);
        } catch (err) {
            const error = err as Error;
            toast.error(error.message || 'Gagal memuat data anggaran.');
            setBudgetsData([]);
        } finally {
            setIsLoading(false);
        }
    }, [toast, date.month, date.year]); // Dependency harus menyertakan month dan year

    React.useEffect(() => {
        fetchBudgets(); // Panggil tanpa argumen
    }, [fetchBudgets]);

    const handleInputChange = (categoryId: string, value: string) => {
        const numericValue = parseFloat(value);
        setPendingBudgets(prev => ({
            ...prev,
            [categoryId]: isNaN(numericValue) || numericValue < 0 ? 0 : numericValue
        }));
    };

    const handleBudgetSave = async (categoryId: string) => {
        const amount = pendingBudgets[categoryId] ?? 0;

        if (amount < 0) {
            toast.error('Anggaran tidak boleh negatif.');
            return;
        }

        try {
            const response = await fetch('/api/budgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    categoryId, 
                    amount, 
                    month: date.month, 
                    year: date.year 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gagal menyimpan anggaran.');
            }

            toast.success('Anggaran berhasil diperbarui!');
            fetchBudgets(); // Muat ulang data
        } catch (err) {
            const error = err as Error
            toast.error(error.message || 'Gagal memperbarui anggaran.');
            fetchBudgets();
        }
    };
    
    if (isLoading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>;

    const formattedDateString = new Date(date.year, date.month - 1).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });

    return (
        <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold">Anggaran Bulan {formattedDateString}</h1>
                <div className="flex items-center gap-2">
                    <Input
                        label="Pilih Bulan"
                        type="month"
                        className="text-black"
                        value={formatMonthForInput(date.year, date.month)}
                        onChange={(e) => {
                            const [year, month] = e.target.value.split('-');
                            if (year && month) {
                                setDate({ year: parseInt(year), month: parseInt(month) });
                            }
                        }}
                    />
                </div>
            </div>
            {budgetsData.length === 0 && !isLoading ? (
                <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                        Anda belum memiliki kategori pengeluaran. Tambahkan di halaman Kategori untuk memulai penganggaran.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgetsData.map((category) => {
                        const budgetAmount = pendingBudgets[category.id] ?? 0;
                        const spentAmount = category.spent || 0;
                        const progress = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
                        
                        let progressBarColor = 'bg-blue-500';
                        if (progress > 85) progressBarColor = 'bg-yellow-500'; 
                        if (progress >= 100) progressBarColor = 'bg-red-500';

                        const isOverBudget = spentAmount > budgetAmount && budgetAmount > 0;

                        return (
                            <Card key={category.id}>
                                <CardHeader>
                                    <CardTitle>{category.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span className={isOverBudget ? 'text-red-600 font-semibold' : ''}>
                                                Terpakai: {formatCurrency(spentAmount)}
                                            </span>
                                            <span>Anggaran: {formatCurrency(budgetAmount)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500`} 
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            ></div>
                                        </div>
                                        {isOverBudget && (
                                            <p className="mt-1 text-xs text-red-500 font-medium">Melebihi anggaran sebesar {formatCurrency(spentAmount - budgetAmount)}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Input 
                                            type="number" 
                                            value={budgetAmount}
                                            onChange={(e) => handleInputChange(category.id, e.target.value)}
                                            className="flex-1"
                                            placeholder="Set Anggaran"
                                            min="0"
                                            step="0.01"
                                        />
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleBudgetSave(category.id)}
                                            disabled={isLoading}
                                        >
                                            Simpan
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}