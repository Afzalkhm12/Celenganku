'use client';

import * as React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select, SelectOption } from '../../components/ui/Select'; 
import { Button } from '../../components/ui/Button';
import { useAppToast } from '../../hooks/useAppToast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Category } from '@prisma/client';
import { type SerializableAccount } from '../../app/dashboard/page';

interface RecurringTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: SerializableAccount[];
  categories: Category[];
}

const frequencyOptions: SelectOption[] = [
    { value: 'DAILY', label: 'Harian' },
    { value: 'WEEKLY', label: 'Mingguan' },
    { value: 'MONTHLY', label: 'Bulanan' },
];

export function RecurringTransactionModal({ isOpen, onClose, onSuccess, accounts, categories }: RecurringTransactionModalProps) {
    const [type, setType] = React.useState<'EXPENSE' | 'INCOME'>('EXPENSE');
    const [amount, setAmount] = React.useState('');
    const [categoryId, setCategoryId] = React.useState('');
    const [accountId, setAccountId] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [frequency, setFrequency] = React.useState(frequencyOptions[2].value);
    const [startDate, setStartDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const toast = useAppToast();

    const filteredCategories = React.useMemo(() => categories.filter(c => c.type === type), [categories, type]);

    const categoryOptions: SelectOption[] = filteredCategories.map(cat => ({ value: cat.id, label: cat.name }));
    const accountOptions: SelectOption[] = accounts.map(acc => ({ value: acc.id, label: acc.name }));

    // FIX: Reset form state when modal opens/type changes
    React.useEffect(() => {
        if (isOpen) {
            // Set default category ID
            if (categoryOptions.length > 0) {
                setCategoryId(categoryOptions[0].value);
            } else {
                setCategoryId(''); 
            }

            // Set default account ID
            if (accountOptions.length > 0 && !accountId) {
                setAccountId(accountOptions[0].value);
            }
            // Reset amount, description, dates when switching type or opening modal
            setAmount('');
            setDescription('');
            setFrequency(frequencyOptions[2].value);
            setStartDate(new Date().toISOString().split('T')[0]);
            setEndDate('');
        }
        // Dependency array: includes all necessary external values
    }, [type, isOpen, categoryOptions.length, accountOptions.length, accountId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast.error('Jumlah harus angka positif.');
            setIsLoading(false);
            return;
        }
        if (!categoryId) {
             toast.error('Kategori harus dipilih.');
            setIsLoading(false);
            return;
        }
        if (!accountId) {
             toast.error('Akun harus dipilih.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/recurring', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  amount: numericAmount, 
                  type,
                  categoryId,
                  accountId,
                  description,
                  frequency,
                  start_date: startDate,
                  end_date: endDate || null,
                }),
              });

              if (response.ok) {
                toast.success('Transaksi rutin berhasil ditambahkan!');
                // Reset form state on success
                setAmount('');
                setDescription('');
                setFrequency(frequencyOptions[2].value);
                setStartDate(new Date().toISOString().split('T')[0]);
                setEndDate('');
                
                onSuccess();
              } else {
                const errorData = await response.text();
                toast.error(errorData || 'Gagal menambahkan transaksi rutin.');
              }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan yang tidak terduga.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tambah Transaksi Rutin">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`w-full px-4 py-2 text-sm font-medium border rounded-l-lg ${type === 'EXPENSE' ? 'bg-red-500 text-white border-red-500 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`w-full px-4 py-2 text-sm font-medium border rounded-r-lg -ml-px ${type === 'INCOME' ? 'bg-green-500 text-white border-green-500 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                Pemasukan
              </button>
            </div>

            <Input 
                label="Jumlah"
                id="amount" 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="0" 
                required 
                min="0.01"
                step="0.01"
            />

            <Select 
                label={`Kategori ${type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}`}
                id="category"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                options={categoryOptions}
                placeholder={categoryOptions.length === 0 ? `Tidak ada kategori ${type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}` : "Pilih Kategori"}
                required
                disabled={categoryOptions.length === 0}
            />
            
            <Select 
                label={type === 'INCOME' ? 'Masuk ke Akun' : 'Diambil dari Akun'}
                id="account"
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                options={accountOptions}
                placeholder={accountOptions.length === 0 ? "Anda belum memiliki akun." : "Pilih Akun"}
                required
                disabled={accountOptions.length === 0}
            />

            <Input 
                label="Deskripsi (Opsional)"
                id="description" 
                type="text" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Contoh: Gaji Bulanan" 
            />
            
            <Select
                label="Frekuensi"
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                options={frequencyOptions}
                required
            />

            <Input 
                label="Tanggal Mulai"
                id="start_date" 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                required 
            />
            
            <Input 
                label="Tanggal Berakhir (Opsional)"
                id="end_date" 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
            />


            <div className="flex justify-end pt-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Batal</Button>
              <Button type="submit" className="ml-2" disabled={isLoading || !categoryId || !accountId}>
                {isLoading ? <LoadingSpinner size="sm" color="light" /> : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>
    );
}