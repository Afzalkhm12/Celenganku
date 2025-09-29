'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { InsightCard } from '../../components/ui/InsightCard';
import { useAppToast } from '../../hooks/useAppToast';
import { PlusCircle, Trash2 } from 'lucide-react'; 
import { useRouter } from 'next/navigation';
import { type SerializableFinancialGoal } from './page';
import { AddFundsModal } from './AddFundsModal';
import { type SerializableAccount } from '../dashboard/page'; 

// This is a plain type for use in the client component
interface FinancialTip {
    id: string;
    tip_text: string;
    category: string;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

interface GoalsClientProps {
    initialGoals: SerializableFinancialGoal[];
    initialTips: FinancialTip[];
    accounts: SerializableAccount[]; // NEW PROP
}

export default function GoalsClient({ initialGoals, initialTips, accounts }: GoalsClientProps) {
    const goals = initialGoals;
    const tips = initialTips;
    
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const toast = useAppToast();
    const router = useRouter();

    const [name, setName] = React.useState('');
    const [targetAmount, setTargetAmount] = React.useState('');
    const [targetDate, setTargetDate] = React.useState('');
    const [isAddFundsModalOpen, setIsAddFundsModalOpen] = React.useState(false);
    const [selectedGoal, setSelectedGoal] = React.useState<SerializableFinancialGoal | null>(null);

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, target_amount: parseFloat(targetAmount), target_date: targetDate || null }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Gagal membuat celengan.");
            }
            
            toast.success('Celengan baru berhasil dibuat!');
            setIsModalOpen(false);
            setName(''); setTargetAmount(''); setTargetDate('');
            router.refresh();
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal membuat celengan.';
            toast.error(message);
        }
    };
    
    const handleAddFundsClick = (goal: SerializableFinancialGoal) => {
        setSelectedGoal(goal);
        setIsAddFundsModalOpen(true);
    };

    const handleDeleteGoal = async (id: string, name: string) => {
        if (!window.confirm(`Anda yakin ingin menghapus Celengan "${name}"? Seluruh progres tabungan ini akan hilang.`)) return;
        
        try {
            const response = await fetch(`/api/goals/${id}`, {
                method: 'DELETE',
            });

            if (response.status === 204) {
                toast.success('Celengan berhasil dihapus!');
                router.refresh(); 
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gagal menghapus celengan.');
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal menghapus celengan.';
            toast.error(message);
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
            
            {goals.length === 0 ? (
                 <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                        Anda belum memiliki celengan. Ayo buat satu!
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => {
                        const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                        return (
                            <Card key={goal.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{goal.name}</CardTitle>
                                            <CardDescription>Target: {formatCurrency(goal.target_amount)} {goal.target_date ? `(hingga ${new Date(goal.target_date).toLocaleDateString('id-ID')})` : ''}</CardDescription>
                                        </div>
                                        <div className="flex space-x-1">
                                            {/* Note: Edit button functionality is not implemented in PUT, but the placeholder is here */}
                                            {/* <Button size="icon" variant="ghost" onClick={() => {/* handleEditGoal(goal) } ><Edit className="h-4 w-4" /></Button> */}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteGoal(goal.id, goal.name)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                title="Hapus Celengan"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center font-bold text-lg text-blue-600">{formatCurrency(goal.current_amount)}</div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                    </div>
                                    <div className="text-sm text-gray-500 text-right">{progress.toFixed(1)}% tercapai</div>
                                    <Button className="w-full" size="sm" onClick={() => handleAddFundsClick(goal)}>Isi Celengan</Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
            
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Celengan Baru">
                <form onSubmit={handleCreateGoal} className="space-y-4">
                    <div>
                        <label htmlFor="goalName" className="block text-sm font-medium text-gray-700 mb-1">Nama Tujuan</label>
                        <Input id="goalName" value={name} onChange={e => setName(e.target.value)} placeholder="Dana Darurat, Rumah Impian..." required />
                    </div>
                     <div>
                        <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Target</label>
                        <Input id="targetAmount" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="10000000" required />
                    </div>
                     <div>
                        <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Target (Opsional)</label>
                        <Input id="targetDate" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
                        <Button type="submit" className="ml-2">Buat</Button>
                    </div>
                </form>
            </Modal>

            {selectedGoal && (
                <AddFundsModal
                    isOpen={isAddFundsModalOpen}
                    onClose={() => setIsAddFundsModalOpen(false)}
                    onSuccess={() => {
                        setIsAddFundsModalOpen(false);
                        router.refresh();
                    }}
                    goal={selectedGoal}
                    accounts={accounts} // Meneruskan prop 'accounts'
                />
            )}
        </div>
    );
}