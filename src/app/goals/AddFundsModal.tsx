'use client';

import * as React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAppToast } from '../../hooks/useAppToast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { SerializableFinancialGoal } from './page';

interface AddFundsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    goal: SerializableFinancialGoal;
}

export function AddFundsModal({ isOpen, onClose, onSuccess, goal }: AddFundsModalProps) {
    const [amount, setAmount] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const toast = useAppToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`/api/goals/${goal.id}/add-funds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(amount) }),
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Gagal menambahkan dana.');
            }
            toast.success('Dana berhasil ditambahkan ke celengan!');
            onSuccess();
        } catch (error) {
            const err = error as Error
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Isi Celengan: ${goal.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="amount">Jumlah</label>
                    <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        required
                    />
                </div>
                <div className="flex justify-end pt-2">
                    <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
                    <Button type="submit" className="ml-2" disabled={isLoading}>
                        {isLoading ? <LoadingSpinner size="sm" color="light" /> : 'Simpan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}