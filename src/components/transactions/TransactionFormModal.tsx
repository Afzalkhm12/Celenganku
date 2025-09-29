'use client';

import * as React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAppToast } from '../../hooks/useAppToast';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { type Category } from '@prisma/client';
import { type SerializableAccount } from '../../app/dashboard/page';
import { type SerializableTransaction } from '../../app/transactions/page';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: SerializableAccount[];
  categories: Category[];
  transaction?: SerializableTransaction | null;
}

export default function TransactionFormModal({ isOpen, onClose, onSuccess, categories, transaction }: TransactionFormModalProps) {
    const [type] = React.useState(transaction?.type || 'EXPENSE');
    const [amount] = React.useState(transaction?.amount.toString() || '');
    const [categoryId, setCategoryId] = React.useState(transaction?.category_id || '');
    const [accountId] = React.useState(transaction?.account_id || '');
    const [description] = React.useState(transaction?.description || '');
    const [transactionDate] = React.useState(
        transaction?.transaction_date ? new Date(transaction.transaction_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    );
    const [isLoading, setIsLoading] = React.useState(false);
    const toast = useAppToast();

    const filteredCategories = React.useMemo(() => categories.filter(c => c.type === type), [categories, type]);

    React.useEffect(() => {
        if (!transaction) {
            if (filteredCategories.length > 0) {
                setCategoryId(filteredCategories[0].id);
            } else {
                setCategoryId(''); 
            }
        }
    }, [type, transaction, filteredCategories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const url = transaction ? `/api/transactions/${transaction.id}` : '/api/transactions';
        const method = transaction ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  amount: parseFloat(amount),
                  type,
                  categoryId,
                  accountId,
                  description,
                  transactionDate,
                }),
              });
        
              if (response.ok) {
                toast.success(`Transaksi berhasil ${transaction ? 'diperbarui' : 'ditambahkan'}!`);
                onSuccess();
              } else {
                const errorData = await response.text();
                toast.error(errorData || `Gagal ${transaction ? 'memperbarui' : 'menambahkan'} transaksi.`);
              }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan yang tidak terduga.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... form fields ... */}
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