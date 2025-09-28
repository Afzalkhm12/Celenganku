'use client';

import * as React from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAppToast } from '../../hooks/useAppToast';
import { LoadingSpinner } from '../ui/LoadingSpinner';
// --- PERBAIKAN DI SINI ---
import { type Category } from '@prisma/client';
// Impor tipe baru dari dashboard/page.tsx
import { type SerializableAccount } from '../../app/dashboard/page';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // Gunakan tipe SerializableAccount
  accounts: SerializableAccount[];
  categories: Category[];
}

export default function TransactionFormModal({ isOpen, onClose, onSuccess, accounts, categories }: TransactionFormModalProps) {
    const [type, setType] = React.useState('EXPENSE');
    const [amount, setAmount] = React.useState('');
    const [categoryId, setCategoryId] = React.useState('');
    const [accountId, setAccountId] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [transactionDate, setTransactionDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = React.useState(false);
    const toast = useAppToast();

    const filteredCategories = React.useMemo(() => categories.filter(c => c.type === type), [categories, type]);

    React.useEffect(() => {
        if (isOpen) {
            if (filteredCategories.length > 0) {
                setCategoryId(filteredCategories[0].id);
            } else {
                setCategoryId(''); 
            }
    
            if (accounts.length > 0 && !accountId) {
                setAccountId(accounts[0].id);
            }
        }
    }, [type, isOpen, accounts, filteredCategories]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
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
                toast.success('Transaksi berhasil ditambahkan!');
                onSuccess();
              } else {
                const errorData = await response.text();
                toast.error(errorData || 'Gagal menambahkan transaksi.');
              }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan yang tidak terduga.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tambah Transaksi Baru">
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
    
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah
              </label>
              <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" required />
            </div>
            
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori {type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                </label>
                <p className="text-xs text-gray-500 mb-2">Untuk mengelompokkan jenis transaksi Anda (e.g., Makanan, Gaji).</p>
                <select 
                  id="category" 
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)} 
                  required 
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)
                    ) : (
                        <option disabled value="">
                          Tidak ada kategori untuk tipe ini.
                        </option>
                    )}
                </select>
            </div>
    
            <div>
                <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">
                  {type === 'INCOME' ? 'Masuk ke Akun' : 'Diambil dari Akun'}
                </label>
                <p className="text-xs text-gray-500 mb-2">Sumber atau tujuan dana (e.g., Rekening Bank, E-Wallet, Dompet).</p>
                 <select 
                   id="account" 
                   value={accountId} 
                   onChange={e => setAccountId(e.target.value)} 
                   required 
                   className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                 >
                    {accounts.length > 0 ? (
                        accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)
                    ) : (
                        <option disabled value="">
                          Anda belum memiliki akun.
                        </option>
                    )}
                </select>
            </div>
            
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <Input id="date" type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} required />
            </div>
    
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
                <Input id="description" type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Contoh: Makan siang di warung" />
            </div>
    
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