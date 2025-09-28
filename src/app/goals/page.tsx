'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { InsightCard } from '../../components/ui/InsightCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAppToast } from '../../hooks/useAppToast';
import { PlusCircle } from 'lucide-react';
import { FinancialGoal, FinancialTip } from '@prisma/client';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function GoalsPage() {
    const [goals, setGoals] = React.useState<FinancialGoal[]>([]);
    const [tips, setTips] = React.useState<FinancialTip[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const toast = useAppToast();

    const [name, setName] = React.useState('');
    const [targetAmount, setTargetAmount] = React.useState('');
    const [targetDate, setTargetDate] = React.useState('');

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/goals');
            const { goals, tips } = await response.json();
            setGoals(goals);
            setTips(tips);
        } catch (error) {
            console.error(error);
            toast.error('Gagal memuat data.');
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, target_amount: parseFloat(targetAmount), target_date: targetDate }),
            });
            toast.success('Celengan baru berhasil dibuat!');
            setIsModalOpen(false);
            fetchData();
            setName(''); setTargetAmount(''); setTargetDate('');
        } catch (error) {
            console.error(error);
            toast.error('Gagal membuat celengan.');
        }
    };
    
    const getSmartTip = React.useMemo(() => {
        if (goals.length === 0 || tips.length === 0) return null;
        const goalName = goals[0].name.toLowerCase();
        if (goalName.includes('rumah') || goalName.includes('mobil')) {
            return tips.find(t => t.category === 'DEBT') || tips.find(t => t.category === 'SAVING');
        }
        return tips.find(t => t.category === 'SAVING');
    }, [goals, tips]);

    if (isLoading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Celengan Digital-ku</h1>
                <Button onClick={() => setIsModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Buat Celengan Baru</Button>
            </div>

            {getSmartTip && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Tips Cerdas Untukmu</h2>
                    <InsightCard variant="info">{getSmartTip.tip_text}</InsightCard>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(goal => {
                    const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
                    return (
                        <Card key={goal.id}>
                            <CardHeader>
                                <CardTitle>{goal.name}</CardTitle>
                                <CardDescription>Target: {formatCurrency(Number(goal.target_amount))}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center font-bold text-lg text-blue-600">{formatCurrency(Number(goal.current_amount))}</div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                </div>
                                <div className="text-sm text-gray-500 text-right">{progress.toFixed(1)}% tercapai</div>
                                <Button className="w-full" size="sm" disabled>Isi Celengan (TBD)</Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Celengan Baru">
                <form onSubmit={handleCreateGoal} className="space-y-4">
                    <div>
                        <label htmlFor="goalName">Nama Tujuan</label>
                        <Input id="goalName" value={name} onChange={e => setName(e.target.value)} placeholder="Dana Darurat, Rumah Impian..." required />
                    </div>
                     <div>
                        <label htmlFor="targetAmount">Jumlah Target</label>
                        <Input id="targetAmount" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="10000000" required />
                    </div>
                     <div>
                        <label htmlFor="targetDate">Tanggal Target</label>
                        <Input id="targetDate" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
                        <Button type="submit" className="ml-2">Buat</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}