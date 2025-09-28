'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppToast } from '@/hooks/useAppToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function BudgetsPage() {
    const [budgets, setBudgets] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const toast = useAppToast();
    const [date, setDate] = React.useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const fetchBudgets = React.useCallback(async (month: number, year: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/budgets?month=${month}&year=${year}`);
            const data = await response.json();
            setBudgets(data);
        } catch (error) {
            toast.error('Gagal memuat data anggaran.');
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchBudgets(date.month, date.year);
    }, [fetchBudgets, date]);

    const handleBudgetChange = async (categoryId: string, amount: number) => {
        try {
            await fetch('/api/budgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryId, amount, month: date.month, year: date.year }),
            });
            toast.success('Anggaran berhasil diperbarui!');
            fetchBudgets(date.month, date.year);
        } catch (error) {
            toast.error('Gagal memperbarui anggaran.');
        }
    };
    
    if (isLoading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Anggaran Bulan Ini</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((category) => {
                    const budget = category.budgets[0];
                    const budgetAmount = budget ? Number(budget.amount) : 0;
                    const spentAmount = category.spent || 0;
                    const progress = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
                    
                    let progressBarColor = 'bg-blue-500';
                    if (progress > 75) progressBarColor = 'bg-yellow-500';
                    if (progress >= 100) progressBarColor = 'bg-red-500';

                    return (
                        <Card key={category.id}>
                            <CardHeader><CardTitle>{category.name}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Terpakai: {formatCurrency(spentAmount)}</span>
                                        <span>Anggaran: {formatCurrency(budgetAmount)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Input 
                                        type="number" 
                                        defaultValue={budgetAmount}
                                        id={`budget-${category.id}`}
                                        className="flex-1"
                                        placeholder="Set Anggaran"
                                    />
                                    <Button size="sm" onClick={() => {
                                        const input = document.getElementById(`budget-${category.id}`) as HTMLInputElement;
                                        handleBudgetChange(category.id, parseFloat(input.value) || 0);
                                    }}>Simpan</Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
