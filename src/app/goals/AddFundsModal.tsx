'use client';

import * as React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAppToast } from '../../hooks/useAppToast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { SerializableFinancialGoal } from './page';
import { Select, SelectOption } from '../../components/ui/Select'; 
import { type SerializableAccount } from '../dashboard/page'; 

interface AddFundsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    goal: SerializableFinancialGoal;
    accounts: SerializableAccount[]; 
}

export function AddFundsModal({ isOpen, onClose, onSuccess, goal, accounts }: AddFundsModalProps) {
    const [amount, setAmount] = React.useState('');
    const [accountId, setAccountId] = React.useState(''); 
    const [isLoading, setIsLoading] = React.useState(false);
    const toast = useAppToast();
    
    // FIX: Mapping SerializableAccount[] (id, name) to SelectOption[] (value, label)
    // acc.id dan acc.name adalah properti yang ada di SerializableAccount.
    const accountOptions: SelectOption[] = accounts.map(acc => ({ value: acc.id, label: acc.name }));

    // Set default account when opening
    React.useEffect(() => {
        if (isOpen && accounts.length > 0) {
             setAccountId(accounts[0].id); // Menggunakan acc.id (yang sama dengan value)
        }
    }, [isOpen, accounts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast.error('Jumlah harus angka positif.');
            setIsLoading(false);
            return;
        }

        if (!accountId) { 
             toast.error('Akun sumber dana harus dipilih.');
             setIsLoading(false);
             return;
        }

        try {
            const response = await fetch(`/api/goals/${goal.id}/add-funds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    amount: numericAmount, 
                    accountId 
                }),
            });
            if (!response.ok) {
                const errorData = await response.text();
                // Menangani pesan error dari server, termasuk error rollback transaksi
                const errorMessage = errorData.includes('Source account not found') ? 'Akun sumber dana tidak ditemukan atau saldo tidak mencukupi.' : errorData || 'Gagal menambahkan dana.';
                throw new Error(errorMessage);
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
                 <Select 
                    label="Ambil Dana Dari Akun"
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    options={accountOptions}
                    placeholder={accountOptions.length === 0 ? "Anda belum memiliki akun." : "Pilih Akun"}
                    required
                    disabled={accountOptions.length === 0 || isLoading}
                />
                
                <div>
                    <label htmlFor="amount">Jumlah</label>
                    <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        required
                        min="0.01"
                        step="0.01"
                        disabled={isLoading}
                    />
                </div>
                <div className="flex justify-end pt-2">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Batal</Button>
                    <Button type="submit" className="ml-2" disabled={isLoading}>
                        {isLoading ? <LoadingSpinner size="sm" color="light" /> : 'Simpan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}