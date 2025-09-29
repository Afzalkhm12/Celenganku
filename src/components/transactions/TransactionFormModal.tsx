'use client';

import * as React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAppToast } from '../../hooks/useAppToast';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { type Category } from '@prisma/client';
import { type SerializableAccount } from '../../app/dashboard/page';
import { type SerializableTransaction } from '../../app/transactions/page';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select'; 

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: SerializableAccount[];
  categories: Category[];
  transaction?: SerializableTransaction | null;
}

export default function TransactionFormModal({ isOpen, onClose, onSuccess, accounts, categories, transaction }: TransactionFormModalProps) {
    const [type, setType] = React.useState(transaction?.type || 'EXPENSE');
    const [amount, setAmount] = React.useState(transaction?.amount.toString() || '');
    const [categoryId, setCategoryId] = React.useState(transaction?.category_id || '');
    const [accountId, setAccountId] = React.useState(transaction?.account_id || accounts[0]?.id || '');
    const [description, setDescription] = React.useState(transaction?.description || '');
    const [transactionDate, setTransactionDate] = React.useState(
        transaction?.transaction_date ? new Date(transaction.transaction_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    );
    const [isLoading, setIsLoading] = React.useState(false);
    const toast = useAppToast();

    const filteredCategories = React.useMemo(() => categories.filter(c => c.type === type), [categories, type]);

    const categoryOptions = filteredCategories.map(c => ({ value: c.id, label: c.name }));
    const accountOptions = accounts.map(a => ({ value: a.id, label: a.name }));

    React.useEffect(() => {
        if (!transaction) {
            if (filteredCategories.length > 0) {
                setCategoryId(filteredCategories[0].id);
            } else {
                setCategoryId(''); 
            }
            if (accounts.length > 0) {
                setAccountId(accounts[0].id);
            }
        }
    }, [type, transaction, filteredCategories, accounts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const url = transaction ? `/api/transactions/${transaction.id}` : '/api/transactions';
        const method = transaction ? 'PUT' : 'POST';

        // FIX: Definisikan tipe payload yang ketat
        type TransactionPayload = {
            amount: number;
            type: string;
            categoryId: string;
            accountId: string;
            description: string;
            transactionDate: string;
        }

        const payload: Partial<TransactionPayload> = { // FIX: Gunakan Partial<T> untuk menghindari error 'any'
            amount: parseFloat(amount),
            type,
            categoryId,
            accountId,
            description,
            transactionDate,
        };

        if (transaction) {
            delete payload.amount;
            delete payload.type;
            delete payload.accountId;
        }

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
        
              if (response.ok) {
                toast.success(`Transaksi berhasil ${transaction ? 'diperbarui' : 'ditambahkan'}!`);
                onSuccess();
              } else {
                const errorData = await response.text();
                toast.error(errorData || `Gagal ${transaction ? 'memperbarui' : 'menambahkan'} transaksi.`);
              }
        } catch (_error) { // FIX: Ganti 'error' menjadi '_error'
            console.error(_error);
            toast.error('Terjadi kesalahan yang tidak terduga.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {!transaction && (
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
            )}
            
            <Input 
                label="Jumlah"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                min="0.01"
                step="0.01"
                required
                disabled={!!transaction} 
            />

             <Select 
                label={`Kategori ${type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}`}
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                options={categoryOptions}
                placeholder={categoryOptions.length === 0 ? "Tidak ada kategori" : "Pilih Kategori"}
                required
                disabled={categoryOptions.length === 0}
            />

            <Select 
                label={type === 'INCOME' ? 'Masuk ke Akun' : 'Diambil dari Akun'}
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                options={accountOptions}
                placeholder={accountOptions.length === 0 ? "Anda belum memiliki akun." : "Pilih Akun"}
                required
                disabled={!!transaction} 
            />
            
            <Input 
                label="Deskripsi (Opsional)"
                type="text" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Contoh: Beli Kopi" 
            />

            <Input
                label="Tanggal Transaksi"
                type="date"
                value={transactionDate}
                onChange={e => setTransactionDate(e.target.value)}
                required
            />

            <div className="flex justify-end pt-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Batal</Button>
              <Button type="submit" className="ml-2" disabled={isLoading || !categoryId || !accountId}>
                {isLoading ? <LoadingSpinner size="sm" color="light" /> : (transaction ? 'Perbarui' : 'Simpan')}
              </Button>
            </div>
          </form>
        </Modal>
      );
}